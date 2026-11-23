import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Radar, Loader2, RefreshCw, ExternalLink, WifiOff, Check, X, AlertTriangle, Save } from 'lucide-react';
import { hlidacApi } from '../../lib/hlidacApi.js';
import { czk, kmFmt } from '../../data/content.js';

const Watchers = lazy(() => import('./Watchers.jsx'));
const TelegramTemplate = lazy(() => import('./TelegramTemplate.jsx'));
const Delivery = lazy(() => import('./Delivery.jsx'));

const TABS = [
  { key: 'prehled', label: 'Přehled' },
  { key: 'hlidace', label: 'Hlídače' },
  { key: 'auta', label: 'Nalezená auta' },
  { key: 'odesilani', label: 'Odesílání' },
  { key: 'telegram', label: 'Telegram zpráva' },
  { key: 'nastaveni', label: 'Nastavení ceny' },
];

/** Admin → Hlídač inzerátů. Data jsou na Macu s hlídačem, sem chodí přes /api/hlidac (jen admin). */
export default function HlidacAdmin() {
  const [tab, setTab] = useState('prehled');
  return (
    <div className="space-y-5">
      <div>
        <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white"><Radar className="h-5 w-5 text-accent" /> Hlídač inzerátů</h1>
        <p className="mt-1 text-sm text-zinc-400">Nová auta z 9 portálů s marží proti stejným autům. Nastavení se projeví v hlídači do minuty.</p>
      </div>
      <div role="tablist" className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium transition ${tab === t.key ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <Suspense fallback={<Loading />}>
        {tab === 'prehled' && <Overview onOpen={setTab} />}
        {tab === 'hlidace' && <Watchers />}
        {tab === 'auta' && <Alerts />}
        {tab === 'odesilani' && <Delivery />}
        {tab === 'telegram' && <TelegramTemplate />}
        {tab === 'nastaveni' && <Costs />}
      </Suspense>
    </div>
  );
}

/* ---------- společné ---------- */
export function Loading() {
  return <div className="flex items-center gap-2 text-sm text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" /> Načítám…</div>;
}

export function ErrorBox({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
      <span className="inline-flex items-center gap-2">{error.offline ? <WifiOff className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />} {error.message}</span>
      {onRetry && <button onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-zinc-200 hover:text-white"><RefreshCw className="h-3.5 w-3.5" /> Zkusit znovu</button>}
    </div>
  );
}

/** Načte data z hlídače; vrací [data, error, loading, reload]. */
export function useHlidac(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fn().then((data) => setState({ data, error: null, loading: false }), (error) => setState({ data: null, error, loading: false }));
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);
  return [state.data, state.error, state.loading, load];
}

const PORTAL_NAMES = { sauto: 'Sauto', bazos: 'Bazoš.cz', bazos_sk: 'Bazoš.sk', mobilede: 'mobile.de', autoscout24: 'AutoScout24', kleinanzeigen: 'Kleinanzeigen', marktplaats: 'Marktplaats', '2dehands': '2dehands', willhaben: 'willhaben' };
const when = (iso) => (iso ? new Date(iso).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'nikdy');
const TG = {
  silent: ['jen uloženo', 'bg-white/5 text-zinc-400'], queued: ['čeká na Telegram', 'bg-amber-400/10 text-amber-200'],
  sent: ['v Telegramu', 'bg-sky-400/10 text-sky-300'], expired: ['propadlo (limit)', 'bg-white/5 text-zinc-500'],
  gone: ['prodáno dřív', 'bg-white/5 text-zinc-500'], dup: ['už odesláno jinde', 'bg-white/5 text-zinc-500'],
};
const STATE = { ok: ['běží', 'text-accent'], slow: ['pomalu', 'text-amber-300'], blocked: ['blokace', 'text-red-400'], down: ['stojí', 'text-zinc-500'] };

/* ---------- Přehled ---------- */
function Overview({ onOpen }) {
  const [o, error, loading, reload] = useHlidac(() => hlidacApi.overview());
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const portals = o.portals || [];
  const k = o.kpi;
  const tiles = [
    ['Aktivní hlídače', `${k.watchers_active} z ${k.watchers_total}`],
    ['Nalezeno dnes', k.sent_today],
    ['Nalezeno za týden', k.sent_week],
    ['Nové inzeráty 24 h', k.new_24h],
    ['Portály v provozu', `${k.portals_ok} z ${k.portals_total}`],
    ['Nejvyšší marže týdne', k.best_margin?.margin_czk ? czk(k.best_margin.margin_czk) : '–'],
  ];
  return (
    <div className="space-y-5">
      {k.watchers_active === 0 && (
        <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
          Všechny hlídače jsou vypnuté, hlídač nic nehledá. <button onClick={() => onOpen('hlidace')} className="font-semibold underline">Zapnout v záložce Hlídače</button>
        </p>
      )}
      {o.silent && (
        <p className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
          <span>Tichý režim: nalezená auta se jen ukládají sem, do Telegramu nechodí nic.</span>
          <button onClick={() => onOpen('odesilani')} className="font-semibold text-accent hover:underline">Odesílání</button>
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-ink-850 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
            <div className="mt-1 font-display text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>
      <section className="rounded-2xl border border-white/10 bg-ink-850 p-4">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-white">Portály</h2>
          <button onClick={reload} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"><RefreshCw className="h-3.5 w-3.5" /> Obnovit</button></div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {portals.map((p) => {
            const [label, color] = STATE[p.state] || [p.state, 'text-zinc-400'];
            return (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-ink-950/60 px-3 py-2 text-sm">
                <span className="text-zinc-200">{p.label} <span className="text-xs text-zinc-500">{p.country}</span></span>
                <span className="text-right"><span className={`font-semibold ${color}`}>{label}</span><span className="block text-xs text-zinc-500">{when(p.last)}</span></span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="rounded-2xl border border-white/10 bg-ink-850 p-4">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-white">Poslední nalezená auta</h2>
          <button onClick={() => onOpen('auta')} className="text-sm text-accent hover:underline">Všechna auta</button></div>
        <AlertList rows={(o.feed || []).filter((a) => a.sent).slice(0, 6)} />
      </section>
    </div>
  );
}

/* ---------- Nalezená auta ---------- */
function Alerts() {
  const [rows, error, loading, reload] = useHlidac(() => hlidacApi.alerts(300));
  const [filter, setFilter] = useState('sent');
  const [watcher, setWatcher] = useState('');
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const watchers = [...new Set(rows.map((r) => r.watcher))];
  const shown = rows.filter((r) => (filter === 'all' || (filter === 'sent') === r.sent) && (!watcher || r.watcher === watcher));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[['sent', 'Nalezené'], ['rejected', 'Zamítnuté'], ['all', 'Vše']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} aria-pressed={filter === v}
            className={`rounded-xl border px-3 py-1.5 text-sm ${filter === v ? 'border-accent/50 bg-accent-soft text-accent' : 'border-white/10 text-zinc-400 hover:text-white'}`}>{l}</button>
        ))}
        <select value={watcher} onChange={(e) => setWatcher(e.target.value)} aria-label="Hlídač"
          className="rounded-xl border border-white/10 bg-ink-850 px-3 py-1.5 text-sm text-zinc-200">
          <option value="">Všechny hlídače</option>
          {watchers.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>
      <div className="rounded-2xl border border-white/10 bg-ink-850 p-4">
        <AlertList rows={shown} showReason />
        {shown.length === 0 && <p className="text-sm text-zinc-400">Nic tu není.</p>}
      </div>
    </div>
  );
}

function AlertList({ rows, showReason }) {
  return (
    <ul className="divide-y divide-white/5">
      {rows.map((a) => (
        <li key={`${a.portal}-${a.url}-${a.watcher}`} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
          <div className="min-w-0 flex-1">
            <a href={safeUrl(a.url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-accent">
              <span className="truncate">{a.title}</span> <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
            <div className="mt-0.5 text-xs text-zinc-500">
              {[a.year, a.km != null ? kmFmt(a.km) : null, PORTAL_NAMES[a.portal] || a.portal, a.location, a.watcher, when(a.at)].filter(Boolean).join(' · ')}
            </div>
            {a.sent && TG[a.tg] && <span className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-[11px] ${TG[a.tg][1]}`}>{TG[a.tg][0]}</span>}
            {showReason && !a.sent && a.reason && <div className="mt-1 inline-flex items-center gap-1 text-xs text-red-300"><X className="h-3 w-3" /> {a.reason}</div>}
          </div>
          <div className="text-right">
            <div className="font-semibold text-white">{a.price_czk ? czk(a.price_czk) : a.price ? `${a.price.toLocaleString('cs-CZ')} ${a.currency}` : '–'}</div>
            {a.margin_czk != null && <div className="inline-flex items-center gap-1 text-xs font-semibold text-accent"><Check className="h-3 w-3" /> marže {czk(Math.round(a.margin_czk))}</div>}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Odkazy z hlídače jen jako http(s), nic jiného (javascript: apod.) se nevykreslí. */
export const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : undefined);

/* ---------- Nastavení ceny ---------- */
function Costs() {
  const [cfg, error, loading, reload] = useHlidac(() => hlidacApi.config());
  const [draft, setDraft] = useState(null);
  const [msg, setMsg] = useState(null);
  useEffect(() => { if (cfg) setDraft({ ...cfg.costs }); }, [cfg]);
  if (loading || !draft) return error ? <ErrorBox error={error} onRetry={reload} /> : <Loading />;
  const save = async () => {
    setMsg(null);
    try { await hlidacApi.saveConfig({ watch: cfg.watch, costs: draft }); setMsg({ ok: true, text: 'Uloženo.' }); reload(); }
    catch (e) { setMsg({ ok: false, text: e.message }); }
  };
  const fields = [
    ['sale_discount_pct', 'Sleva při prodeji v ČR', 'O kolik procent níž než inzerovaná cena stejných aut v ČR auto reálně prodáš.'],
    ['cz_vs_eu_pct', 'Česko proti EU', 'Když v ČR stejné auto není: o kolik procent je v ČR dražší než v EU.'],
  ];
  return (
    <div className="max-w-xl space-y-4 rounded-2xl border border-white/10 bg-ink-850 p-5">
      {fields.map(([k, label, help]) => (
        <label key={k} className="block">
          <span className="text-sm font-semibold text-white">{label}</span>
          <span className="mt-0.5 block text-xs text-zinc-500">{help}</span>
          <span className="mt-2 flex items-center gap-2">
            <input type="number" step="0.5" min="-50" max="50" value={draft[k] ?? ''} onChange={(e) => setDraft({ ...draft, [k]: e.target.value === '' ? null : Number(e.target.value) })}
              className="w-28 rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-white" />
            <span className="text-sm text-zinc-400">%</span>
          </span>
        </label>
      ))}
      <p className="text-xs text-zinc-500">Náklady dovozu se do marže nepočítají.</p>
      <div className="flex items-center gap-3">
        <button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 shadow-glow hover:brightness-110"><Save className="h-4 w-4" /> Uložit</button>
        {msg && <span className={`text-sm ${msg.ok ? 'text-accent' : 'text-red-400'}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
