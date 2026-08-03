import { Database, Users, Compass, ShieldCheck } from 'lucide-react';
import { BENEFITS } from '../data/content.js';
import { useApp } from '../AppContext.jsx';
import Reveal from './Reveal.jsx';

// Mapa ikon — explicitní importy kvůli tree-shakingu (žádný import * as).
const ICONS = { Database, Users, Compass, ShieldCheck };

export default function Education() {
  const { siteText: t } = useApp();
  return (
    <section id="edukace" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t.edu_eyebrow || 'Proč se to učit u nás'}</span>
          <h3 className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight text-white">
            {t.edu_title || 'Flipování není štěstí. Je to systém.'}
          </h3>
          <p className="mt-3 text-zinc-400">
            {t.edu_subtitle || 'Dáme ti přesně to, co odděluje amatéra od profíka, který vydělává konzistentně.'}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b, i) => {
            // Ikona se vybírá dle názvu z dat
            const Icon = ICONS[b.icon];
            return (
              <Reveal key={b.title} delay={i * 60}>
                <div className="rounded-2xl border border-white/10 bg-ink-850 p-6 transition hover:-translate-y-1 hover:border-accent/40">
                  <div className="grid place-items-center w-12 h-12 rounded-xl bg-accent-soft text-accent">
                    {Icon && <Icon className="w-6 h-6" />}
                  </div>
                  <h4 className="mt-5 font-display font-bold text-white">{b.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{b.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
