import { useEffect, useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Gauge, Calendar, Cog, BadgeCheck,
  ShieldCheck, FileText, Undo2, Phone, Mail, CarFront,
} from 'lucide-react';
import { czk, kmFmt, CATEGORY_LABEL, COMPANY } from '../data/content.js';

/** Sofistikovaný detail auta: galerie fotek + parametry + CTA. Plně mobilní. */
export default function CarDetailModal({ car, onClose }) {
  const [idx, setIdx] = useState(0);
  const photos = (car?.images && car.images.length ? car.images : car?.img ? [car.img] : []).filter(Boolean);
  const has = photos.length > 0;

  useEffect(() => {
    if (!car) return;
    setIdx(0);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % Math.max(1, photos.length));
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + Math.max(1, photos.length)) % Math.max(1, photos.length));
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [car, photos.length, onClose]);

  if (!car) return null;
  const sold = car.badge?.tone === 'sold';
  const next = () => setIdx((i) => (i + 1) % photos.length);
  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const subject = encodeURIComponent(`Zájem o ${car.brand} ${car.model}`);
  const body = encodeURIComponent(`Dobrý den,\n\nmám zájem o vůz ${car.brand} ${car.model} (${car.year}) za ${czk(car.price)}.\nProsím o více informací.\n\nDěkuji`);

  return (
    <div
      className="fixed inset-0 z-[110] flex justify-center bg-ink-950/85 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detail vozu ${car.brand} ${car.model}`}
    >
      {/* Zavírací tlačítko vždy po ruce (mobil) */}
      <button onClick={onClose} aria-label="Zavřít" className="fixed right-3 top-3 z-[121] grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-ink-950/80 text-white backdrop-blur transition hover:bg-ink-950 sm:hidden">
        <X className="h-5 w-5" />
      </button>

      <div
        className="animate-fade-up flex max-h-screen w-full max-w-5xl flex-col overflow-y-auto bg-ink-900 sm:max-h-[94vh] sm:rounded-3xl sm:border sm:border-white/10 lg:flex-row lg:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== Galerie ===== */}
        <div className="relative flex shrink-0 flex-col bg-ink-950 lg:w-[58%]">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-ink-700 to-ink-850">
            {has ? (
              <img src={photos[idx]} alt={`${car.brand} ${car.model} – foto ${idx + 1}`} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-white/10"><CarFront className="h-20 w-20" /></div>
            )}
            {car.badge && (
              <span className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-xs font-bold ${sold ? 'bg-red-500/90 text-white' : 'bg-accent text-ink-950'}`}>{car.badge.text}</span>
            )}
            {photos.length > 1 && (
              <>
                <button onClick={prev} aria-label="Předchozí" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-ink-950/60 text-white backdrop-blur transition hover:bg-ink-950"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={next} aria-label="Další" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-ink-950/60 text-white backdrop-blur transition hover:bg-ink-950"><ChevronRight className="h-5 w-5" /></button>
                <span className="absolute bottom-3 right-3 rounded-lg bg-ink-950/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">{idx + 1} / {photos.length}</span>
              </>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3">
              {photos.map((p, i) => (
                <button key={i} onClick={() => setIdx(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === idx ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={p} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===== Info ===== */}
        <div className="flex flex-1 flex-col p-6 md:p-7 lg:overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">{CATEGORY_LABEL[car.category] || 'Vůz'}</span>
              <h2 className="mt-1 font-display text-2xl font-bold text-white md:text-3xl">{car.brand} <span className="font-normal text-zinc-300">{car.model}</span></h2>
            </div>
            <button onClick={onClose} aria-label="Zavřít" className="hidden h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-zinc-400 transition hover:text-white sm:grid">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-end justify-between rounded-2xl border border-white/10 bg-ink-850 p-4">
            <div>
              <div className="text-xs text-zinc-500">Cena</div>
              <div className="font-display text-3xl font-bold text-white">{czk(car.price)}</div>
            </div>
            <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-zinc-400">{car.vat ? 'Odpočet DPH' : 'Bez DPH'}</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Spec icon={Calendar} label="Rok výroby" value={car.year} />
            <Spec icon={Gauge} label="Najeto" value={kmFmt(car.km)} />
            <Spec icon={Cog} label="Motorizace" value={car.engine} />
            <Spec icon={BadgeCheck} label="Stav" value={car.condition} />
          </div>

          <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-ink-850 p-4">
            <Trust icon={FileText} text="Ověřený původ a stav km — reporty k vozu" />
            <Trust icon={ShieldCheck} text="Kupní smlouva a faktura v ceně" />
            <Trust icon={Undo2} text="Prověřeno technikem před prodejem" />
          </div>

          {sold ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 py-3.5 text-center font-semibold text-zinc-400">Tento vůz je již prodaný</div>
          ) : (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a href={`mailto:${COMPANY.email}?subject=${subject}&body=${body}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-ink-950 shadow-glow transition hover:brightness-110">
                <Mail className="h-4 w-4" /> Mám zájem
              </a>
              <a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10">
                <Phone className="h-4 w-4" /> Zavolat
              </a>
            </div>
          )}
          <p className="mt-3 text-center text-xs text-zinc-500">Reagujeme obvykle do pár hodin · {COMPANY.phone}</p>
        </div>
      </div>
    </div>
  );
}

function Spec({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-850 p-3">
      <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500"><Icon className="h-3.5 w-3.5 text-accent" /> {label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value || '—'}</div>
    </div>
  );
}

function Trust({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-zinc-300">
      <Icon className="h-4 w-4 shrink-0 text-accent" /> {text}
    </div>
  );
}
