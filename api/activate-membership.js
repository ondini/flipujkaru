import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

/**
 * Po návratu z platby: ověří u Stripe, že je zaplaceno, a zapíše členství
 * k přihlášenému uživateli do databáze (tabulka profiles).
 * Bezpečnost: uživatele zjistíme z jeho přihlašovacího tokenu (ne z prohlížeče).
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const { sessionId } = req.body || {};
    if (!token) return res.status(401).json({ error: 'Nepřihlášeno.' });
    if (!sessionId) return res.status(400).json({ error: 'Chybí sessionId.' });

    // Kdo je přihlášený (ověření tokenu)
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Neplatné přihlášení.' });
    const user = userData.user;

    // Ověř platbu u Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
    const paid = session.payment_status === 'paid' || session.status === 'complete';
    if (!paid) return res.status(400).json({ error: 'Platba neproběhla.' });

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

    return res.status(200).json({ ok: true, plan: session.metadata?.planName, yearly: session.metadata?.yearly === 'true' });
  } catch (err) {
    console.error('activate-membership error:', err);
    return res.status(500).json({ error: err.message });
  }
}
