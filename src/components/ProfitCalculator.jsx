import { useEffect, useState } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import Reveal from './Reveal.jsx';
import { czk } from '../data/content.js';
import { useApp } from '../AppContext.jsx';

const MAX_FREE_USES = 3;
const USES_KEY = 'fk_calc_uses';

function readUses() {
  return Math.max(0, parseInt(localStorage.getItem(USES_KEY) || '0', 10) || 0);
}

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

/** Čistý zisk, marže, ROI a slovní hodnocení dealu — počítá se jen na klik. */
function computeResult(buy, cost, sell) {
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
}

export default function ProfitCalculator() {
  const { siteText: t } = useApp();
  const [buy, setBuy] = useState(350000);
  const [cost, setCost] = useState(35000);
  const [sell, setSell] = useState(460000);
  const [result, setResult] = useState(null); // null, dokud uživatel neklikne na "Spočítat"
  const [uses, setUses] = useState(readUses);
  const [checking, setChecking] = useState(false);

  const locked = uses >= MAX_FREE_USES;

  // Při načtení ověř u serveru (hash IP), jestli limit nevyčerpal z jiného
  // prohlížeče/po smazání localStorage — bere se vyšší ze dvou počítadel.
  useEffect(() => {
    fetch('/api/calc-usage')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.count === 'number' && data.count > readUses()) {
          localStorage.setItem(USES_KEY, String(data.count));
          setUses(data.count);
        }
      })
      .catch(() => {});
  }, []);

  const handleCalculate = async () => {
    if (locked || checking) return;
    setChecking(true);
    try {
      const res = await fetch('/api/calc-usage', { method: 'POST' });
      const data = await res.json();
      localStorage.setItem(USES_KEY, String(data.count));
      setUses(data.count);
      if (data.ok) setResult(computeResult(buy, cost, sell));
    } catch {
      // Server nedostupný — spolehni se aspoň na lokální počítadlo.
      const next = readUses() + 1;
      localStorage.setItem(USES_KEY, String(next));
      setUses(next);
      if (next <= MAX_FREE_USES) setResult(computeResult(buy, cost, sell));
    } finally {
      setChecking(false);
    }
  };

  const { profit, margin, roi, hint } = result || { profit: 0, margin: 0, roi: 0, hint: '' };
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
            Žádná spekulace, žádná náhoda — systematický nástroj, kterým členové naší komunity zhodnocují úspory.
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

            <button
              onClick={handleCalculate}
              disabled={locked || checking}
              className="w-full rounded-xl bg-accent px-6 py-3.5 font-semibold text-ink-950 shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {checking ? 'Počítám…' : 'Spočítat zisk'}
            </button>
            <p className="-mt-3 text-center text-xs text-zinc-500">
              Použito {Math.min(uses, MAX_FREE_USES)}/{MAX_FREE_USES} zdarma
            </p>

            {/* Výsledek */}
            <div className="relative">
              <div className={`rounded-2xl border border-white/10 bg-ink-950 p-5 transition ${locked && !result ? 'pointer-events-none select-none blur-sm' : ''}`}>
                <div className="flex items-end justify-between">
                  <span className="text-sm text-zinc-400">Čistý zisk</span>
                  <span className="font-display text-4xl font-bold" style={{ color: result ? accentColor : undefined }}>
                    {result ? `${positive ? '+ ' : '– '}${czk(Math.abs(profit))}` : '—'}
                  </span>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-ink-700">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${result ? barWidth : 2}%`, background: accentColor }} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="rounded-xl bg-ink-850 py-3">
                    <div className="text-xs text-zinc-500">Marže</div>
                    <div className="mt-0.5 font-display text-xl font-bold text-white">{result ? `${Math.round(margin)} %` : '—'}</div>
                  </div>
                  <div className="rounded-xl bg-ink-850 py-3">
                    <div className="text-xs text-zinc-500">ROI</div>
                    <div className="mt-0.5 font-display text-xl font-bold text-white">{result ? `${Math.round(roi)} %` : '—'}</div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-zinc-500">{result ? hint : 'Uprav čísla a klikni na „Spočítat zisk".'}</p>
              </div>

              {locked && !result && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-ink-950/80 p-5 text-center">
                  <Lock className="h-6 w-6 text-accent" />
                  <p className="max-w-xs text-sm font-medium text-white">Využil jsi {MAX_FREE_USES} bezplatné výpočty.</p>
                  <a
                    href="#cenik"
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-ink-950 shadow-glow transition hover:brightness-110"
                  >
                    Chci neomezenou kalkulačku <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
