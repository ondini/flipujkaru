import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { json } from '../_utils.js';

/**
 * Cloudflare Pages Function. Zapíše zaplacené členství k přihlášenému uživateli
 * (tabulka profiles). Bezpečnost: uživatele zjistíme z jeho přihlašovacího tokenu
 * (ne z prohlížeče) a platbu vždy ověříme přímo u Stripe.
 *
 * Dva režimy:
 *  • { sessionId } — po návratu z platby: ověří konkrétní Checkout Session.
 *  • {} (bez sessionId) — „dohledání": plátce zavřel záložku dřív, než si založil
 *    účet (pay-first), a vrací se jinde. Najde aktivní předplatné u Stripe podle
 *    e-mailu účtu, které ještě nepatří žádnému jinému účtu.
 */

/** Předplatné odpovídající našemu členství (metadata nastavuje create-checkout-session). */
const isMembership = (sub) => !!sub?.metadata?.planName && ['active', 'trialing'].includes(sub.status);

/** Konec zaplaceného období — kompatibilně přes starší i novější ("basil") tvar API. */
function periodEndISO(sub) {
  const unix = sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end ?? null;
  return unix ? new Date(unix * 1000).toISOString() : null;
}

/** Patří už předplatné jinému účtu? (jedno předplatné = jedno členství) */
async function linkedElsewhere(admin, subId, userId) {
  if (!subId) return false;
  const { data } = await admin.from('profiles').select('id').eq('stripe_subscription_id', subId).neq('id', userId).limit(1);
  return !!data?.length;
}

/** Aktivní předplatné členství na e-mail účtu, které ještě nikomu nepatří. */
async function findByEmail(stripe, admin, user) {
  const raw = (user.email || '').trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();

  // Kandidáti: { subId, customerId, sessionId }
  const candidates = [];
  // 1) Zákazník se stejným e-mailem — Stripe filtruje přesnou shodou (i velikost písmen).
  for (const email of new Set([raw, lower])) {
    const { data: customers } = await stripe.customers.list({ email, limit: 10 });
    for (const c of customers) {
      const { data: subs } = await stripe.subscriptions.list({ customer: c.id, status: 'all', limit: 10 });
      subs.filter(isMembership).forEach((s) => candidates.push({ sub: s, customerId: c.id }));
    }
  }
  // 2) Zadal-li plátce e-mail jinými písmeny (Jan.Novak@…), přesná shoda ho mine
  //    a vyhledávání Stripe má zpoždění indexu. Dohledání řeší čerstvé platby
  //    (zavřená záložka), takže stačí projít posledních 100 dokončených plateb.
  if (!candidates.length) {
    const { data: sessions } = await stripe.checkout.sessions.list({ status: 'complete', limit: 100 });
    for (const cs of sessions) {
      if (cs.mode !== 'subscription' || !cs.subscription) continue;
      if ((cs.customer_details?.email || '').trim().toLowerCase() !== lower) continue;
      const s = await stripe.subscriptions.retrieve(cs.subscription);
      if (isMembership(s)) candidates.push({ sub: s, customerId: cs.customer || null, sessionId: cs.id });
    }
  }

  for (const c of candidates) {
    if (await linkedElsewhere(admin, c.sub.id, user.id)) continue;
    // Checkout Session předplatného — kvůli odkazu do Telegramu (start=paid_<id>).
    if (!c.sessionId) {
      const { data: sessions } = await stripe.checkout.sessions.list({ subscription: c.sub.id, limit: 1 });
      c.sessionId = sessions[0]?.id || null;
    }
    return c;
  }
  return null;
}

export async function onRequestPost({ request, env }) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    const token = (request.headers.get('authorization') || '').replace('Bearer ', '');
    const { sessionId } = (await request.json().catch(() => ({}))) || {};
    if (!token) return json({ error: 'Nepřihlášeno.' }, 401);

    // Kdo je přihlášený (ověření tokenu)
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: 'Neplatné přihlášení.' }, 401);
    const user = userData.user;

    let sub, customerId, checkoutSessionId, sessionPlan = null;
    if (sessionId) {
      // Ověř konkrétní platbu u Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
      const paid = session.payment_status === 'paid' || session.status === 'complete';
      if (!paid) return json({ error: 'Platba neproběhla.' }, 400);
      sub = session.subscription;
      if (typeof sub === 'string') sub = await stripe.subscriptions.retrieve(sub);
      if (await linkedElsewhere(admin, sub?.id, user.id)) return json({ error: 'Tato platba už patří jinému účtu.' }, 409);
      customerId = session.customer || null;
      checkoutSessionId = session.id;
      sessionPlan = session.metadata?.planName || null;
    } else {
      const found = await findByEmail(stripe, admin, user);
      if (!found) return json({ ok: false, found: false });
      ({ sub, customerId, sessionId: checkoutSessionId } = found);
    }

    // Zapiš členství k uživateli (service role obejde RLS)
    const planName = sub?.metadata?.planName || sessionPlan;
    const { error: upErr } = await admin
      .from('profiles')
      .update({
        plan: planName,
        subscription_status: 'active',
        stripe_customer_id: customerId,
        stripe_subscription_id: sub?.id || null,
        current_period_end: periodEndISO(sub),
      })
      .eq('id', user.id);
    if (upErr) throw upErr;

    // ID Checkout Session pro „Propojit Telegram" v kabinetu. Zvlášť a bez throw:
    // dokud neběží migrace (supabase/membership.sql), aktivace funguje dál.
    if (checkoutSessionId) await admin.from('profiles').update({ stripe_checkout_session_id: checkoutSessionId }).eq('id', user.id);

    return json({ ok: true, plan: planName, yearly: sub?.metadata?.yearly === 'true', sessionId: checkoutSessionId });
  } catch (err) {
    console.error('activate-membership error:', err);
    return json({ error: err.message }, 500);
  }
}
