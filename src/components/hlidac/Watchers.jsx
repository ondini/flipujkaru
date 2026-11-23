import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Loader2, Power, Search, Sparkles, ChevronDown } from 'lucide-react';
import { hlidacApi } from '../../lib/hlidacApi.js';
import { czk } from '../../data/content.js';
import { useHlidac, Loading, ErrorBox } from './HlidacAdmin.jsx';

const EMPTY = {
  name: '', brand: '', model: '', keywords: [], exclude_keywords: [], bodies: [], fuels: [], gearboxes: [],
  year_min: null, year_max: null, km_max: null, price_min: null, price_max: null, min_power_kw: null, max_power_kw: null,
  min_margin_czk: 100000, min_discount_pct: 10, portals: null, private_only: false, active: true,
};
// Hodnoty musí sedět s hlídačem (scraper/web/js/presets.js SPECS a matcher.SPEC).
const SPECS = {
  bodies: ['Karoserie', [['SUV', 'SUV'], ['kombi', 'Kombi'], ['sedan', 'Sedan / hatchback'], ['kupé', 'Kupé'], ['kabriolet', 'Kabriolet'], ['MPV', 'MPV / van'], ['malé auto', 'Malé auto']]],
  fuels: ['Palivo', [['benzín', 'Benzín'], ['nafta', 'Nafta'], ['hybrid', 'Hybrid'], ['elektro', 'Elektro'], ['LPG', 'LPG'], ['CNG', 'CNG']]],
  gearboxes: ['Převodovka', [['automat', 'Automat'], ['manuál', 'Manuál']]],
};
const RANGES = [
  ['Rok výroby', 'year_min', 'year_max', '', 1990, 2027],
  ['Nájezd do', null, 'km_max', 'km', 0, 500000],
  ['Cena', 'price_min', 'price_max', 'Kč', 0, 20000000],
  ['Výkon', 'min_power_kw', 'max_power_kw', 'kW', 20, 1100],
];
const DEAL = [
  ['Minimální marže', 'min_margin_czk', 'Kč', 'Prodej v ČR podle stejných aut minus cena auta, bez nákladů dovozu.'],
  ['Pod tržní cenou aspoň', 'min_discount_pct', '%', 'O kolik je auto levnější než stejná auta v EU nebo v ČR.'],
];
const input = 'w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent/60 focus:outline-none';

