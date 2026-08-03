import { Search, ClipboardCheck, TrendingUp } from 'lucide-react';
import { HOW_STEPS } from '../data/content.js';
import { useApp } from '../AppContext.jsx';
import Reveal from './Reveal.jsx';

const ICONS = { Search, ClipboardCheck, TrendingUp };

/** Proces ve 3 krocích — transparentně ukazuje, jak to u nás chodí. */
export default function HowItWorks() {
  const { siteText: t } = useApp();
  return (
    <section id="jak-to-funguje" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t.how_eyebrow || 'Jak to funguje'}</span>
          <h3 className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight text-white">
            {t.how_title || 'Žádná černá skříňka'}
          </h3>
          <p className="mt-3 text-zinc-400">{t.how_subtitle || 'Tři jasné kroky. Víš přesně, do čeho jdeš — od první minuty.'}</p>
        </Reveal>

        <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Spojovací linka mezi kroky (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-11 hidden h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent md:block" />

          {HOW_STEPS.map((s, i) => {
            const Icon = ICONS[s.icon];
            return (
              <Reveal key={s.n} delay={i * 90}>
                <div className="relative rounded-2xl border border-white/10 bg-ink-850 p-7 text-center md:text-left">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-ink-950">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="font-display text-4xl font-bold text-white/10">{s.n}</span>
                  </div>
                  <h4 className="mt-5 font-display text-lg font-bold text-white">{s.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
