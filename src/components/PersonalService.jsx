import { Handshake, Mail, ArrowRight, Lock } from 'lucide-react';
import { PERSONAL_SERVICE_STEPS, COMPANY } from '../data/content.js';
import { useApp } from '../AppContext.jsx';
import Reveal from './Reveal.jsx';

/** Osobní 1:1 servis + kompletní asistence s dovozem auta — placená služba
 *  NAD RÁMEC členství AKADEMIE, cena se řeší individuálně přes kontakt.
 *  Dostupné jen pro aktivní členy — bez členství vidí zámek + CTA na ceník. */
export default function PersonalService() {
  const { member } = useApp();
  const subject = encodeURIComponent('Zájem o osobní servis / dovoz auta');
  return (
    <section id="osobni-servis" className="relative border-y border-white/5 bg-ink-900/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
              <Handshake className="h-3.5 w-3.5" /> Osobní servis pro členy
            </span>
            <h3 className="mt-5 font-display text-3xl md:text-5xl font-bold tracking-tight text-white">
              Nechceš flipovat sám? <span className="text-grad">Uděláme to za tebe.</span>
            </h3>
            <p className="mt-4 max-w-lg text-zinc-400">
              Kompletní 1:1 servis se zakladateli — od výběru auta až po klíče v ruce, plus podpora i při
              prodeji. Zahrnuje i plnou asistenci s dovozem (health check, opravy, přepis do ČR). Doplňková
              placená služba nad rámec členství AKADEMIE, cenu domluvíme na míru tvému autu.
            </p>
            {member ? (
              <a
                href={`mailto:${COMPANY.email}?subject=${subject}`}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-ink-950 shadow-glow transition hover:brightness-110"
              >
                <Mail className="h-4 w-4" /> Mám zájem o osobní servis <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <div className="mt-7 space-y-3">
                <p className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-ink-850 px-3.5 py-2 text-sm text-zinc-400">
                  <Lock className="h-4 w-4 shrink-0 text-accent" /> Dostupné pro členy AKADEMIE — nejdřív roční členství, pak se domluvíme individuálně.
                </p>
                <a
                  href="#cenik"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-ink-950 shadow-glow transition hover:brightness-110"
                >
                  Chci se stát členem <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            )}
          </Reveal>

          <Reveal delay={100} className="rounded-3xl border border-white/10 bg-ink-850 p-7 md:p-8">
            <div className="space-y-4">
              {PERSONAL_SERVICE_STEPS.map((s) => (
                <div key={s.n} className="flex gap-4">
                  <span className="shrink-0 font-display text-sm font-bold text-accent">{s.n}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{s.title}</div>
                    <div className="text-sm text-zinc-400">{s.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
