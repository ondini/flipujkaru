import { useRef } from 'react';
import { CarFront, Gauge, Calendar, ArrowUpRight, Cog, BadgeCheck, Receipt, Images } from 'lucide-react';
import { czk, kmFmt, CATEGORY_LABEL } from '../data/content.js';

/** Mapování tónu štítku na třídy */
const badgeClass = {
  accent: 'bg-accent text-ink-950',
  new: 'bg-white text-ink-950',
  sold: 'bg-red-500/90 text-white',
};

/** Malý detailní badge (ikona + text) */
function Spec({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
      <Icon className="w-3.5 h-3.5 text-accent" />
      {children}
    </span>
  );
}

export default function CarCard({ car, onOpen }) {
  const ref = useRef(null);
  const sold = car.badge?.tone === 'sold';
  const photoCount = car.images?.length || (car.img ? 1 : 0);

  // Jemný 3D tilt podle pozice kurzoru (jen na zařízeních s hover)
  const onMove = (e) => {
    if (window.matchMedia('(hover: none)').matches) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 4;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  // Fallback, když se fotka nenačte → barevný blok (ikona auta zůstává v pozadí)
  const onImgError = (e) => {
    e.currentTarget.style.display = 'none';
    e.currentTarget.parentElement.classList.add('img-fallback');
  };

  return (
    <article
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onClick={onOpen}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-ink-850 transition-[transform,border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-glow"
    >
      {/* Fotka + štítky */}
      <div className="relative aspect-[16/10] grid place-items-center overflow-hidden bg-gradient-to-br from-ink-700 to-ink-850">
        <CarFront className="absolute w-14 h-14 text-white/10" />
        <img
          src={car.img}
          alt={`${car.brand} ${car.model}`}
          loading="lazy"
          onError={onImgError}
          className={`relative w-full h-full object-cover transition-transform duration-700 ${sold ? 'opacity-40 grayscale' : 'group-hover:scale-110'}`}
        />
        {car.badge && (
          <span className={`absolute top-3 left-3 rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide ${badgeClass[car.badge.tone]}`}>
            {car.badge.text}
          </span>
        )}
        <span className="absolute bottom-3 right-3 rounded-lg border border-white/10 bg-ink-950/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          {CATEGORY_LABEL[car.category]}
        </span>
        {photoCount > 1 && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-lg border border-white/10 bg-ink-950/80 px-2 py-1 text-xs font-medium text-white backdrop-blur">
            <Images className="h-3.5 w-3.5 text-accent" /> {photoCount}
          </span>
        )}

        {/* Skrytý detail — vyjede zespodu nahoru při hoveru */}
        {!sold && (
          <div className="car-detail-reveal absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ink-950 via-ink-950/95 to-transparent px-4 pb-3 pt-8 transition-transform duration-300 group-hover:translate-y-0">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
              Zobrazit více <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        )}
      </div>

      {/* Obsah */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-display font-bold text-white leading-tight">{car.brand}</h4>
            <p className="text-sm text-zinc-400">{car.model}</p>
          </div>
          <span className="shrink-0 rounded-lg border border-white/10 px-2 py-0.5 text-xs text-zinc-400">{car.year}</span>
        </div>

        {/* Detailní badge: motorizace, stav, DPH */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Spec icon={Cog}>{car.engine}</Spec>
          <Spec icon={BadgeCheck}>Stav {car.condition}</Spec>
          <Spec icon={Receipt}>{car.vat ? 'Odpočet DPH' : 'Bez DPH'}</Spec>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-accent" />
            {kmFmt(car.km)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-accent" />
            {car.year}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-white">{czk(car.price)}</span>
          <button
            disabled={sold}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              sold ? 'cursor-not-allowed bg-white/5 text-zinc-500' : 'bg-accent text-ink-950 hover:brightness-110 hover:gap-2.5'
            }`}
          >
            {sold ? 'Prodáno' : 'Detail'}
            {!sold && <ArrowUpRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </article>
  );
}
