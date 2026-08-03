import Stripe from 'stripe';

/**
 * Serverless funkce (Vercel): ověří u Stripe, že platba reálně proběhla.
 * Frontend po návratu z platby zavolá ?session_id=… a my se Stripe zeptáme,
 * jestli je opravdu zaplaceno — nelze tak podvrhnout „success" v URL.
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).json({ error: 'Chybí session_id.' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === 'paid' || session.status === 'complete';
    return res.status(200).json({
      paid,
      email: session.customer_details?.email || null,
      planName: session.metadata?.planName || null,
      yearly: session.metadata?.yearly === 'true',
    });
  } catch (err) {
    console.error('Verify session error:', err);
    return res.status(500).json({ error: err.message });
  }
}