export default function Watchers() {
  const [data, error, loading, reload] = useHlidac(() => Promise.all([hlidacApi.config(), hlidacApi.brands()]));
  const [editing, setEditing] = useState(null); // {index, watcher}
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const [cfg, brands] = data;
  const brandName = (slug) => brands.find(([, s]) => s === slug)?.[0] || slug;

  const persist = async (watch) => {
    setBusy(true); setMsg(null);
    try { await hlidacApi.saveConfig({ watch, costs: cfg.costs }); setEditing(null); reload(); setMsg({ ok: true, text: 'Uloženo, hlídač změnu načte do minuty.' }); return true; }
    catch (e) { setMsg({ ok: false, text: e.message }); return false; }
    finally { setBusy(false); }
  };
  const toggle = (i) => persist(cfg.watch.map((w, j) => (j === i ? { ...w, active: !w.active } : w)));
  const remove = (i) => persist(cfg.watch.filter((_, j) => j !== i));

  if (editing) {
    return (
      <WatcherForm initial={editing.watcher} brands={brands} portals={cfg.portals} busy={busy} msg={msg}
        names={cfg.watch.filter((_, j) => j !== editing.index).map((w) => w.name)}
        onCancel={() => { setEditing(null); setMsg(null); }}
        onSave={(w) => persist(editing.index == null ? [...cfg.watch, w] : cfg.watch.map((x, j) => (j === editing.index ? w : x)))} />
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">{cfg.watch.length} hlídačů, zapnuto {cfg.watch.filter((w) => w.active).length}.</p>
        <button onClick={() => setEditing({ index: null, watcher: { ...EMPTY, portals: cfg.portals.map((p) => p.id) } })}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 shadow-glow hover:brightness-110"><Plus className="h-4 w-4" /> Nový hlídač</button>
      </div>
      {msg && <p className={`text-sm ${msg.ok ? 'text-accent' : 'text-red-400'}`}>{msg.text}</p>}
      <div className="overflow-hidden rounded-2xl border border-white/10">
        {cfg.watch.map((w, i) => (
          <div key={w.name} className={`flex flex-wrap items-center gap-3 bg-ink-850 p-4 ${i ? 'border-t border-white/5' : ''}`}>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-white">{w.name}</div>
              <div className="mt-0.5 text-xs text-zinc-500">{summary(w, brandName)}</div>
            </div>
            <button onClick={() => toggle(i)} disabled={busy} aria-pressed={w.active}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${w.active ? 'bg-accent-soft text-accent' : 'bg-white/5 text-zinc-400'}`}>
              <Power className="h-3.5 w-3.5" /> {w.active ? 'Zapnuto' : 'Vypnuto'}
            </button>
            <button onClick={() => setEditing({ index: i, watcher: w })} aria-label={`Upravit ${w.name}`} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-zinc-300 hover:text-white"><Pencil className="h-4 w-4" /></button>
            <DeleteButton name={w.name} onConfirm={() => remove(i)} disabled={busy} />
          </div>
        ))}
        {cfg.watch.length === 0 && <p className="bg-ink-850 p-6 text-center text-sm text-zinc-400">Zatím žádný hlídač.</p>}
      </div>
    </div>
  );
}

/** Mazání na dvě kliknutí (bez systémového okna). */
function DeleteButton({ name, onConfirm, disabled }) {
  const [ask, setAsk] = useState(false);
  if (ask) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs">
        <button onClick={() => { setAsk(false); onConfirm(); }} disabled={disabled} className="rounded-lg bg-red-500/20 px-2.5 py-1.5 font-bold text-red-300">Smazat</button>
        <button onClick={() => setAsk(false)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-zinc-300">Ne</button>
      </span>
    );
  }
  return <button onClick={() => setAsk(true)} aria-label={`Smazat ${name}`} className="grid h-9 w-9 place-items-center rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>;
}

function summary(w, brandName) {
  const parts = [`${brandName(w.brand)} ${w.model || ''}`.trim()];
  if (w.keywords?.length) parts.push(w.keywords.join(' / '));
  if (w.year_min || w.year_max) parts.push(`rok ${w.year_min || '…'}–${w.year_max || '…'}`);
  if (w.km_max) parts.push(`do ${w.km_max.toLocaleString('cs-CZ')} km`);
  if (w.price_max) parts.push(`do ${czk(w.price_max)}`);
  if (w.min_margin_czk) parts.push(`marže od ${czk(w.min_margin_czk)}`);
  parts.push(`${(w.portals || []).length} portálů`);
  return parts.join(' · ');
}

/* ---------- formulář ---------- */
function WatcherForm({ initial, brands, portals, names, busy, msg, onCancel, onSave }) {
  const [w, setW] = useState(() => ({ ...EMPTY, ...initial }));
  const [models, setModels] = useState([]);
  const [hint, setHint] = useState(null); // co se u modelu prodává
  const [err, setErr] = useState('');
  const [advanced, setAdvanced] = useState(Boolean(initial.model_regex || initial.exclude_regex || initial.vin_prefix));
  const set = (patch) => setW((x) => ({ ...x, ...patch }));

  useEffect(() => {
    setModels([]);
    if (w.brand) hlidacApi.models(w.brand).then(setModels, () => setModels([]));
  }, [w.brand]);
  useEffect(() => {
    setHint(null);
    if (!w.brand || !w.model) return undefined;
    const t = setTimeout(() => hlidacApi.suggest(w.brand, w.model).then(setHint, () => setHint(null)), 250);
    return () => clearTimeout(t);
  }, [w.brand, w.model]);

  const submit = (e) => {
    e.preventDefault();
    const name = (w.name || `${brands.find(([, s]) => s === w.brand)?.[0] || ''} ${w.model}`).trim();
    if (!w.brand) return setErr('Vyber značku.');
    if (!w.model && !w.model_regex) return setErr('Vyber model. Cena se počítá jen ze stejných aut, bez modelu to nejde.');
    if (names.includes(name)) return setErr(`Hlídač „${name}“ už existuje, zvol jiný název.`);
    for (const [label, lo, hi] of RANGES) if (lo && w[lo] != null && w[hi] != null && w[lo] > w[hi]) return setErr(`${label}: „od“ je větší než „do“.`);
    if (!w.portals?.length) return setErr('Vyber aspoň jeden portál.');
    setErr('');
    onSave({ ...w, name });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-white">{initial.name ? `Upravit: ${initial.name}` : 'Nový hlídač'}</h2>
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:text-white"><X className="h-4 w-4" /> Zpět</button>
      </div>

      <Card title="1. Auto">
        <div className="grid gap-3 sm:grid-cols-2">
          <Combo label="Značka" placeholder="Začni psát, třeba Škoda" options={brands} value={w.brand}
            onPick={(slug) => set({ brand: slug, model: '', keywords: [] })} />
          <Combo label="Model" placeholder={w.brand ? 'Začni psát, třeba Superb' : 'Nejdřív značka'} disabled={!w.brand}
            options={models.map(([n]) => [n, n])} value={w.model} onPick={(m) => set({ model: m, keywords: [] })} allowCustom />
        </div>
        {hint && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-400"><Sparkles className="h-3.5 w-3.5 text-accent" />
            {hint.count ? `Za posledních 60 dní hlídač viděl ${hint.count.toLocaleString('cs-CZ')} inzerátů tohoto modelu.` : 'Tenhle model hlídač zatím na trhu neviděl, nabídka verzí bude prázdná.'}
            {w.model && models.length > 0 && !models.some(([n]) => n.toLowerCase() === w.model.toLowerCase()) && ' Vlastní model: hlídač ho hledá podle názvu v inzerátu, portál, který ho nezná, ho přeskočí.'}
          </p>
        )}
      </Card>

      <Card title="2. Verze a výbava" help="Stačí, když inzerát obsahuje aspoň jednu vybranou. Čísla = kolik inzerátů ji mělo.">
        <Chips label="Motor" items={hint?.engines} selected={w.keywords} onToggle={(k) => set({ keywords: toggleIn(w.keywords, k) })} upper />
        <Chips label="Výbava" items={hint?.trims} selected={w.keywords} onToggle={(k) => set({ keywords: toggleIn(w.keywords, k) })} />
        <WordInput label="Vlastní slovo verze" values={w.keywords} onChange={(v) => set({ keywords: v })} placeholder="např. Black Edition" />
        <WordInput label="Vyloučit slova" values={w.exclude_keywords} onChange={(v) => set({ exclude_keywords: v })} placeholder="např. Cabrio*, poškozen*" />
      </Card>

      <Card title="3. Parametry">
        {Object.entries(SPECS).map(([field, [label, values]]) => {
          const seen = Object.fromEntries(hint?.[field] || []);
          return (
            <div key={field} className="mb-3">
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">{label} <span className="normal-case text-zinc-600">(nic = všechny)</span></div>
              <div className="flex flex-wrap gap-2">
                {values.map(([v, l]) => (
                  <Toggle key={v} on={w[field].includes(v)} onClick={() => set({ [field]: toggleIn(w[field], v) })}>{l}{seen[v] ? <span className="ml-1 text-zinc-500">{seen[v]}</span> : null}</Toggle>
                ))}
              </div>
            </div>
          );
        })}
        <div className="grid gap-3 sm:grid-cols-2">
          {RANGES.map(([label, lo, hi, unit, min, max]) => {
            const typical = { year_max: hint?.years, km_max: hint?.km, max_power_kw: hint?.power_kw }[hi];
            const fmt = (n) => (hi === 'year_max' ? String(n) : n.toLocaleString('cs-CZ'));
            return (
              <div key={hi}>
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}{unit ? ` (${unit})` : ''}</div>
                <div className="flex items-center gap-2">
                  {lo && <Num value={w[lo]} min={min} max={max} placeholder="od" onChange={(v) => set({ [lo]: v })} />}
                  <Num value={w[hi]} min={min} max={max} placeholder={lo ? 'do' : 'neřešit'} onChange={(v) => set({ [hi]: v })} />
                </div>
                {typical && <div className="mt-1 text-xs text-zinc-500">Na trhu obvykle {fmt(typical[0])}–{fmt(typical[1])}{unit ? ` ${unit}` : ''}</div>}
              </div>
            );
          })}
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={w.private_only} onChange={(e) => set({ private_only: e.target.checked })} className="h-4 w-4 accent-[#39ff14]" /> Jen soukromí prodejci
        </label>
      </Card>

      <Card title="4. Kdy poslat alert">
        <div className="grid gap-3 sm:grid-cols-2">
          {DEAL.map(([label, key, unit, help]) => (
            <div key={key}>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">{label} ({unit})</div>
              <Num value={w[key]} min={0} max={key === 'min_discount_pct' ? 60 : 5000000} placeholder="neřešit" onChange={(v) => set({ [key]: v })} />
              <div className="mt-1 text-xs text-zinc-500">{help}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="5. Portály">
        <div className="mb-2 flex gap-2 text-xs">
          <button type="button" onClick={() => set({ portals: portals.map((p) => p.id) })} className="text-accent hover:underline">Všechny</button>
          <button type="button" onClick={() => set({ portals: portals.filter((p) => ['CZ', 'SK'].includes(p.country)).map((p) => p.id) })} className="text-accent hover:underline">Jen CZ a SK</button>
          <button type="button" onClick={() => set({ portals: [] })} className="text-zinc-400 hover:underline">Žádný</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {portals.map((p) => (
            <Toggle key={p.id} on={w.portals.includes(p.id)} onClick={() => set({ portals: toggleIn(w.portals, p.id) })}>{p.label} <span className="text-zinc-500">{p.country}</span></Toggle>
          ))}
        </div>
      </Card>

      <Card title="6. Název a pokročilé">
        <input className={input} value={w.name} maxLength={60} onChange={(e) => set({ name: e.target.value })} placeholder="Název (prázdné = značka a model)" aria-label="Název hlídače" />
        <button type="button" onClick={() => setAdvanced(!advanced)} className="mt-3 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white">
          <ChevronDown className={`h-3.5 w-3.5 transition ${advanced ? 'rotate-180' : ''}`} /> Pokročilé (vlastní výrazy, VIN)
        </button>
        {advanced && (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <input className={`${input} font-mono`} value={w.model_regex || ''} onChange={(e) => set({ model_regex: e.target.value })} placeholder="výraz pro model, např. \bM2\b" aria-label="Vlastní výraz pro model" spellCheck={false} />
            <input className={`${input} font-mono`} value={w.exclude_regex || ''} onChange={(e) => set({ exclude_regex: e.target.value })} placeholder="výraz pro vyloučení" aria-label="Vlastní výraz pro vyloučení" spellCheck={false} />
            <input className={`${input} font-mono`} value={w.vin_prefix || ''} maxLength={11} onChange={(e) => set({ vin_prefix: e.target.value.toUpperCase() })} placeholder="VIN začíná, např. WBS" aria-label="VIN musí začínat" spellCheck={false} />
          </div>
        )}
      </Card>

      <div className="sticky bottom-3 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-ink-950/90 p-3 backdrop-blur">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 shadow-glow hover:brightness-110 disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Uložit hlídač
        </button>
        <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={w.active} onChange={(e) => set({ active: e.target.checked })} className="h-4 w-4 accent-[#39ff14]" /> Zapnutý</label>
        {(err || msg) && <span role="alert" className={`text-sm ${!err && msg?.ok ? 'text-accent' : 'text-red-400'}`}>{err || msg.text}</span>}
      </div>
    </form>
  );
}

const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

function Card({ title, help, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-ink-850 p-4 sm:p-5">
      <h3 className="font-semibold text-white">{title}</h3>
      {help && <p className="mt-0.5 text-xs text-zinc-500">{help}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Toggle({ on, onClick, children }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`rounded-xl border px-3 py-1.5 text-sm transition ${on ? 'border-accent/60 bg-accent-soft text-accent' : 'border-white/10 text-zinc-300 hover:border-white/25'}`}>{children}</button>
  );
}

function Num({ value, onChange, min, max, placeholder }) {
  return (
    <input type="number" inputMode="numeric" className={input} value={value ?? ''} min={min} max={max} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === '' ? null : Math.min(max, Math.max(min, Number(e.target.value))))} />
  );
}

/** Našeptávač: píšeš a filtruje se seznam [název, hodnota]. */
function Combo({ label, options, value, onPick, placeholder, disabled, allowCustom }) {
  const current = options.find(([, v]) => v === value)?.[0] || value || '';
  const [q, setQ] = useState(current);
  const [open, setOpen] = useState(false);
  useEffect(() => { setQ(current); }, [current]);
  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const hits = useMemo(() => {
    const f = fold(q.trim());
    const all = options.filter(([n]) => !f || fold(n).includes(f));
    const top = all.sort((a, b) => fold(a[0]).indexOf(f) - fold(b[0]).indexOf(f)).slice(0, 12);
    const typed = q.trim().replace(/\s+/g, ' ').slice(0, 40);
    if (allowCustom && typed && !options.some(([n]) => fold(n) === fold(typed))) top.push([`+ Přidat vlastní: „${typed}“`, typed]);
    return top;
  }, [q, options, allowCustom]);
  return (
    <div className="relative">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input className={`${input} pl-9`} value={q} disabled={disabled} placeholder={placeholder} aria-label={label} role="combobox" aria-expanded={open} autoComplete="off"
          onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => { setOpen(false); setQ(current); }, 150)}
          onKeyDown={(e) => { if (e.key === 'Enter' && open && hits[0]) { e.preventDefault(); onPick(hits[0][1]); setOpen(false); } }} />
      </div>
      {open && hits.length > 0 && (
        <ul role="listbox" className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-white/10 bg-ink-850 py-1 shadow-xl">
          {hits.map(([n, v]) => (
            <li key={v} role="option" aria-selected={v === value}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onPick(v); setOpen(false); }}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-white/5 ${v === value ? 'text-accent' : 'text-zinc-200'}`}>{n}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chips({ label, items, selected, onToggle, upper }) {
  if (!items?.length) return null;
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 18).map(([k, n]) => {
          const word = upper ? k.toUpperCase() : k.replace(/\b\w/g, (c) => c.toUpperCase());
          return <Toggle key={k} on={selected.some((s) => s.toLowerCase() === word.toLowerCase())} onClick={() => onToggle(selected.find((s) => s.toLowerCase() === word.toLowerCase()) || word)}>{word} <span className="text-zinc-500">{n}</span></Toggle>;
        })}
      </div>
    </div>
  );
}

function WordInput({ label, values, onChange, placeholder }) {
  const [v, setV] = useState('');
  const add = () => { const s = v.trim().replace(/\s+/g, ' ').slice(0, 40); if (s && !values.some((x) => x.toLowerCase() === s.toLowerCase())) onChange([...values, s]); setV(''); };
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="flex flex-wrap items-center gap-2">
        {values.map((x) => (
          <span key={x} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-sm text-zinc-200">{x}
            <button type="button" onClick={() => onChange(values.filter((y) => y !== x))} aria-label={`Odebrat ${x}`}><X className="h-3.5 w-3.5 text-zinc-500 hover:text-white" /></button></span>
        ))}
        <input className={`${input} max-w-[14rem]`} value={v} placeholder={placeholder} aria-label={label}
          onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }} onBlur={add} />
      </div>
    </div>
  );
}
