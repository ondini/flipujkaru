/* Telegram: atribuce návštěvníka (?tg=…) a odkaz do bota po zaplacení. */

const TG_KEY = 'flipuj_tg';
const TG_TTL = 30 * 24 * 60 * 60 * 1000; // 30 dní — před platbou se může ještě proklikat po webu
const PAID_KEY = 'fk_paid_session'; // ID zaplacené Checkout Session (pro tlačítko Telegramu)

/** Přišel návštěvník s ?tg=…? Ulož hodnotu do localStorage na 30 dní. */
export function captureTg() {
  try {
    const tg = new URLSearchParams(window.location.search).get('tg')?.trim();
    if (tg) localStorage.setItem(TG_KEY, JSON.stringify({ v: tg.slice(0, 200), exp: Date.now() + TG_TTL }));
  } catch { /* localStorage nemusí být dostupné (privátní režim) */ }
}

/** Platná uložená hodnota tg, jinak undefined (prošlou smaže). */
export function getTg() {
  try {
    const saved = JSON.parse(localStorage.getItem(TG_KEY) || 'null');
    if (saved?.v && saved.exp > Date.now()) return saved.v;
    localStorage.removeItem(TG_KEY);
  } catch { /* poškozená hodnota / nedostupné úložiště */ }
  return undefined;
}

/** Deep-link do bota, který podle session_id ověří platbu a pustí do skupiny členů. */
export const telegramLink = (sessionId) => `https://t.me/flipujkaru_bot?start=paid_${sessionId}`;

export function savePaidSession(sessionId) {
  try { localStorage.setItem(PAID_KEY, sessionId); } catch { /* nevadí */ }
}

export function getPaidSession() {
  try { return localStorage.getItem(PAID_KEY) || null; } catch { return null; }
}
