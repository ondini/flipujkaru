import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Loader2, Radar, Mail, ExternalLink, Pause, Play, Car } from 'lucide-react';
import { useApp } from '../../AppContext.jsx';
import { clenHlidacApi } from '../../lib/clenHlidacApi.js';
import { czk, kmFmt } from '../../data/content.js';
import { Combo, Toggle } from '../hlidac/Watchers.jsx';
import { useHlidac, Loading, ErrorBox, safeUrl } from '../hlidac/HlidacAdmin.jsx';

/* Hlídač pro členy: člen si nastaví až N hlídačů (počet určuje admin), hlídač mu posílá
   auta s marží e-mailem a ukazuje je tady. Hodnoty paliv a převodovek posílá hlídač (members.FUELS). */
const EMPTY = { label: '', brand: '', model: '', year_min: null, year_max: null, price_max: null, km_max: null, min_margin_czk: 50000, fuels: [], gearboxes: [], active: true };
const FUEL_NAMES = { 'benzín': 'Benzín', nafta: 'Nafta', hybrid: 'Hybrid', elektro: 'Elektro', LPG: 'LPG', CNG: 'CNG' };
const GEAR_NAMES = { automat: 'Automat', 'manuál': 'Manuál' };
const input = 'w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent/60 focus:outline-none';
const THIS_YEAR = new Date().getFullYear();

