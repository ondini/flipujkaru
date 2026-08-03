import { Star, Quote } from 'lucide-react';
import { REVIEWS } from '../data/content.js';
import { useApp } from '../AppContext.jsx';
import Reveal from './Reveal.jsx';

/** Jedna recenze studenta */
function ReviewCard({ r }) {
  return (
    <div className="w-[340px] shrink-0 rounded-2xl border border-white/10 bg-ink-850 p-6">
      <Quote className="w-7 h-7 text-accent/40" />
      <p className="mt-3 text-sm leading-relaxed text-zinc-300">„{r.text}"</p>

      <div className="mt-5 flex items-center gap-3">
        <div className="grid w-11 h-11 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-bold text-accent ring-2 ring-accent/30">
          {r.initials}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">{r.name}</div>
          <div className="text-xs text-zinc-500">{r.role}</div>
        </div>
        <span className="rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">{r.stat}</span>
      </div>

      <div className="mt-3 flex gap-0.5 text-accent">
        {Array.from({ length: r.stars }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-accent" />
        ))}
      </div>
    </div>
  );
}

export default function StudentReviews() {
  // Zdvojený seznam = plynulá nekonečná smyčka
  const loop = [...REVIEWS, ...REVIEWS];
  const { siteText: t } = useApp();

  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-ink-900/40 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t.rev_eyebrow || 'Recenze našich studentů'}</span>
          <h3 className="mt-3 font-display text-3xl md:text-4xl font-bold tracking-tight text-white">{t.rev_title || 'Čísla, ne sliby.'}</h3>
          <p className="mt-3 text-zinc-400">{t.rev_subtitle || 'Přes 1 800 členů. Tohle jsou jejich reálné výsledky.'}</p>
        </Reveal>
      </div>

      {/* Nekonečný slider (marquee). Najetím myší se zastaví. */}
      <div className="marquee-pause relative mt-12">
        {/* Postranní fade do pozadí */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-950 to-transparent" />

        <div className="marquee-track flex w-max gap-5 px-6">
          {loop.map((r, i) => (
            <ReviewCard key={i} r={r} />
          ))}
        </div>
      </div>
    </section>
  );
}
