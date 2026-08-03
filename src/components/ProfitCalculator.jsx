import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { czk } from '../data/content.js';
import { useApp } from '../AppContext.jsx';

/** Posuvník s popiskem a živou hodnotou */
function Slider({ label, value, onChange, min, max, step }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <label className="text-zinc-400">{label}</label>
        <span className="font-semibold text-white">{czk(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-accent cursor-pointer"
      />
    </div>
  );
}

export default function ProfitCalculator() {
  const { siteText: t } = useApp();
  const [buy, setBuy] = useState(350000);
  const [cost, setCost] = useState(35000);
  const [sell, setSell] = useState(460000);

  // Výpočet zisku, marže a ROI
  const { profit, margin, roi, hint } = useMemo(() => {
    const invest = buy + cost;
    const profit = sell - invest;
    const margin = sell > 0 ? (profit / sell) * 100 : 0;
    const roi = invest > 0 ? (profit / invest) * 100 : 0;
    const hint =
      profit < 0
        ? '⚠️ Tenhle deal je ztrátový — sniž nákup nebo náklady.'
        : margin < 10
        ? 'Tenká marže. Profíci cílí na 12–20 %.'
        : margin < 25
        ? '👍 Zdravý flip. Přesně tahle čísla učíme.'
        : '🔥 Výborná marže — jen pozor na reálnost prodejní ceny.';
    return { profit, margin, roi, hint };
  }, [buy, cost, sell]);

  const positive = profit >= 0;
  const accentColor = positive ? '#39FF14' : '#f87171';
  const barWidth = Math.max(2, Math.min(100, Math.abs(margin)));

  return (
    <section id="kalkulacka" className="relative border-y border-white/5 bg-ink-900/40 py-20 md:py-28">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[130px] pointer-events-none" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        {/* Text */}
        <Reveal>
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t.calc_eyebrow || 'Ochutnávka nástroje AKADEMIE'}</span>
          <h3 className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight text-white">
            {t.calc_title || 'Spočítej si flip za 10 vteřin.'}
          </h3>
          <p className="mt-4 max-w-md text-zinc-400">
            {t.calc_subtitle || 'Tohle je zjednodušená verze kalkulačky, kterou členové naší komunity používají denně. Zadej čísla a hned uvidíš čistý zisk, marži i ROI.'}
          </p>
          <div className="mt-4 max-w-md border-l-2 border-accent bg-accent-soft/60 rounded-r-xl px-4 py-3 text-sm leading-relaxed text-zinc-300">
            Tohle není spekulace. Je to nástroj, kterým členové naší komunity zhodnocují úspory systematicky, ne náhodně.
          </div>
          <a href="#cenik" className="mt-6 inline-flex items-center gap-2 font-semibold text-accent transition-all hover:gap-3">
            Staň se členem <ArrowRight className="w-4 h-4" />
          </a>
        </Reveal>

        {/* Kalkulačka */}
        <Reveal delay={120} className="rounded-3xl border border-white/10 bg-ink-850 p-7 shadow-soft md:p-8">
          <div className="space-y-6">
            <Slider label="Nákupní cena" value={buy} onChange={setBuy} min={50000} max={2000000} step={10000} />
            <Slider label="Náklady (oprava, detailing, inzerce)" value={cost} onChange={setCost} min={0} max={400000} step={5000} />
            <Slider label="Prodejní cena" value={sell} onChange={setSell} min={50000} max={2500000} step={10000} />

            {/* Výsledek */}
            <div className="rounded-2xl border border-white/10 bg-ink-950 p-5">
              <div className="flex items-end justify-between">
                <span className="text-sm text-zinc-400">Čistý zisk</span>
                <span className="font-display text-4xl font-bold" style={{ color: accentColor }}>
                  {positive ? '+ ' : '– '}
                  {czk(Math.abs(profit))}
                </span>
              </div>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-ink-700">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${barWidth}%`, background: accentColor }} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="rounded-xl bg-ink-850 py-3">
                  <div className="text-xs text-zinc-500">Marže</div>
                  <div className="mt-0.5 font-display text-xl font-bold text-white">{Math.round(margin)} %</div>
                </div>
                <div className="rounded-xl bg-ink-850 py-3">
                  <div className="text-xs text-zinc-500">ROI</div>
                  <div className="mt-0.5 font-display text-xl font-bold text-white">{Math.round(roi)} %</div>
                </div>
              </div>

              <p className="mt-4 text-xs text-zinc-500">{hint}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
