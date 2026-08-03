import Stripe from 'stripe';

/**
 * Serverless funkce (Vercel): vytvoří bezpečnou Stripe Checkout Session
 * pro OPAKOVANÉ PŘEDPLATNÉ. Běží na serveru — tajný klíč se nikdy nedostane do prohlížeče.
 *
 * Frontend pošle { priceId, email } → vrátíme { url } a přesměrujeme uživatele na Stripe.
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, email, planName, yearly, userId } = req.body || {};
    if (!priceId) return res.status(400).json({ error: 'Chybí priceId.' });

    // Odkud uživatel přišel (pro návratové URL)
    const origin = req.headers.origin || `https://${req.headers.host}`;
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

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
}
