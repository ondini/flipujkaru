import { Users, Unlock, Eye, Quote } from 'lucide-react';
import { MISSION_VALUES } from '../data/content.js';
import Reveal from './Reveal.jsx';

const ICONS = { Users, Unlock, Eye };

/** Mise / příběh projektu — emoční „proč", těsně před cenou. */
export default function Mission() {
  return (
    <section id="mise" className="relative overflow-hidden border-y border-white/5 bg-ink-900/40 py-20 md:py-28">
      <div className="absolute -left-32 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-accent/5 blur-[140px] pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Příběh */}
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Proč jsme to založili</span>
            <h3 className="mt-3 font-display text-3xl md:text-5xl font-bold leading-tight tracking-tight text-white">
              Nechceme to nechat <span className="text-grad">jen pro sebe.</span>
            </h3>

            <div className="mt-6 space-y-4 leading-relaxed text-zinc-400">
              <p>
                Roky jsme flipovali auta po vlastní ose. Naučili jsme se, kde hledat, jak nepřeplatit,
                co opravit a komu prodat — a draze zaplatili za každou chybu. Pak nám došlo jedno:
                <span className="text-white"> to nejcennější není auto, ale know-how.</span>
              </p>
              <p>
                Proto vznikla FlipujKáru. Ne abychom prodali pár kurzů, ale abychom kolem sebe postavili
                <span className="text-white"> komunitu, která si navzájem pomáhá</span> — sdílí dealy, kontakty
                i chyby, ze kterých se pak učíme všichni rychleji.
              </p>
              <p>
                Nezáleží, jestli je ti dvacet nebo padesát, jestli začínáš s padesáti tisíci nebo s plnou garáží.
                <span className="text-white"> Když chceš makat a učit se, máš u nás místo.</span> A tvůj první
                flip je nejspíš blíž, než si myslíš.
              </p>
            </div>

            {/* Klíčové sdělení: proč zrovna auta, ne byty */}
            <div className="mt-6 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm font-semibold leading-relaxed text-accent">
              Flipování bytů zvládne málokdo — chce to statisíce nastřádané stranou.
              <span className="text-white"> Flipování aut zvládne skoro každý, kdo chce makat.</span>
            </div>

            {/* Citát / motto */}
            <div className="mt-8 flex gap-4 rounded-2xl border border-white/10 bg-ink-850 p-5">
              <Quote className="h-7 w-7 shrink-0 text-accent/50" />
              <p className="font-display text-lg font-semibold text-white">
                „Sám dojedeš rychleji. Spolu dojedeme dál — a s pořádným ziskem."
              </p>
            </div>
          </Reveal>

          {/* Hodnoty */}
          <div className="space-y-5">
            {MISSION_VALUES.map((v, i) => {
              const Icon = ICONS[v.icon];
              return (
                <Reveal key={v.title} delay={i * 90}>
                  <div className="flex gap-4 rounded-2xl border border-white/10 bg-ink-850 p-6 transition hover:border-accent/40">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-ink-950">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h4 className="font-display text-lg font-bold text-white">{v.title}</h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{v.text}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}

            <Reveal delay={300}>
              <a
                href="#cenik"
                className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-4 font-semibold text-ink-950 shadow-glow transition hover:brightness-110 hover:scale-[1.01]"
              >
                Přidej se ke komunitě
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
