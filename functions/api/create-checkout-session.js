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
    const { priceId, email, planName, billing, yearly, userId, tg, promoCode } = (await request.json()) || {};
    if (!priceId) return json({ error: 'Chybí priceId.' }, 400);

    // Odkud uživatel přišel (pro návratové URL)
    const origin = request.headers.get('origin') || new URL(request.url).origin;
    const meta = { planName: planName || '', billing: billing || '', yearly: String(!!yearly), userId: userId || '' };
    // Atribuce z Telegramu (?tg=…) — jen když je; Stripe metadata hodnota max. 500 znaků.
    if (typeof tg === 'string' && tg.trim()) meta.tg = tg.trim().slice(0, 500);

    // Slevový kód zadaný v naší pokladně → uplatníme ho rovnou při vytvoření session.
    // (Pole pro kód na stránce Stripe v live režimu kódy odmítá jako neplatné,
    // přes API uplatněný kód funguje.) Discounts a allow_promotion_codes nejdou spolu.
    let discounts;
    const code = typeof promoCode === 'string' ? promoCode.trim().toUpperCase() : '';
    if (code) {
      const { data } = await stripe.promotionCodes.list({ code, active: true, limit: 1 });
      if (!data.length) return json({ error: 'Neplatný nebo vypršelý slevový kód.', field: 'promoCode' }, 400);
      discounts = [{ promotion_code: data[0].id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', // opakované předplatné
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      client_reference_id: userId || undefined, // ke kterému účtu platba patří
      ...(discounts ? { discounts } : { allow_promotion_codes: true }), // slevové kódy
      billing_address_collection: 'auto',
      metadata: meta,
      subscription_data: { metadata: meta },
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancel`,
      locale: 'cs',
    });

    return json({ url: session.url });
  } catch (err) {
    // Kód existuje, ale nejde uplatnit (vyčerpaný, po platnosti, jiný produkt…)
    if (String(err.param || '').startsWith('discounts')) {
      return json({ error: 'Tento slevový kód už nejde uplatnit (vyčerpaný nebo po platnosti).', field: 'promoCode' }, 400);
    }
    console.error('Stripe checkout error:', err);
    return json({ error: err.message }, 500);
  }
}
