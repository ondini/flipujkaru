import Stripe from 'stripe';
import { json } from '../_utils.js';

/**
 * Cloudflare Pages Function: ověří u Stripe, že platba reálně proběhla.
 * Frontend po návratu z platby zavolá ?session_id=… a my se Stripe zeptáme,
 * jestli je opravdu zaplaceno — nelze tak podvrhnout „success" v URL.
 */
export async function onRequestGet({ request, env }) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const sessionId = new URL(request.url).searchParams.get('session_id');
  if (!sessionId) return json({ error: 'Chybí session_id.' }, 400);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === 'paid' || session.status === 'complete';
    return json({
      paid,
      email: session.customer_details?.email || null,
      planName: session.metadata?.planName || null,
      yearly: session.metadata?.yearly === 'true',
    });
  } catch (err) {
    console.error('Verify session error:', err);
    return json({ error: err.message }, 500);
  }
}
