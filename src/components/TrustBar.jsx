import { FileCheck2, ShieldCheck, Undo2, Headset, Star, BadgeCheck, Users } from 'lucide-react';
import { GUARANTEES, RATINGS } from '../data/content.js';
import Reveal from './Reveal.jsx';

const ICONS = { FileCheck2, ShieldCheck, Undo2, Headset, Star, BadgeCheck, Users };

/** Pruh důvěry hned pod hero: hodnocení + 4 garance. */
export default function TrustBar() {
  return (
    <section className="relative border-y border-white/5 bg-ink-900/40 py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-6">
        {/* Hodnocení (Google / Heureka / komunita) */}
        <Reveal className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-10">
          {RATINGS.map((r) => {
            const Icon = ICONS[r.icon];
            return (
              <div key={r.source} className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-lg font-bold text-white">{r.score}</span>
                    <span className="text-sm text-zinc-400">· {r.source}</span>
                  </div>
                  <div className="text-xs text-zinc-500">{r.count}</div>
                </div>
              </div>
            );
          })}
        </Reveal>

        {/* Oddělovač */}
        <div className="my-8 h-px bg-white/5" />

        {/* Garance */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {GUARANTEES.map((g, i) => {
            const Icon = ICONS[g.icon];
            return (
              <Reveal key={g.title} delay={i * 60} className="flex gap-3.5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/20 bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-semibold text-white">{g.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">{g.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
