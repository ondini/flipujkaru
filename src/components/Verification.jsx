import { FileSearch, Stethoscope, Scale, FileCheck2, ShieldCheck } from 'lucide-react';
import { VERIFY_STEPS } from '../data/content.js';
import { useApp } from '../AppContext.jsx';
import Reveal from './Reveal.jsx';

const ICONS = { FileSearch, Stethoscope, Scale, FileCheck2 };

/** Důvěra u bazaru: jak každé auto prověřujeme (4 kroky). */
export default function Verification() {
  const { siteText: t } = useApp();
  return (
    <section id="proverovani" className="relative border-y border-white/5 bg-ink-900/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t.verify_eyebrow || 'Důvěra na prvním místě'}</span>
          <h3 className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight text-white">
            {t.verify_title || 'Než auto nabídneme, projde čtyřmi kontrolami'}
          </h3>
          <p className="mt-3 text-zinc-400">
            {t.verify_subtitle || 'Co u nás koupíš, je prověřené — technicky i právně. Tady je přesně, jak to děláme.'}
          </p>
        </Reveal>

        <div className="relative mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Spojovací linka (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-11 hidden h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent lg:block" />
          {VERIFY_STEPS.map((s, i) => {
            const Icon = ICONS[s.icon];
            return (
              <Reveal key={s.title} delay={i * 80}>
                <div className="relative h-full rounded-2xl border border-white/10 bg-ink-850 p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-ink-950">
                      {Icon && <Icon className="h-6 w-6" />}
                    </span>
                    <span className="font-display text-4xl font-bold text-white/10">0{i + 1}</span>
                  </div>
                  <h4 className="mt-5 font-display text-lg font-bold text-white">{s.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Závěrečné ujištění */}
        <Reveal delay={120} className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2.5 rounded-2xl border border-accent/20 bg-accent-soft px-5 py-4 text-center text-sm text-zinc-200">
          <ShieldCheck className="h-5 w-5 shrink-0 text-accent" />
          Co si u vozu nejsme jistí, do inzerátu nepíšeme. Raději auto nenabídneme, než abychom riskovali tvoji důvěru.
        </Reveal>
      </div>
    </section>
  );
}
