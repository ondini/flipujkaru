import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Gauge, Calendar, Fuel, Zap, CarFront, ExternalLink, Loader2, AlertTriangle, Cog, Car } from 'lucide-react';
import { useUndervaluedDetail } from '../../hooks/useDeals.js';
import { BODY_LABELS, FUEL_LABELS, GEARBOX_LABELS, dealLabel } from '../../data/dealLabels.js';

/* ============================================================
   Detail podhodnoceného vozu — obsahově stejný jako
   UndervaluedDetailModal v algdash: cena mobile.de vs. referenční
   cena sauto.cz, histogram srovnávacího vzorku a tabulka vozů,
   ze kterých byla referenční cena spočtena.
============================================================ */

const nf = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 });
const toNum = (v) => (v === null || v === undefined || v === '' ? NaN : Number(v));
const czk = (v) => (Number.isFinite(toNum(v)) ? `${nf.format(toNum(v))} Kč` : '—');
const eur = (v) => (Number.isFinite(toNum(v)) ? `${nf.format(toNum(v))} €` : '—');
const km = (v) => (Number.isFinite(toNum(v)) ? `${nf.format(toNum(v))} km` : '—');
const pct = (v) => (Number.isFinite(toNum(v)) ? `${Math.round(toNum(v) * 100)} %` : '—');

// Stejná heuristika jako algdash (lib/format.js → isSuspiciousGap)
function isSuspiciousGap(item, currentYear = new Date().getFullYear()) {
  if (item.gap_pct == null || item.gap_pct < 0.6) return false;
  const recent = typeof item.year === 'number' && currentYear - item.year <= 3;
  const lowKm = typeof item.mileage_km === 'number' && item.mileage_km < 30000;
  return recent || lowKm;
}

const BIN_COUNT = 8;

function buildHistogram(prices, targetPrice) {
  if (!prices.length) return [];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) {
    return [{ label: `${Math.round(min / 1000)}k`, count: prices.length, from: min, to: max, isTarget: targetPrice === min }];
  }
  const width = (max - min) / BIN_COUNT;
  const bins = Array.from({ length: BIN_COUNT }, (_, i) => ({ from: min + i * width, to: min + (i + 1) * width, count: 0 }));
  prices.forEach((p) => {
    const idx = Math.min(BIN_COUNT - 1, Math.max(0, Math.floor((p - min) / width)));
    bins[idx].count += 1;
  });
  return bins.map((b, i) => ({
    ...b,
    label: `${Math.round(b.from / 1000)}–${Math.round(b.to / 1000)}k`,
    isTarget: targetPrice != null && targetPrice >= b.from && (targetPrice <= b.to || i === bins.length - 1),
  }));
}

