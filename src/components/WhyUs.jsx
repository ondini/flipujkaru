import { useEffect, useRef, useState } from 'react';
import { Radar, LineChart, GraduationCap, Gift, Wrench, Scale, HeartHandshake, PiggyBank, Bell, ArrowRight, Sparkles } from 'lucide-react';
import { WHY_US, ALGO_FEED, czk } from '../data/content.js';
import { useTilt } from '../hooks/useTilt.js';
import { useApp } from '../AppContext.jsx';
import Reveal from './Reveal.jsx';

const ICONS = { Radar, LineChart, GraduationCap, Gift, Wrench, Scale, HeartHandshake, PiggyBank };
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
function AlgoFeed() {
  const order = useRef(shuffled(ALGO_FEED));
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, []);
  const items = Array.from({ length: 4 }, (_, i) => order.current[(tick + i) % order.current.length]);

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

/** Karta výhody s 3D náklonem (ikona a nadpis vyskakují do hloubky). */
function WhyCard({ w }) {
  const Icon = ICONS[w.icon];
  const tilt = useTilt({ max: 9 });
  return (
    <div className="[perspective:1000px]">
      <div
        ref={tilt.ref}
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
        className="tilt-3d h-full rounded-2xl border border-white/10 bg-ink-850 p-6 hover:border-accent/40"
      >
        <div className="depth-2 grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
          <Icon className="h-6 w-6" />
        </div>
        <h4 className="depth-1 mt-5 font-display font-bold text-white">{w.title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{w.text}</p>
      </div>
    </div>
  );
}

export default function WhyUs() {
  const [hero, ...rest] = WHY_US;
  const HeroIcon = ICONS[hero.icon];
  const { siteText: t } = useApp();

  return (
    <section id="proc-my" className="relative py-20 md:py-28">
      <div className="absolute left-1/2 top-20 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent/5 blur-[150px] pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t.whyus_eyebrow || 'Proč právě my'}</span>
          <h3 className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight text-white">
            {t.whyus_title || 'Náskok, který nedoženou'}
          </h3>
          <p className="mt-3 text-zinc-400">
            {t.whyus_subtitle || 'Nejsme jen další bazar ani „kurz z internetu". Máme nástroje a síť, ke kterým se sám nedostaneš.'}
          </p>
          {/* Sdělení o unikátnosti modelu */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-4 py-2 text-sm font-semibold text-accent">
            <Sparkles className="h-4 w-4" />
            {t.whyus_badge || 'Unikátní model — v ČR & SK komunitě bez obdoby'}
          </div>
        </Reveal>

        {/* Vlajková loď — algoritmus + live feed */}
        <Reveal delay={80} className="mt-12">
          <div className="grid items-center gap-8 rounded-3xl border border-accent/25 bg-ink-850 p-7 md:p-10 lg:grid-cols-2 shadow-glow">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
                Naše tajná zbraň
              </span>
              <div className="mt-5 grid h-14 w-14 place-items-center rounded-2xl bg-accent text-ink-950">
                <HeroIcon className="h-7 w-7" />
              </div>
              <h4 className="mt-5 font-display text-2xl md:text-3xl font-bold text-white">{hero.title}</h4>
              <p className="mt-3 leading-relaxed text-zinc-400">{hero.text}</p>
              <a href="#cenik" className="mt-6 inline-flex items-center gap-2 font-semibold text-accent transition-all hover:gap-3">
                Chci ten náskok taky <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <AlgoFeed />
          </div>
        </Reveal>

        {/* Ostatní výhody — 3D karty */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((w, i) => (
            <Reveal key={w.title} delay={i * 60}>
              <WhyCard w={w} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
