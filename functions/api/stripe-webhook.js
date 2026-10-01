import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { json } from '../_utils.js';

/**
 * Cloudflare Pages Function: Stripe webhook.
 * Zdroj pravdy o stavu předplatného — Stripe nám sám pošle událost pokaždé,
 * když se něco stane (zaplaceno, obnoveno, zrušeno), i když uživatel zavře
 * záložku a nikdy se nevrátí zpět do aplikace. Tím se `activate-membership`
 * (běží jen při návratu) doplňuje o spolehlivé dorovnání stavu.
 *
 * Nastavení: Stripe Dashboard → Developers → Webhooks → přidej endpoint
 * https://<doména>/api/stripe-webhook a vyber události:
 *   checkout.session.completed, customer.subscription.updated,
 *   customer.subscription.deleted, invoice.payment_failed
 * Podpisové tajemství (whsec_…) ulož jako STRIPE_WEBHOOK_SECRET.
 */

/** Konec zaplaceného období — kompatibilně přes starší i novější ("basil") tvar API. */
function periodEndISO(sub) {
  const unix = sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end ?? null;
  return unix ? new Date(unix * 1000).toISOString() : null;
}

export async function onRequestPost({ request, env }) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const sig = request.headers.get('stripe-signature');
  if (!sig) return json({ error: 'Chybí podpis.' }, 400);

  // Podpis se ověřuje z RAW těla (žádné parsování před ověřením).
  const payload = await request.text();

  let event;
  try {
    // Workers runtime → asynchronní varianta s Web Crypto (sync `constructEvent` zde nefunguje).
    event = await stripe.webhooks.constructEventAsync(
      payload,
      sig,
      env.STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    console.error('Neplatný podpis webhooku:', err.message);
    return json({ error: `Webhook signature verification failed: ${err.message}` }, 400);
  }

  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    switch (event.type) {
      // Platba dokončena — zapiš/dorovnej členství k uživateli.
      case 'checkout.session.completed': {
        const session = event.data.object;
        const paid = session.payment_status === 'paid' || session.status === 'complete';
        // Ke kterému účtu platba patří (nastaveno v create-checkout-session).
        const userId = session.client_reference_id || session.metadata?.userId || null;
        if (!paid || !userId) break; // pay-first bez účtu doplní activate-membership po registraci

        let sub = null;
        if (session.subscription) {
          sub = await stripe.subscriptions.retrieve(session.subscription);
        }
        await admin
          .from('profiles')
          .update({
            plan: session.metadata?.planName || null,
            subscription_status: 'active',
            stripe_customer_id: session.customer || null,
            stripe_subscription_id: sub?.id || (typeof session.subscription === 'string' ? session.subscription : null),
            current_period_end: periodEndISO(sub),
          })
          .eq('id', userId);
        break;
      }

      // Obnovení / změna předplatného — dorovnej stav a datum konce období.
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        await admin
          .from('profiles')
          .update({
            subscription_status: sub.status === 'active' || sub.status === 'trialing' ? 'active' : sub.status,
            current_period_end: periodEndISO(sub),
          })
          .eq('stripe_subscription_id', sub.id);
        break;
      }

      // Zrušené předplatné — odeber přístup.
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await admin
          .from('profiles')
          .update({ subscription_status: 'canceled' })
          .eq('stripe_subscription_id', sub.id);
        break;
      }

      // Neúspěšná platba (např. při obnově) — označ jako po splatnosti.
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (subId) {
          await admin
            .from('profiles')
            .update({ subscription_status: 'past_due' })
            .eq('stripe_subscription_id', subId);
        }
        break;
      }

      default:
        break; // ostatní události ignorujeme
    }

    return json({ received: true });
  } catch (err) {
    console.error('Zpracování webhooku selhalo:', err);
    // 500 → Stripe událost zopakuje (retry).
    return json({ error: err.message }, 500);
  }
}
