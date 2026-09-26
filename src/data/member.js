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
  { key: 'komunita', label: 'Komunita', icon: 'Users' },
  { key: 'faktury', label: 'Faktury', icon: 'Receipt' },
  { key: 'nastaveni', label: 'Nastavení', icon: 'Settings' },
];

/** Onboarding kroky (uvítací checklist na přehledu) */
export const ONBOARDING = [
  { key: 'profil', label: 'Vyplň si profil', hint: 'Jméno a parametry hlídače' },
  { key: 'kurz', label: 'Projdi první lekci', hint: 'Základy car flippingu' },
  { key: 'doporucene', label: 'Projdi doporučené flipy', hint: 'Značky, cena, rozdíl od trhu' },
  { key: 'flip', label: 'Zaznamenej první flip', hint: 'Sleduj svůj zisk' },
];

/** Žebříček komunity (ukázkový) */
export const LEADERBOARD = [
  { rank: 1, name: 'Tomáš H.', flips: 14, profit: 612000 },
  { rank: 2, name: 'Petra K.', flips: 11, profit: 498000 },
  { rank: 3, name: 'Martin D.', flips: 9, profit: 421000 },
  { rank: 4, name: 'Ty', flips: 3, profit: 184000, me: true },
  { rank: 5, name: 'Jakub V.', flips: 3, profit: 162000 },
];

/** Poslední úspěchy komunity (feed) */
export const COMMUNITY_WINS = [
  { name: 'Lukáš R.', text: 'prodal BMW 330i se ziskem', profit: 71000, time: 'před 2 h' },
  { name: 'Jana M.', text: 'dokončila kurz Vyjednávání', profit: 0, time: 'před 5 h' },
  { name: 'David P.', text: 'koupil Audi A6 −15 % pod trhem', profit: 0, time: 'včera' },
  { name: 'Ondřej B.', text: 'prodal Golf GTI', profit: 44000, time: 'včera' },
];

/** Rychlé statistiky na přehledu */
export const DASH_STATS = [
  { label: 'Ušetřeno přes kalkulačku', value: '184 000 Kč', icon: 'PiggyBank' },
  { label: 'Tvé flipy', value: '3', icon: 'Car' },
  { label: 'Body v komunitě', value: '1 240', icon: 'Trophy' },
];

/** Vzdělávací materiály s progresem */
export const COURSES = [
  { title: 'Základy car flippingu', lessons: 12, done: 12 },
  { title: 'Jak číst inzerát a odhalit vadu', lessons: 9, done: 6 },
  { title: 'Dovoz ze zahraničí krok za krokem', lessons: 8, done: 2 },
  { title: 'Vyjednávání a prodej se ziskem', lessons: 10, done: 0 },
];

/** Historie faktur */
export const INVOICES = [
  { id: 'FV-2026-0142', date: '15. 6. 2026', item: 'Členství AKADEMIE', amount: 14999, status: 'Zaplaceno' },
];
