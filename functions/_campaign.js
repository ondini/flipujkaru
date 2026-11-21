/* ============================================================
   Kampaň „měsíc zdarma + sleva na první placené období".

   Oba prvky jde zapnout/vypnout v administraci (Nastavení → Kampaň).
   Přepínače žijí v tabulce `content` (klíč → hodnota), stejně jako
   editovatelné texty webu:
     • promo_trial    = 'on' | 'off'  (chybí → ZAPNUTO, dosavadní chování)
     • promo_discount = 'on' | 'off'  (chybí → VYPNUTO)

   Sleva podle délky členství (zjišťujeme z ceny ve Stripe, ne z prohlížeče):
     1 měsíc → 15 %, 4 měsíce → 20 %, 12 měsíců → 25 %.
   Kupóny ve Stripe si kód založí sám při prvním použití (pevná ID níže),
   ve Stripe Dashboardu se nic nastavovat nemusí.
============================================================ */

export const TRIAL_DAYS = 30;

/** Výchozí hodnoty přepínačů, když v DB nic není. */
const DEFAULTS = { promo_trial: 'on', promo_discount: 'off' };

/** Načte přepínače kampaně z tabulky `content` (service role). */
export async function readCampaign(admin) {
  const { data } = await admin.from('content').select('key, value').in('key', Object.keys(DEFAULTS));
  const v = { ...DEFAULTS, ...Object.fromEntries((data || []).map((r) => [r.key, r.value])) };
  return { trial: v.promo_trial !== 'off', discount: v.promo_discount === 'on' };
}

/** Délka fakturačního období ceny v měsících (null = neznámá / jednorázová). */
function periodMonths(price) {
  const r = price?.recurring;
  if (!r) return null;
  const n = r.interval_count || 1;
  if (r.interval === 'month') return n;
  if (r.interval === 'year') return 12 * n;
  return null;
}

/** Sleva na první placené období podle délky členství (v %), jinak 0. */
export function campaignPct(price) {
  return { 1: 15, 4: 20, 12: 25 }[periodMonths(price)] || 0;
}

/** Kupón „−X % na první placené období" — založí ho, pokud ještě neexistuje. */
export async function ensureCoupon(stripe, pct) {
  const id = `FK_FIRST_${pct}`;
  try {
    return (await stripe.coupons.retrieve(id)).id;
  } catch (err) {
    if (err?.code !== 'resource_missing') throw err;
  }
  try {
    const c = await stripe.coupons.create({
      id,
      percent_off: pct,
      duration: 'once', // jen jedna (první placená) faktura
      name: `Úvodní sleva ${pct} % – první placené období`,
    });
    return c.id;
  } catch (err) {
    // Souběžný požadavek ho mezitím založil.
    if (err?.code === 'resource_already_exists') return id;
    throw err;
  }
}

/**
 * Předplatné ve zkušební době s nárokem na slevu (metadata.campaignPct) →
 * přidej kupón. Zkušební (0 Kč) faktura už v tu chvíli existuje, takže
 * jednorázový kupón dopadne na PRVNÍ PLACENOU fakturu po konci zkušební doby.
 * Idempotentní (metadata.campaignApplied), lze volat z více webhooků.
 */
export async function applyCampaignDiscount(stripe, subOrId) {
  const sub = typeof subOrId === 'string' ? await stripe.subscriptions.retrieve(subOrId) : subOrId;
  const pct = Number(sub?.metadata?.campaignPct || 0);
  if (!pct || sub.metadata.campaignApplied === 'true') return false;
  // Jen ve zkušební době — po jejím konci by kupón padl až na DRUHOU placenou fakturu.
  if (sub.status !== 'trialing') return false;
  const coupon = await ensureCoupon(stripe, pct);
  await stripe.subscriptions.update(sub.id, {
    discounts: [{ coupon }],
    metadata: { campaignApplied: 'true' },
  });
  return true;
}
