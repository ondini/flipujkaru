import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import { czk } from '../../data/content.js';

/** Kompaktní kalkulačka zisku v dashboardu. */
export default function CalcPanel() {
  const [buy, setBuy] = useState(350000);
  const [cost, setCost] = useState(35000);
  const [sell, setSell] = useState(460000);

  const { profit, margin, roi, hint } = useMemo(() => {
    const invest = buy + cost;
    const profit = sell - invest;
    const margin = sell > 0 ? (profit / sell) * 100 : 0;
    const roi = invest > 0 ? (profit / invest) * 100 : 0;
    const hint = profit < 0 ? '⚠️ Ztrátový deal — sniž nákup nebo náklady.'
      : margin < 10 ? 'Tenká marže. Cílíme na 12–20 %.'
      : margin < 25 ? '👍 Zdravý flip.' : '🔥 Výborná marže — ověř reálnost prodejní ceny.';
    return { profit, margin, roi, hint };
  }, [buy, cost, sell]);

  const positive = profit >= 0;
  const color = positive ? '#39FF14' : '#f87171';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white"><Calculator className="h-5 w-5 text-accent" /> Kalkulačka zisku</h1>
        <p className="mt-1 text-sm text-zinc-400">Spočítej si marži a ROI dřív, než auto koupíš.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6 rounded-2xl border border-white/10 bg-ink-850 p-5">
          <Slider label="Nákupní cena" value={buy} onChange={setBuy} min={50000} max={2000000} step={10000} />
          <Slider label="Náklady (oprava, detailing…)" value={cost} onChange={setCost} min={0} max={400000} step={5000} />
          <Slider label="Prodejní cena" value={sell} onChange={setSell} min={50000} max={2500000} step={10000} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
          <div className="flex items-end justify-between">
            <span className="text-sm text-zinc-400">Čistý zisk</span>
            <span className="font-display text-3xl font-bold" style={{ color }}>{positive ? '+ ' : '– '}{czk(Math.abs(profit))}</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-ink-700">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(2, Math.min(100, Math.abs(margin)))}%`, background: color }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-ink-950 py-3"><div className="text-xs text-zinc-500">Marže</div><div className="mt-0.5 font-display text-xl font-bold text-white">{Math.round(margin)} %</div></div>
            <div className="rounded-xl bg-ink-950 py-3"><div className="text-xs text-zinc-500">ROI</div><div className="mt-0.5 font-display text-xl font-bold text-white">{Math.round(roi)} %</div></div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">{hint}</p>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, onChange, min, max, step }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm"><span className="text-zinc-400">{label}</span><span className="font-semibold text-white">{czk(value)}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="w-full cursor-pointer accent-accent" />
    </div>
  );
}
