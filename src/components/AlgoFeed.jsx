import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { ALGO_FEED, czk } from '../data/content.js';

const TIMES = ['právě teď', 'před 1 min', 'před 3 min', 'před 6 min'];

/** Fisher-Yates zamíchání — nová náhodná pořadí pro každou návštěvu. */
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Živý feed notifikací algoritmu — rotuje ~200 zamíchaných záznamů, ať se
 *  jednomu uživateli za běžnou návštěvu vůbec nezacyklí. */
export default function AlgoFeed() {
  const order = useRef(shuffled(ALGO_FEED));
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let id;
    const scheduleNext = () => {
      const delay = 5000 + Math.random() * 10000; // 5–15 s, nepravidelně
      id = setTimeout(() => {
        setTick((t) => t + 1);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(id);
  }, []);
  // Position 0 = nejnovější (nahoře), starší záznamy je posouvá dolů.
  const len = order.current.length;
  const items = Array.from({ length: 4 }, (_, i) => order.current[((tick - i) % len + len) % len]);

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-ink-950 p-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
          <Bell className="h-4 w-4 text-accent" /> Live feed algoritmu
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> LIVE
        </span>
      </div>
      <div className="mt-4 space-y-2.5">
        {items.map((it, i) => (
          <div
            key={`${tick}-${i}`}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
              i === 0 ? 'animate-fade-up border-accent/30 bg-accent-soft' : 'border-white/5 bg-white/5'
            }`}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-850 text-accent">
              <Bell className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{it.car}</div>
              <div className="truncate text-xs text-zinc-500">{it.loc} · {czk(it.price)} · {TIMES[i]}</div>
            </div>
            <span className="shrink-0 rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-ink-950">{it.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
