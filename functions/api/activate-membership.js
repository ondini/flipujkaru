import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { json } from '../_utils.js';

/**
 * Cloudflare Pages Function. Po návratu z platby: ověří u Stripe, že je zaplaceno,
 * a zapíše členství k přihlášenému uživateli do databáze (tabulka profiles).
 * Bezpečnost: uživatele zjistíme z jeho přihlašovacího tokenu (ne z prohlížeče).
 */
export async function onRequestPost({ request, env }) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    const token = (request.headers.get('authorization') || '').replace('Bearer ', '');
    const { sessionId } = (await request.json()) || {};
    if (!token) return json({ error: 'Nepřihlášeno.' }, 401);
    if (!sessionId) return json({ error: 'Chybí sessionId.' }, 400);

    // Kdo je přihlášený (ověření tokenu)
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: 'Neplatné přihlášení.' }, 401);
    const user = userData.user;

    // Ověř platbu u Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
    const paid = session.payment_status === 'paid' || session.status === 'complete';
    if (!paid) return json({ error: 'Platba neproběhla.' }, 400);

    const sub = session.subscription;
    const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;

    // Zapiš členství k uživateli (service role obejde RLS)
    const { error: upErr } = await admin
      .from('profiles')
      .update({
        plan: session.metadata?.planName || null,
        subscription_status: 'active',
        stripe_customer_id: session.customer || null,
        stripe_subscription_id: typeof sub === 'string' ? sub : sub?.id || null,
        current_period_end: periodEnd,
      })
      .eq('id', user.id);
    if (upErr) throw upErr;

    return json({ ok: true, plan: session.metadata?.planName, yearly: session.metadata?.yearly === 'true' });
  } catch (err) {
    console.error('activate-membership error:', err);
    return json({ error: err.message }, 500);
  }
}
