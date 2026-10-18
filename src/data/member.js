/* ============================================================
   Mock data pro klientskou administraci (po zaplacení členství).
============================================================ */

/** Sekce v levém menu dashboardu (icon = název Lucide ikony) */
export const DASH_NAV = [
  { key: 'prehled', label: 'Přehled', icon: 'LayoutDashboard' },
  { key: 'flipy', label: 'Moje flipy', icon: 'TrendingUp' },
  { key: 'zebricky', label: 'Žebříčky', icon: 'Trophy' },
  { key: 'kalkulacka', label: 'Kalkulačka', icon: 'Calculator' },
  { key: 'doporucene', label: 'Doporučené flipy', icon: 'Sparkles' },
  { key: 'materialy', label: 'Mé materiály', icon: 'GraduationCap' },
  { key: 'faktury', label: 'Faktury', icon: 'Receipt' },
  { key: 'nastaveni', label: 'Nastavení', icon: 'Settings' },
];

/** Onboarding kroky (uvítací checklist na přehledu) */
export const ONBOARDING = [
  { key: 'profil', label: 'Vyplň si profil', hint: 'Jméno a parametry hlídače' },
  { key: 'kurz', label: 'Projdi první lekci', hint: 'Kurzy v Mých materiálech' },
  { key: 'doporucene', label: 'Projdi doporučené flipy', hint: 'Značky, cena, rozdíl od trhu' },
  { key: 'flip', label: 'Zaznamenej první flip', hint: 'Sleduj svůj zisk' },
];

/** Rychlé statistiky na přehledu */
export const DASH_STATS = [
  { label: 'Ušetřeno přes kalkulačku', value: '184 000 Kč', icon: 'PiggyBank' },
  { label: 'Tvé flipy', value: '3', icon: 'Car' },
];

/** Historie faktur */
export const INVOICES = [
  { id: 'FV-2026-0142', date: '15. 6. 2026', item: 'Členství AKADEMIE', amount: 14999, status: 'Zaplaceno' },
];