export default function MyWatcher() {
  const { user } = useApp();
  const [data, error, loading, reload] = useHlidac(() => Promise.all([clenHlidacApi.watchers(), clenHlidacApi.brands()]));
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const [info, brands] = data;
  const brandName = (slug) => brands.find(([, s]) => s === slug)?.[0] || slug;
  const full = info.watchers.length >= info.limit;

  const done = (text) => { setEditing(null); setMsg({ ok: true, text }); reload(); };

  if (editing) {
    return <WatcherForm initial={editing} brands={brands} info={info} onCancel={() => setEditing(null)}
      onSaved={() => done(editing.id ? 'Uloženo. Upravený hlídač si napřed projde, co je na trhu teď, a pošle jen nová auta.' : 'Hlídač běží. Napřed si projde, co je na trhu teď, a pošle ti jen auta, která přibudou.')} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-ink-900 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white"><Radar className="h-5 w-5 text-accent" /> Můj hlídač</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Zadej auto, které chceš flipnout. Hlídač projíždí nové inzeráty v Česku, Německu, Rakousku, Nizozemsku a Belgii,
              ověří, že jde opravdu o stejné auto, a porovná cenu se stejnými auty v ČR. Když vyjde marže, pošle ti e-mail.
            </p>
          </div>
          <button type="button" disabled={full} onClick={() => { setMsg(null); setEditing({ ...EMPTY }); }}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-ink-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
            <Plus className="h-4 w-4" /> Nový hlídač
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
          <span><b className="text-white">{info.watchers.length}</b> z {info.limit} hlídačů</span>
          <span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4 text-zinc-500" /> {user?.email}, nejvýš {info.email_cap} e-mailů denně</span>
        </div>
        {!info.email_ready && <p className="mt-3 rounded-xl bg-amber-400/10 px-3 py-2 text-sm text-amber-200">E-maily zatím nechodí, nalezená auta ale uvidíš níž.</p>}
        {full && <p className="mt-3 text-sm text-zinc-500">Máš všechny hlídače. Pro jiné auto jeden uprav nebo smaž.</p>}
      </section>

      {msg && <p className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? 'bg-accent-soft text-accent' : 'bg-red-500/10 text-red-300'}`}>{msg.text}</p>}

      <div className="grid gap-3 md:grid-cols-2">
        {info.watchers.map((w) => <WatcherCard key={w.id} w={w} brandName={brandName} onEdit={() => { setMsg(null); setEditing(w); }}
          onChanged={(text) => done(text)} onError={(text) => setMsg({ ok: false, text })} />)}
        {info.watchers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-zinc-400 md:col-span-2">
            Zatím nic nehlídáš. Klikni na <b className="text-white">Nový hlídač</b>, vyber značku a model a nastav, kolik chceš vydělat.
          </div>
        )}
      </div>

      <Found />
    </div>
  );
}

function summary(w) {
  const out = [];
  if (w.year_min || w.year_max) out.push(w.year_min && w.year_max ? (w.year_min === w.year_max ? `${w.year_min}` : `${w.year_min}–${w.year_max}`) : w.year_min ? `od ${w.year_min}` : `do ${w.year_max}`);
  if (w.km_max) out.push(`do ${kmFmt(w.km_max)}`);
  if (w.price_max) out.push(`do ${czk(w.price_max)}`);
  for (const f of w.fuels || []) out.push(FUEL_NAMES[f] || f);
  for (const g of w.gearboxes || []) out.push(GEAR_NAMES[g] || g);
  return out;
}

function WatcherCard({ w, brandName, onEdit, onChanged, onError }) {
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const run = async (fn, text) => {
    setBusy(true);
    try { await fn(); onChanged(text); } catch (e) { onError(e.message); setBusy(false); }
  };
  const title = `${brandName(w.brand)} ${w.model}`;
  return (
    <article className={`rounded-2xl border bg-ink-900 p-5 ${w.active ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-bold text-white">{w.label || title}</h3>
          {w.label && <p className="text-sm text-zinc-500">{title}</p>}
        </div>
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${w.active ? 'bg-accent-soft text-accent' : 'bg-white/5 text-zinc-400'}`}>{w.active ? 'hlídá' : 'pozastaveno'}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {summary(w).map((s) => <span key={s} className="rounded-lg bg-white/5 px-2 py-1 text-xs text-zinc-300">{s}</span>)}
        {summary(w).length === 0 && <span className="text-xs text-zinc-500">všechny ročníky a ceny</span>}
      </div>
      <p className="mt-3 text-sm text-zinc-400">Pošle auta s marží od <b className="text-white">{czk(w.min_margin_czk || 0)}</b></p>
      <div className="mt-4 flex flex-wrap gap-2">
        {confirm ? (
          <>
            <span className="self-center text-sm text-zinc-300">Opravdu smazat?</span>
            <button type="button" disabled={busy} onClick={() => run(() => clenHlidacApi.remove(w.id), 'Hlídač smazaný.')}
              className="rounded-xl bg-red-500/90 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Mažu…' : 'Smazat'}</button>
            <button type="button" onClick={() => setConfirm(false)} className="rounded-xl border border-white/10 px-3 py-1.5 text-sm text-zinc-300">Nechat</button>
          </>
        ) : (
          <>
            <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:text-white"><Pencil className="h-3.5 w-3.5" /> Upravit</button>
            <button type="button" disabled={busy} onClick={() => run(() => clenHlidacApi.save({ ...w, active: !w.active }), w.active ? 'Hlídač pozastavený.' : 'Hlídač zase hlídá.')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:text-white disabled:opacity-50">
              {w.active ? <><Pause className="h-3.5 w-3.5" /> Pozastavit</> : <><Play className="h-3.5 w-3.5" /> Spustit</>}
            </button>
            <button type="button" onClick={() => setConfirm(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-sm text-zinc-400 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /> Smazat</button>
          </>
        )}
      </div>
    </article>
  );
}

function NumberField({ label, value, onChange, suffix, placeholder, min, max }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
      <span className="relative block">
        <input type="number" inputMode="numeric" className={`${input} ${suffix ? 'pr-12' : ''}`} value={value ?? ''} placeholder={placeholder} min={min} max={max}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">{suffix}</span>}
      </span>
    </label>
  );
}

function WatcherForm({ initial, brands, info, onCancel, onSaved }) {
  const [w, setW] = useState(() => ({ ...EMPTY, ...initial }));
  const [models, setModels] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (patch) => setW((x) => ({ ...x, ...patch }));
  const flip = (k, v) => set({ [k]: w[k].includes(v) ? w[k].filter((x) => x !== v) : [...w[k], v] });

  useEffect(() => {
    setModels([]);
    if (w.brand) clenHlidacApi.models(w.brand).then(setModels, () => setModels([]));
  }, [w.brand]);

  const submit = async (e) => {
    e.preventDefault();
    if (!w.brand) return setErr('Vyber značku.');
    if (!w.model) return setErr('Vyber nebo dopiš model. Marže se počítá jen ze stejných aut, bez modelu to nejde.');
    if (w.year_min && w.year_max && w.year_min > w.year_max) return setErr('Rok „od“ je větší než „do“.');
    setErr(''); setBusy(true);
    try { await clenHlidacApi.save(w); onSaved(); } catch (x) { setErr(x.message); setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-white/10 bg-ink-900 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-white">{initial.id ? 'Upravit hlídač' : 'Nový hlídač'}</h2>
        <button type="button" onClick={onCancel} aria-label="Zavřít" className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Combo label="Značka" options={brands} value={w.brand} placeholder="Začni psát, třeba BMW" onPick={(v) => set({ brand: v, model: v === w.brand ? w.model : '' })} />
        <Combo label="Model" options={models} value={w.model} disabled={!w.brand} allowCustom
          placeholder={w.brand ? 'Vyber, nebo dopiš vlastní' : 'Napřed vyber značku'} onPick={(v) => set({ model: v })} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NumberField label="Rok od" value={w.year_min} onChange={(v) => set({ year_min: v })} placeholder="2018" min={1990} max={THIS_YEAR + 1} />
        <NumberField label="Rok do" value={w.year_max} onChange={(v) => set({ year_max: v })} placeholder={String(THIS_YEAR)} min={1990} max={THIS_YEAR + 1} />
        <NumberField label="Cena do" value={w.price_max} onChange={(v) => set({ price_max: v })} suffix="Kč" placeholder="bez limitu" />
        <NumberField label="Nájezd do" value={w.km_max} onChange={(v) => set({ km_max: v })} suffix="km" placeholder="bez limitu" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Palivo</span>
          <div className="flex flex-wrap gap-2">{info.fuels.map((f) => <Toggle key={f} on={w.fuels.includes(f)} onClick={() => flip('fuels', f)}>{FUEL_NAMES[f] || f}</Toggle>)}</div>
        </div>
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Převodovka</span>
          <div className="flex flex-wrap gap-2">{info.gearboxes.map((g) => <Toggle key={g} on={w.gearboxes.includes(g)} onClick={() => flip('gearboxes', g)}>{GEAR_NAMES[g] || g}</Toggle>)}</div>
        </div>
      </div>
      <p className="-mt-2 text-xs text-zinc-500">Nic nevybráno = hlídá všechno.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <NumberField label="Marže aspoň" value={w.min_margin_czk} onChange={(v) => set({ min_margin_czk: v })} suffix="Kč" placeholder="50000" min={0} />
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">Prodejní cena stejných aut v ČR minus cena inzerátu. Dovoz, přepis a servis ještě odečti.</p>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Vlastní název (nepovinné)</span>
          <input className={input} value={w.label} maxLength={60} placeholder="třeba M2 na léto" onChange={(e) => set({ label: e.target.value })} />
        </label>
      </div>

      {err && <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-ink-950 transition hover:brightness-110 disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {initial.id ? 'Uložit' : 'Spustit hlídač'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 hover:text-white">Zrušit</button>
      </div>
    </form>
  );
}

const ago = (iso) => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const s = (Date.now() - t) / 1000;
  if (s < 3600) return `před ${Math.max(1, Math.round(s / 60))} min`;
  if (s < 86400) return `před ${Math.round(s / 3600)} h`;
  return new Date(t).toLocaleDateString('cs-CZ');
};

function Found() {
  const [data, error, loading, reload] = useHlidac(() => clenHlidacApi.found(60));
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-bold text-white">Nalezená auta</h2>
      {loading && <Loading />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      {data && data.found.length === 0 && (
        <p className="rounded-2xl border border-white/10 bg-ink-900 p-6 text-sm text-zinc-400">
          Zatím nic. Hlídač posílá jen auta, kde sedí model, nájezd i marže, takže první může přijít za den, ale i za týden.
        </p>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        {data?.found.map((f) => <FoundCard key={`${f.url}-${f.at}`} f={f} />)}
      </div>
    </section>
  );
}

function FoundCard({ f }) {
  const price = f.price_czk || (f.currency === 'CZK' ? f.price : null);
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-ink-900 p-4 sm:flex-row">
      {safeUrl(f.image) ? <img src={f.image} alt="" loading="lazy" className="aspect-[16/9] w-full shrink-0 rounded-xl object-cover sm:aspect-auto sm:h-28 sm:w-40" />
        : <div className="hidden h-28 w-40 shrink-0 place-items-center rounded-xl bg-white/5 sm:grid"><Car className="h-8 w-8 text-zinc-600" /></div>}
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-white">{f.title}</h3>
        <p className="mt-1 text-xs text-zinc-500">{[f.year, f.km != null && kmFmt(f.km), f.location].filter(Boolean).join(' · ')} · {ago(f.at)}</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
          {price && <span className="text-zinc-300">za {czk(price)}</span>}
          {f.margin_czk != null && <span className="font-bold text-accent">marže ≈ {czk(f.margin_czk)}</span>}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {safeUrl(f.url) && <a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-white hover:text-accent">Inzerát <ExternalLink className="h-3 w-3" /></a>}
          {(f.evidence || []).filter((e) => safeUrl(e.url)).slice(0, 3).map((e, i) => (
            <a key={e.url} href={e.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline decoration-white/20 hover:text-white">stejné auto {i + 1}{e.czk ? ` (${czk(e.czk)})` : ''}</a>
          ))}
        </div>
      </div>
    </article>
  );
}
