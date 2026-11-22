import { useRef } from 'react';
import { ShoppingCart, Sparkles, ArrowRight } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp.js';
import { useApp } from '../AppContext.jsx';
import BrandMarquee from './BrandMarquee.jsx';
import Hero3D from './hero3d/Hero3D.jsx';
import { homeText } from '../data/landing.js';

/** Jedna statistika s animovaným počítadlem */
function Stat({ end, suffix = '', decimals = 0, label }) {
  const [ref, value] = useCountUp(end, { decimals });
  return (
    <div>
      <dt ref={ref} className="font-display text-3xl md:text-4xl font-bold text-white">
        {value}
        {suffix}
      </dt>
      <dd className="mt-1 text-sm text-zinc-500">{label}</dd>
    </div>
  );
}

export default function Hero() {
  const heroRef = useRef(null);
  const spotRef = useRef(null);
  const { siteText } = useApp();
  const t = (k) => homeText(siteText, k);
  // „Prodávej se ziskem" → zeleně jen poslední slovo (jako v PDF)
  const accent = String(t('home_hero_title_accent')).trim().replace(/\.$/, '');
  const cut = accent.lastIndexOf(' ') + 1;
  const accentHead = accent.slice(0, cut);
  const accentTail = accent.slice(cut);
  const statNum = (k) => parseInt(String(t(k)).replace(/\D/g, ''), 10) || 0;

  // Spotlight, který sleduje kurzor
  const onMove = (e) => {
    const hero = heroRef.current;
    const sp = spotRef.current;
    if (!hero || !sp) return;
    const r = hero.getBoundingClientRect();
    sp.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    sp.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <section id="hero" ref={heroRef} onPointerMove={onMove} className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32">
      {/* Spotlight */}
      <div
        ref={spotRef}
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(420px circle at var(--mx,50%) var(--my,30%), rgba(57,255,20,.10), transparent 60%)' }}
      />
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[760px] h-[760px] rounded-full bg-accent/10 blur-[140px] pointer-events-none" />
      {/* 3D neonová podlaha (synthwave hloubka) */}
      <div className="grid-floor" aria-hidden="true" />
      {/* 3D particle globus — za obsahem (jemně, ať neruší text), jen desktop */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-0 hidden w-[70%] -translate-x-1/2 opacity-30 lg:block" aria-hidden="true">
        <Hero3D />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-4xl text-center animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {t('home_hero_badge')}
          </span>

          <h2 className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.02] tracking-tight text-white">
            {t('home_hero_title')}
            <br />
            {accentHead}
            <span className="text-accent">{accentTail}</span>.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl leading-relaxed text-zinc-400">
            {t('home_hero_subtitle')}
          </p>

          {/* Zhodnocení úspor — proč flipovat auta místo nechat peníze ležet */}
          <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm font-semibold leading-relaxed text-accent">
            {t('home_hero_savings')}
          </div>

          <div className="mt-9 flex flex-col sm:flex-row justify-center gap-4">
            <a href="/#clenstvi" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-7 py-4 font-semibold text-ink-950 transition animate-glow hover:brightness-110 hover:scale-[1.02] active:scale-95">
              <Sparkles className="w-5 h-5" /> Staň se členem
              <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
            </a>
            <a href="/bazar" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-semibold text-white backdrop-blur transition hover:bg-white/10 hover:border-white/25">
              <ShoppingCart className="w-5 h-5" /> Prohlédnout bazar
            </a>
          </div>

          <dl className="mx-auto mt-14 grid grid-cols-2 gap-6 max-w-sm">
            <Stat end={statNum('home_stat_sold')} suffix="+" label="prodaných aut" />
            <Stat end={statNum('home_stat_members')} suffix="+" label="členů komunity" />
          </dl>
        </div>
      </div>

      <BrandMarquee />
    </section>
  );
}
