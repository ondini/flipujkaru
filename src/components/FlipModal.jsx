import { useEffect } from 'react';
import { X, MapPin, Radar, AlertTriangle, Check, TrendingUp, Clock } from 'lucide-react';
import { czk } from '../data/content.js';

/** Detail flipu v modálním okně. flip=null → zavřeno. */
export default function FlipModal({ flip, onClose }) {
  // Zavření na Esc + zamknutí scrollu pozadí
  useEffect(() => {
    if (!flip) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [flip, onClose]);

  if (!flip) return null;

  const invested = flip.buy + flip.repair;
  const profit = flip.sell - invested;
  const roi = Math.round((profit / invested) * 100);
  const onImgError = (e) => {
    e.currentTarget.style.display = 'none';
    e.currentTarget.parentElement.classList.add('img-fallback');
  };

  // Rozpad nákladů / výsledku
  const stats = [
    { label: 'Nákup', value: czk(flip.buy) },
    { label: 'Oprava', value: czk(flip.repair) },
    { label: 'Prodej', value: czk(flip.sell) },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detail flipu ${flip.brand} ${flip.model}`}
    >
      <div
        className="animate-fade-up max-h-[92vh] w-full max-w-2xl overflow-y-auto overflow-x-hidden rounded-t-3xl border border-white/10 bg-ink-900 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hlavička s fotkou */}
        <div className="relative aspect-[16/9] grid place-items-center overflow-hidden bg-gradient-to-br from-ink-700 to-ink-850">
          <img src={flip.img} alt={`${flip.brand} ${flip.model}`} onError={onImgError} className="h-full w-full object-cover" />
          <button
            onClick={onClose}
            aria-label="Zavřít"
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-ink-950/70 text-white backdrop-blur transition hover:bg-ink-950"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-bold text-ink-950">
            <TrendingUp className="h-4 w-4" /> Čistý zisk +{czk(profit)}
          </span>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-2xl font-bold text-white">
                {flip.brand} <span className="font-normal text-zinc-400">{flip.model}</span>
              </h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-zinc-500">
                <MapPin className="h-4 w-4 text-accent" /> {flip.location} · ročník {flip.year}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
              <Clock className="h-3.5 w-3.5 text-accent" /> {flip.weeks} týdny
            </span>
          </div>

          {/* Jak jsme ho našli (algoritmus) */}
          <div className="mt-5 flex gap-3 rounded-2xl border border-accent/25 bg-accent-soft p-4">
            <Radar className="h-5 w-5 shrink-0 text-accent" />
            <p className="min-w-0 text-sm leading-relaxed text-zinc-200">{flip.found}</p>
          </div>

          {/* Co bylo špatně / co jsme udělali */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-zinc-300">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> Co bylo špatně
              </h4>
              <ul className="mt-3 space-y-2">
                {flip.problems.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-zinc-300">
                <Check className="h-4 w-4 text-accent" /> Co jsme udělali
              </h4>
              <ul className="mt-3 space-y-2">
                {flip.work.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-sm text-zinc-400">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Příběh */}
          <p className="mt-6 rounded-2xl border border-white/10 bg-ink-850 p-5 text-sm leading-relaxed text-zinc-300">
            {flip.summary}
          </p>

          {/* Rozpad čísel */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-ink-850 p-3 text-center">
                <div className="text-xs text-zinc-500">{s.label}</div>
                <div className="mt-0.5 font-display text-base font-bold text-white">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-2xl border border-accent/20 bg-accent-soft px-5 py-4">
            <div>
              <div className="text-xs text-zinc-400">Čistý zisk</div>
              <div className="font-display text-2xl font-bold text-accent">+{czk(profit)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-400">ROI</div>
              <div className="font-display text-2xl font-bold text-white">{roi} %</div>
            </div>
          </div>

          <a href="#cenik" onClick={onClose} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-ink-950 transition hover:brightness-110">
            Chci se naučit tohle taky
          </a>
        </div>
      </div>
    </div>
  );
}
