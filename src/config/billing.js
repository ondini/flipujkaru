/* ============================================================
   Mapování jediného členského plánu na Stripe Price ID (roční předplatné).
   Price ID NENÍ tajný (smí být v prohlížeči) — tajný je jen
   STRIPE_SECRET_KEY, který žije pouze na serveru (api/).
============================================================ */
export const PRICE_IDS = {
  // TODO: nahraď skutečným Price ID ročního členství 14 999 Kč ze Stripe dashboardu.
  AKADEMIE: 'price_REPLACE_WITH_YOUR_ANNUAL_PRICE_ID',
};

/** Vrátí Stripe Price ID pro daný plán. */
export function priceIdFor(planName) {
  return PRICE_IDS[planName] || null;
}

/** Dokud není vyplněné reálné Price ID, jedeme v „demo" režimu (mock pokladna). */
export const STRIPE_READY = !Object.values(PRICE_IDS).some((id) => id.startsWith('price_REPLACE'));
