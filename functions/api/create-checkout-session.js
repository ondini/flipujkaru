import Stripe from 'stripe';
import { json } from '../_utils.js';

/**
 * Cloudflare Pages Function: vytvoří bezpečnou Stripe Checkout Session
 * pro OPAKOVANÉ PŘEDPLATNÉ. Běží na serveru — tajný klíč se nikdy nedostane do prohlížeče.
 *
 * Frontend pošle { priceId, email } → vrátíme { url } a přesměrujeme uživatele na Stripe.
 */
export async function onRequestPost({ request, env }) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  try {
    const { priceId, email, planName, yearly, userId } = (await request.json()) || {};
    if (!priceId) return json({ error: 'Chybí priceId.' }, 400);

    // Odkud uživatel přišel (pro návratové URL)
    const origin = request.headers.get('origin') || new URL(request.url).origin;
    const meta = { planName: planName || '', yearly: String(!!yearly), userId: userId || '' };

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', // opakované předplatné
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      client_reference_id: userId || undefined, // ke kterému účtu platba patří
      allow_promotion_codes: true, // slevové kódy
      billing_address_collection: 'auto',
      metadata: meta,
      subscription_data: { metadata: meta },
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancel`,
      locale: 'cs',
    });

    return json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return json({ error: err.message }, 500);
  }
}
