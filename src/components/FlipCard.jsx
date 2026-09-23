import { CarFront, ArrowRight, TrendingUp, Clock, Eye } from 'lucide-react';
import { czk } from '../data/content.js';

/** Karta úspěšného flipu: nákup → po opravě → prodej → čistý zisk.
 *  Klik kdekoliv → otevře detail (onOpen). Hlavní „social proof". */
export default function FlipCard({ flip, onOpen }) {
  const invested = flip.buy + flip.repair; // cena po opravě/vyčištění
  const profit = flip.sell - invested;
  const hasNumbers = invested > 0 && flip.sell > 0; // vyplněná nákup/prodej cena
  const roi = hasNumbers ? Math.round((profit / invested) * 100) : null;

  const onImgError = (e) => {
    e.currentTarget.style.display = 'none';
    e.currentTarget.parentElement.classList.add('img-fallback');
  };

  return (
    <article
      onClick={onOpen}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-ink-850 transition duration-300 hover:scale-[1.02] hover:border-accent/40 hover:shadow-glow"
    >
      {/* Fotka + odznak zisku */}
      <div className="relative aspect-[16/9] grid place-items-center overflow-hidden bg-gradient-to-br from-ink-700 to-ink-850">
        <CarFront className="absolute w-12 h-12 text-white/10" />
        <img
          src={flip.img}
          alt={`${flip.brand} ${flip.model}`}
          loading="lazy"
          onError={onImgError}
          className="relative w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1 text-xs font-bold text-ink-950">
          <TrendingUp className="w-3.5 h-3.5" /> {hasNumbers ? `ZISK +${czk(profit)}` : 'PRODÁNO'}
        </span>
        {flip.weeks ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-ink-950/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur border border-white/10">
            <Clock className="w-3.5 h-3.5 text-accent" /> {flip.weeks} týdny
          </span>
        ) : null}
      </div>

      <div className="p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="font-display font-bold text-white">
            {flip.brand} <span className="font-normal text-zinc-400">{flip.model}</span>
          </h4>
          <span className="text-xs text-zinc-500">{flip.year}</span>
        </div>

        {hasNumbers && (
          <>
            {/* Tok hodnoty: Nákup → Po opravě → Prodej */}
            <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1 text-center">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">Nákup</div>
                <div className="mt-0.5 text-sm font-semibold text-zinc-300">{czk(flip.buy)}</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
              <div>
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">Po opravě</div>
                <div className="mt-0.5 text-sm font-semibold text-zinc-300">{czk(invested)}</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
              <div>
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">Prodej</div>
                <div className="mt-0.5 text-sm font-semibold text-white">{czk(flip.sell)}</div>
              </div>
            </div>

            {/* Výsledek */}
            <div className="mt-5 flex items-center justify-between rounded-xl border border-accent/20 bg-accent-soft px-4 py-3">
              <div>
                <div className="text-xs text-zinc-400">Čistý zisk</div>
                <div className="font-display text-xl font-bold text-accent">+{czk(profit)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-400">ROI</div>
                <div className="font-display text-xl font-bold text-white">{roi} %</div>
              </div>
            </div>
          </>
        )}

        {/* CTA na detail */}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-all group-hover:gap-2.5">
          <Eye className="h-4 w-4" /> Zobrazit celý příběh flipu
        </span>
      </div>
    </article>
  );
}
