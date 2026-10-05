/* ============================================================
   Členství AKADEMIE — tři varianty podle frekvence platby.
   Všechny dávají STEJNÝ přístup; liší se jen intervalem, ve
   kterém Stripe strhává platbu (a tím i cenou).

   priceId NENÍ tajný (smí do prohlížeče). Tajný je jen
   STRIPE_SECRET_KEY, který žije pouze na serveru (functions/api/).

   ── Nastavení ve Stripe ──────────────────────────────────
   Jeden Product „Členství AKADEMIE" + tři OPAKOVANÉ (recurring) Prices:
     • 1 měsíc   → interval = month, count 1   → 1 990 Kč
     • 4 měsíce  → interval = month, count 4   → 5 990 Kč
     • 12 měsíců → interval = year  (nebo month×12) → 14 990 Kč
   Výchozí hodnoty priceId níže jsou LIVE (ostrý provoz) — zapečou se do
   produkčního buildu. Pro lokální testování je přebij TEST hodnotami
   v .env (VITE_STRIPE_PRICE_*, viz .env.example); ty se do produkčního
   buildu na Cloudflare nedostanou, takže prod vždy jede na LIVE cenách.
   Režim ceny musí sedět s režimem STRIPE_SECRET_KEY (test klíč + live
   cena = chyba „No such price").
============================================================ */
const env = import.meta.env;

export const BILLING_OPTIONS = [
  {
    id: 'monthly',
    label: '1 měsíc',
    months: 1,
    price: 1990,
    period: 'měsíc',
    note: 'Účtováno každý měsíc',
    priceId: env.VITE_STRIPE_PRICE_MONTHLY || 'price_1ULUavCMiFqAOCKZxJt0KSrc',
  },
  {
    id: 'quarterly',
    label: '4 měsíce',
    months: 4,
    price: 5990,
    period: '4 měsíce',
    note: 'Účtováno každé 4 měsíce',
    badge: 'Oblíbené',
    priceId: env.VITE_STRIPE_PRICE_QUARTERLY || 'price_1ULUhYCMiFqAOCKZcUExFBBn',
  },
  {
    id: 'yearly',
    label: '12 měsíců',
    months: 12,
    price: 14990,
    period: 'rok',
    note: 'Účtováno ročně',
    badge: 'Nejvýhodnější',
    priceId: env.VITE_STRIPE_PRICE_YEARLY || 'price_1ULUhXCMiFqAOCKZLappdPMn',
  },
];

/** Varianta předvybraná v ceníku (nejvýhodnější = roční). */
export const DEFAULT_BILLING =
  BILLING_OPTIONS.find((o) => o.id === 'yearly') || BILLING_OPTIONS[0];

/** Přepočet na cenu za měsíc (pro štítky „ušetříš"). */
export const perMonth = (o) => Math.round(o.price / o.months);

/** Najde variantu podle id (fallback na výchozí). */
export const billingById = (id) =>
  BILLING_OPTIONS.find((o) => o.id === id) || DEFAULT_BILLING;

/** Dokud nejsou vyplněná reálná Price ID, jedeme v „demo" režimu (mock pokladna). */
export const STRIPE_READY = !BILLING_OPTIONS.some((o) =>
  o.priceId.startsWith('price_REPLACE')
);
