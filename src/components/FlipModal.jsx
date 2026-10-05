import { useEffect, useState } from 'react';
import { X, MapPin, Radar, AlertTriangle, Check, TrendingUp, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { czk } from '../data/content.js';

/** Detail flipu v modálním okně. flip=null → zavřeno. */
export default function FlipModal({ flip, onClose }) {
  const [idx, setIdx] = useState(0);
  const photos = (flip?.images && flip.images.length ? flip.images : flip?.img ? [flip.img] : []).filter(Boolean);

  // Zavření na Esc, šipky listují fotkami + zamknutí scrollu pozadí
  useEffect(() => {
    if (!flip) return;
    setIdx(0);
    const n = Math.max(1, photos.length);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % n);
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + n) % n);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [flip, photos.length, onClose]);

  if (!flip) return null;
  const next = () => setIdx((i) => (i + 1) % photos.length);
  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);

  const invested = flip.buy + flip.repair;
  const profit = flip.sell - invested;
  const hasNumbers = invested > 0 && flip.sell > 0;
  const roi = hasNumbers ? Math.round((profit / invested) * 100) : null;
  const problems = Array.isArray(flip.problems) ? flip.problems : [];
  const work = Array.isArray(flip.work) ? flip.work : [];
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
          <img key={photos[idx]} src={photos[idx]} alt={`${flip.brand} ${flip.model} – foto ${idx + 1}`} onError={onImgError} className="h-full w-full object-cover" />
          {photos.length > 1 && (
            <>
              <button onClick={prev} aria-label="Předchozí" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-ink-950/60 text-white backdrop-blur transition hover:bg-ink-950"><ChevronLeft className="h-5 w-5" /></button>
              <button onClick={next} aria-label="Další" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-ink-950/60 text-white backdrop-blur transition hover:bg-ink-950"><ChevronRight className="h-5 w-5" /></button>
              <span className="absolute bottom-3 right-3 rounded-lg bg-ink-950/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">{idx + 1} / {photos.length}</span>
            </>
          )}
          <button
            onClick={onClose}
            aria-label="Zavřít"
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-ink-950/70 text-white backdrop-blur transition hover:bg-ink-950"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-bold text-ink-950">
            <TrendingUp className="h-4 w-4" /> {hasNumbers ? `Čistý zisk +${czk(profit)}` : 'Prodáno'}
          </span>
        </div>
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto bg-ink-950 p-3">
            {photos.map((p, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === idx ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                <img src={p} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-2xl font-bold text-white">
                {flip.brand} <span className="font-normal text-zinc-400">{flip.model}</span>
              </h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-zinc-500">
                <MapPin className="h-4 w-4 text-accent" /> {flip.location ? `${flip.location} · ` : ''}ročník {flip.year}
              </p>
            </div>
            {flip.weeks ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                <Clock className="h-3.5 w-3.5 text-accent" /> {flip.weeks} týdny
              </span>
            ) : null}
          </div>

          {/* Jak jsme ho našli (algoritmus) */}
          {flip.found && (
            <div className="mt-5 flex gap-3 rounded-2xl border border-accent/25 bg-accent-soft p-4">
              <Radar className="h-5 w-5 shrink-0 text-accent" />
              <p className="min-w-0 text-sm leading-relaxed text-zinc-200">{flip.found}</p>
            </div>
          )}

          {/* Co bylo špatně / co jsme udělali */}
          {(problems.length > 0 || work.length > 0) && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {problems.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-zinc-300">
                    <AlertTriangle className="h-4 w-4 text-amber-400" /> Co bylo špatně
                  </h4>
                  <ul className="mt-3 space-y-2">
                    {problems.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-zinc-400">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {work.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-zinc-300">
                    <Check className="h-4 w-4 text-accent" /> Co jsme udělali
                  </h4>
                  <ul className="mt-3 space-y-2">
                    {work.map((w) => (
                      <li key={w} className="flex items-start gap-2 text-sm text-zinc-400">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Příběh */}
          {flip.summary && (
            <p className="mt-6 rounded-2xl border border-white/10 bg-ink-850 p-5 text-sm leading-relaxed text-zinc-300">
              {flip.summary}
            </p>
          )}

          {hasNumbers && (
            <>
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
            </>
          )}

          <a href="#cenik" onClick={onClose} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-ink-950 transition hover:brightness-110">
            Chci se naučit tohle taky
          </a>
        </div>
      </div>
    </div>
  );
}