function Histogram({ bins }) {
  const maxCount = Math.max(1, ...bins.map((b) => b.count));
  return (
    <div className="mt-3">
      <div className="flex h-44 items-end gap-1.5 border-b border-white/10">
        {bins.map((bin, i) => (
          <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
            <div
              className={`w-full rounded-t ${bin.isTarget ? 'bg-accent' : 'bg-ink-600 group-hover:bg-zinc-500'}`}
              style={{ height: `${(bin.count / maxCount) * 100}%`, minHeight: bin.count ? 2 : 0 }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-ink-950 px-2.5 py-1.5 text-[11px] shadow-soft group-hover:block">
              <div className="font-semibold text-white">{bin.label} Kč</div>
              <div className="text-zinc-300">{bin.count} inzerátů</div>
              {bin.isTarget && <div className="text-accent">obsahuje cenu mobile.de vozu</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1.5">
        {bins.map((bin, i) => (
          <div key={i} className="flex-1 truncate text-center text-[10px] text-zinc-500" title={`${bin.label} Kč`}>{bin.label}</div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-accent" /> cenové pásmo tohoto vozu</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-ink-600" /> inzeráty sauto.cz</span>
      </div>
    </div>
  );
}

export default function DealDetailModal({ externalId, reference = 'median', minSampleSize, onClose }) {
  const [idx, setIdx] = useState(0);
  const open = Boolean(externalId);
  const { data, isLoading, isError } = useUndervaluedDetail(externalId, { reference, min_sample_size: minSampleSize });
  const photos = data?.images || [];
  const has = photos.length > 0;
  const cohort = data?.cohort || [];

  useEffect(() => {
    if (!open) return;
    setIdx(0);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % Math.max(1, photos.length));
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + Math.max(1, photos.length)) % Math.max(1, photos.length));
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, photos.length, onClose]);

  if (!open) return null;
  const next = () => setIdx((i) => (i + 1) % photos.length);
  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);

  const cohortPrices = cohort.map((r) => Number(r.price_czk)).filter((n) => Number.isFinite(n));
  const targetPrice = data ? Number(data.price_czk) : null;
  const histogram = buildHistogram(cohortPrices, targetPrice);
  const suspicious = data ? isSuspiciousGap(data) : false;

  return (
    <div
      className="fixed inset-0 z-[110] flex justify-center bg-ink-950/85 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        aria-label="Zavřít"
        className="fixed right-3 top-3 z-[121] grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-ink-950/80 text-white backdrop-blur transition hover:bg-ink-950 sm:hidden"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className="animate-fade-up flex max-h-screen w-full max-w-4xl flex-col overflow-y-auto bg-ink-900 sm:max-h-[92vh] sm:rounded-3xl sm:border sm:border-white/10 lg:flex-row lg:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== Galerie ===== */}
        <div className="relative flex shrink-0 flex-col bg-ink-950 lg:w-[45%]">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-ink-700 to-ink-850">
            {has ? (
              <img src={photos[idx]} alt={`foto ${idx + 1}`} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-white/10"><CarFront className="h-20 w-20" /></div>
            )}
            {photos.length > 1 && (
              <>
                <button onClick={prev} aria-label="Předchozí" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-ink-950/60 text-white backdrop-blur transition hover:bg-ink-950"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={next} aria-label="Další" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-ink-950/60 text-white backdrop-blur transition hover:bg-ink-950"><ChevronRight className="h-5 w-5" /></button>
                <span className="absolute bottom-3 right-3 rounded-lg bg-ink-950/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">{idx + 1} / {photos.length}</span>
              </>
            )}
          </div>
        </div>

        {/* ===== Info ===== */}
        <div className="flex flex-1 flex-col p-6 md:p-7 lg:overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">mobile.de</span>
              <h2 className="mt-1 font-display text-2xl font-bold text-white md:text-3xl">
                {data?.manufacturer} <span className="font-normal text-zinc-300">{data?.model}</span>
              </h2>
              {suspicious && (
                <span
                  className="mt-2 inline-flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-zinc-400"
                  title="Neobvykle vysoký rozdíl u novějšího/nízko najetého vozu – může jít o chybu při čtení ceny (např. leasingová splátka), ne o skutečnou nabídku."
                >
                  <AlertTriangle className="h-3 w-3" /> cena k ověření
                </span>
              )}
            </div>
            <button onClick={onClose} aria-label="Zavřít" className="hidden h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-zinc-400 transition hover:text-white sm:grid">
              <X className="h-4 w-4" />
            </button>
          </div>

          {isLoading && !data && (
            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" /> Načítám detail…</div>
          )}
          {isError && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">Detail inzerátu se nepodařilo načíst.</p>
          )}
          {!isLoading && !isError && !data && (
            <p className="mt-4 rounded-xl border border-white/10 bg-ink-950 p-4 text-sm text-zinc-400">Inzerát už není k dispozici.</p>
          )}

          {data && (
            <>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-white/10 bg-ink-850 p-4">
                <div>
                  <div className="text-xs text-zinc-500">Cena mobile.de</div>
                  <div className="font-display text-3xl font-bold text-white">{czk(data.price_czk)}</div>
                  <div className="text-sm text-zinc-500">{eur(data.price_eur)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500">Rozdíl vůči sauto {reference === 'p25' ? 'spodnímu kvartilu' : 'mediánu'}</div>
                  <div className="font-display text-2xl font-bold text-accent">{czk(data.gap_czk)}</div>
                  <div className="text-sm text-accent/70">{pct(data.gap_pct)}</div>
                </div>
              </div>

              {data.sauto_ref_price != null && (
                <p className="mt-2 text-xs text-zinc-500">
                  Referenční cena sauto.cz ({reference === 'p25' ? 'p25' : 'medián'}): <span className="font-semibold text-zinc-300">{czk(data.sauto_ref_price)}</span>
                  {' '}— spočtena ze {cohort.length} srovnatelných českých inzerátů níže. Rozdíl je hrubý (bez dopravy, přeregistrace, DPH a kurzového rizika).
                </p>
              )}

              {data.source_url && (
                <a
                  href={data.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent/20"
                >
                  <ExternalLink className="h-4 w-4" /> Zobrazit původní inzerát na mobile.de
                </a>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Spec icon={Calendar} label="Rok výroby" value={data.year} />
                <Spec icon={Gauge} label="Najeto" value={km(data.mileage_km)} />
                <Spec icon={Fuel} label="Palivo" value={dealLabel(FUEL_LABELS, data.fuel_type)} />
                <Spec icon={Zap} label="Výkon" value={data.power_kw != null ? `${data.power_kw} kW` : null} />
                <Spec icon={Cog} label="Převodovka" value={dealLabel(GEARBOX_LABELS, data.gearbox)} />
                <Spec icon={Car} label="Karoserie" value={dealLabel(BODY_LABELS, data.body_type)} />
              </div>
              {data.body_type && (
                <p className="mt-2 text-xs text-zinc-500">
                  {data.body_matched
                    ? 'Srovnáno jen s auty se stejnou karoserií.'
                    : 'Aut se stejnou karoserií je málo — srovnáno se všemi karoseriemi tohoto modelu.'}
                </p>
              )}

              <div className="mt-5">
                <h3 className="font-display font-bold text-white">Srovnávací vzorek sauto.cz (n = {cohort.length})</h3>
                {cohort.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-500">Tento inzerát nemá žádný srovnávací vzorek.</p>
                ) : (
                  <>
                    <Histogram bins={histogram} />
                    <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-white/10">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-ink-850 text-zinc-500">
                          <tr>
                            <th className="px-3 py-2 font-medium">Vůz</th>
                            <th className="px-3 py-2 font-medium">Rok</th>
                            <th className="px-3 py-2 font-medium">Nájezd</th>
                            <th className="px-3 py-2 font-medium">Výkon</th>
                            <th className="px-3 py-2 font-medium">Cena</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cohort.map((row) => (
                            <tr key={row.external_id} className="border-t border-white/5 text-zinc-300">
                              <td className="px-3 py-1.5">
                                {row.source_url ? (
                                  <a href={row.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent transition hover:underline">
                                    {row.manufacturer} {row.model}
                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                  </a>
                                ) : (
                                  <>{row.manufacturer} {row.model}</>
                                )}
                              </td>
                              <td className="px-3 py-1.5">{row.year ?? '—'}</td>
                              <td className="px-3 py-1.5">{km(row.mileage_km)}</td>
                              <td className="px-3 py-1.5">{row.power_kw != null ? `${row.power_kw} kW` : '—'}</td>
                              <td className="px-3 py-1.5">{czk(row.price_czk)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Spec({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-850 p-3">
      <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500"><Icon className="h-3.5 w-3.5 text-accent" /> {label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value ?? '—'}</div>
    </div>
  );
}
