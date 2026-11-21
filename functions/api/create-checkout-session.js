import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { json } from '../_utils.js';
import { TRIAL_DAYS, readCampaign, campaignPct, ensureCoupon } from '../_campaign.js';

/** Měl už tenhle e-mail u nás někdy předplatné? (zkušební měsíc jen jednou na osobu) */
async function hadSubscription(stripe, email) {
  const raw = (email || '').trim();
  if (!raw) return false;
  for (const e of new Set([raw, raw.toLowerCase()])) {
    const { data: customers } = await stripe.customers.list({ email: e, limit: 10 });
    for (const c of customers) {
      const { data: subs } = await stripe.subscriptions.list({ customer: c.id, status: 'all', limit: 1 });
      if (subs.length) return true;
    }
  }
  return false;
}

/**
 * Cloudflare Pages Function: vytvoří bezpečnou Stripe Checkout Session
 * pro OPAKOVANÉ PŘEDPLATNÉ. Běží na serveru — tajný klíč se nikdy nedostane do prohlížeče.
 *
 * Platit smí jen PŘIHLÁŠENÝ uživatel s OVĚŘENÝM e-mailem (Authorization: Bearer
 * <Supabase JWT>). E-mail i ID účtu bereme z tokenu, ne z těla požadavku —
 * prohlížeči se nevěří. Frontend pošle { priceId, … } → vrátíme { url }.
 */
export async function onRequestPost({ request, env }) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  try {
    const { priceId, planName, billing, yearly, tg, promoCode, termsAccepted } = (await request.json()) || {};
    if (!priceId) return json({ error: 'Chybí priceId.' }, 400);
    // Souhlas s obchodními podmínkami (čl. 1.3, 5.3, 7.2) je povinný.
    if (termsAccepted !== true) return json({ error: 'Pro pokračování je nutné souhlasit s obchodními podmínkami.', field: 'terms' }, 400);

    // Kdo platí — ověřený token, ověřený e-mail.
    const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'Pro objednávku se nejdřív přihlas.', code: 'auth_required' }, 401);
    const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user) return json({ error: 'Přihlášení vypršelo, přihlas se prosím znovu.', code: 'auth_required' }, 401);
    if (!user.email_confirmed_at) {
      return json({ error: 'Nejdřív potvrď svůj e-mail (odkaz jsme ti poslali při registraci).', code: 'email_unconfirmed' }, 403);
    }
    const email = user.email;
    const userId = user.id;

    // Už aktivní členství → druhé předplatné by se strhávalo souběžně.
    const { data: profile } = await admin.from('profiles').select('plan, subscription_status').eq('id', userId).single();
    if (profile?.plan && profile.subscription_status === 'active') {
      return json({ error: 'Členství už máš aktivní.', code: 'already_member' }, 409);
    }

    // Odkud uživatel přišel (pro návratové URL)
    const origin = request.headers.get('origin') || new URL(request.url).origin;
    const meta = { planName: planName || '', billing: billing || '', yearly: String(!!yearly), userId };
    // Atribuce z Telegramu (?tg=…) — jen když je; Stripe metadata hodnota max. 500 znaků.
    if (typeof tg === 'string' && tg.trim()) meta.tg = tg.trim().slice(0, 500);
    // Doklad o souhlasu s podmínkami (čas odeslání objednávky).
    meta.termsAcceptedAt = new Date().toISOString();

    // Kampaň (přepínače v administraci): měsíc zdarma u všech délek členství
    // a sleva na první placené období. Rozhoduje server, ne prohlížeč; obojí
    // jen pro e-mail, který u nás ještě předplatné neměl.
    const price = await stripe.prices.retrieve(priceId);
    const campaign = await readCampaign(admin);
    const firstTime = (campaign.trial || campaign.discount) && !(await hadSubscription(stripe, email));
    const trial = campaign.trial && firstTime;
    // Slevový kód zadaný zákazníkem úvodní slevu NAHRAZUJE (nesčítají se).
    const hasPromo = typeof promoCode === 'string' && promoCode.trim() !== '';
    const pct = campaign.discount && firstTime && !hasPromo ? campaignPct(price) : 0;

    // Slevový kód zadaný v naší pokladně → uplatníme ho rovnou při vytvoření session.
    // (Pole pro kód na stránce Stripe v live režimu kódy odmítá jako neplatné,
    // přes API uplatněný kód funguje.) Discounts a allow_promotion_codes nejdou spolu.
    let discounts;
    const code = typeof promoCode === 'string' ? promoCode.trim().toUpperCase() : '';
    if (code) {
      const { data } = await stripe.promotionCodes.list({ code, active: true, limit: 1 });
      if (!data.length) return json({ error: 'Neplatný nebo vypršelý slevový kód.', field: 'promoCode' }, 400);
      discounts = [{ promotion_code: data[0].id }];
    } else if (pct && !trial) {
      // Bez zkušební doby je první placená faktura hned ta první → kupón rovnou do pokladny.
      discounts = [{ coupon: await ensureCoupon(stripe, pct) }];
    }
    // Se zkušební dobou kupón přidá webhook (checkout.session.completed) až k
    // vytvořenému předplatnému, aby nepadl na 0 Kč fakturu zkušební doby.
    const subMeta = pct && trial ? { ...meta, campaignPct: String(pct) } : meta;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', // opakované předplatné
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      client_reference_id: userId, // ke kterému účtu platba patří
      ...(discounts ? { discounts } : { allow_promotion_codes: true }), // slevové kódy
      billing_address_collection: 'auto',
      metadata: meta,
      // Karta se zadává vždy (i při 0 Kč ve zkušebním měsíci) — po jeho konci se z ní strhne první platba.
      payment_method_collection: 'always',
      subscription_data: {
        metadata: subMeta,
        ...(trial ? {
          trial_period_days: TRIAL_DAYS,
          // Bez platební metody na konci zkušební doby předplatné zruš (neposílej nezaplacenou fakturu).
          trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
        } : {}),
      },
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancel`,
      locale: 'cs',
    });

    return json({ url: session.url, trial, discountPct: pct });
  } catch (err) {
    // Kód existuje, ale nejde uplatnit (vyčerpaný, po platnosti, jiný produkt…)
    if (String(err.param || '').startsWith('discounts')) {
      return json({ error: 'Tento slevový kód už nejde uplatnit (vyčerpaný nebo po platnosti).', field: 'promoCode' }, 400);
    }
    console.error('Stripe checkout error:', err);
    return json({ error: err.message }, 500);
  }
}
