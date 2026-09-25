import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Radar, GraduationCap, Receipt, Settings, PiggyBank, Car, Trophy,
  LogOut, ArrowLeft, ExternalLink, Download, Check, TrendingUp, ChevronRight, ChevronLeft, Type,
  Calculator, Users, ArrowRight, Sparkles, SlidersHorizontal, RotateCcw, Table2, Gauge,
  ArrowUpDown, ArrowUp, ArrowDown, Search, Loader2,
} from 'lucide-react';
import { useApp } from '../AppContext.jsx';
import { czk, kmFmt } from '../data/content.js';
import { supabase } from '../lib/supabase.js';
import { dealsApi } from '../lib/dealsApi.js';
import { useUndervalued, useMobiledeManufacturers, useMobiledeModels } from '../hooks/useDeals.js';
import { DASH_NAV, DASH_STATS, COURSES, INVOICES, ONBOARDING } from '../data/member.js';
import { LogoMark } from './Logo.jsx';

// Panely → lazy, načtou se až po kliknutí na danou záložku
const AdminCars = lazy(() => import('./AdminCars.jsx'));
const TextsAdmin = lazy(() => import('./TextsAdmin.jsx'));
const MyFlips = lazy(() => import('./dashboard/MyFlips.jsx'));
const CalcPanel = lazy(() => import('./dashboard/CalcPanel.jsx'));
const Community = lazy(() => import('./dashboard/Community.jsx'));

const NAV_ICONS = { LayoutDashboard, Radar, GraduationCap, Receipt, Settings, Car, Type, Calculator, Users, TrendingUp, Sparkles };
const STAT_ICONS = { PiggyBank, Car, Trophy };

export default function Dashboard() {
  const { user, member, isAdmin, backToSite, signOut } = useApp();
  const [tab, setTab] = useState('prehled');
  const planName = member?.plan?.name || null; // null = zatím bez členství
  // Adminovi přidáme do menu „Správa aut"
  const navItems = isAdmin
    ? [...DASH_NAV, { key: 'admin', label: 'Správa aut', icon: 'Car' }, { key: 'texty', label: 'Texty webu', icon: 'Type' }]
    : DASH_NAV;

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Horní lišta */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-ink-850"><LogoMark className="h-6 w-6" /></span>
            <span className="font-display text-lg font-bold text-white">Flipuj<span className="text-accent">Káru</span></span>
            <span className="ml-2 hidden rounded-md bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent sm:inline">Administrace</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={backToSite} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Zpět na web</span>
            </button>
            <button onClick={signOut} aria-label="Odhlásit" className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:text-white">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Odhlásit</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        {/* Sidebar / taby */}
        <aside className="lg:w-60 lg:shrink-0">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
            {navItems.map((n) => {
              const Icon = NAV_ICONS[n.icon];
              const active = tab === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => setTab(n.key)}
                  className={`inline-flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition ${active ? 'bg-accent text-ink-950' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                >
                  {Icon && <Icon className="h-4 w-4" />} {n.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Obsah */}
        <main className="min-w-0 flex-1">
          <Suspense fallback={<div className="flex items-center gap-2 text-sm text-zinc-400"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-accent" /> Načítám…</div>}>
            {tab === 'prehled' && <Overview user={user} planName={planName} backToSite={backToSite} setTab={setTab} />}
            {tab === 'flipy' && <MyFlips />}
            {tab === 'kalkulacka' && <CalcPanel />}
            {tab === 'doporucene' && <RecommendedFlips />}
            {tab === 'materialy' && <Materials />}
            {tab === 'komunita' && <Community />}
            {tab === 'faktury' && <Invoices planName={planName} />}
            {tab === 'nastaveni' && <SettingsPanel user={user} planName={planName} signOut={signOut} />}
            {tab === 'admin' && isAdmin && <AdminCars />}
            {tab === 'texty' && isAdmin && <TextsAdmin />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

/* ---------- Přehled ---------- */
const QUICK = [
  { tab: 'flipy', label: 'Přidat flip', icon: TrendingUp },
  { tab: 'kalkulacka', label: 'Kalkulačka', icon: Calculator },
  { tab: 'doporucene', label: 'Doporučené flipy', icon: Sparkles },
  { tab: 'materialy', label: 'Materiály', icon: GraduationCap },
];

function Overview({ user, planName, backToSite, setTab }) {
  const [recommended, setRecommended] = useState([]);
  const firstName = (user?.user_metadata?.full_name || '').split(' ')[0];

  // Doporučená auta z databáze
  useEffect(() => {
    if (!supabase) return;
    supabase.from('cars').select('brand,model,year,price,image_url').eq('status', 'published').order('sort').limit(3)
      .then(({ data }) => { if (data) setRecommended(data); });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Vítej zpět{firstName ? `, ${firstName}` : ''} 👋</h1>
        <p className="mt-1 text-sm text-zinc-400">{user?.email || 'clen@flipujkaru.cz'}</p>
      </div>

      {/* Rychlé akce */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK.map((q) => (
          <button key={q.tab} onClick={() => setTab(q.tab)} className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-ink-850 p-4 text-center transition hover:-translate-y-0.5 hover:border-accent/40">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent"><q.icon className="h-5 w-5" /></span>
            <span className="text-sm font-medium text-white">{q.label}</span>
          </button>
        ))}
      </div>

      {/* Karta členství — aktivní vs. zatím bez členství */}
      {planName ? (
        <div className="grad-border rounded-2xl p-5 shadow-glow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-400">Aktivní členství</div>
              <div className="mt-0.5 font-display text-2xl font-bold text-white">Plán {planName}</div>
              <div className="mt-1 inline-flex items-center gap-1.5 text-sm text-accent"><span className="h-2 w-2 rounded-full bg-accent" /> Aktivní · obnovení 15. 7. 2026</div>
            </div>
            <button onClick={() => setTab('faktury')} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">Spravovat</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-ink-850 p-5">
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-400">Členství</div>
            <div className="mt-0.5 font-display text-xl font-bold text-white">Zatím nemáš aktivní členství</div>
            <div className="mt-1 text-sm text-zinc-400">Odemkni materiály, doporučené flipy i komunitu.</div>
          </div>
          <button onClick={() => { backToSite(); setTimeout(() => document.getElementById('cenik')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-ink-950 shadow-glow transition hover:brightness-110">
            Aktivovat členství
          </button>
        </div>
      )}

      {/* Statistiky */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {DASH_STATS.map((s) => {
          const Icon = STAT_ICONS[s.icon];
          return (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-ink-850 p-5">
              <Icon className="h-5 w-5 text-accent" />
              <div className="mt-3 font-display text-2xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-zinc-400">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Onboarding checklist */}
      <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
        <h3 className="font-display font-bold text-white">Tvoje první kroky</h3>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ONBOARDING.map((o, i) => (
            <div key={o.key} className="flex items-center gap-3 rounded-xl bg-ink-950 px-3 py-2.5">
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${i === 0 ? 'bg-accent text-ink-950' : 'border border-white/15 text-zinc-500'}`}>{i === 0 ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white">{o.label}</div>
                <div className="truncate text-xs text-zinc-500">{o.hint}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Doporučená auta */}
      {recommended.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
          <div className="flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 font-display font-bold text-white"><Car className="h-4 w-4 text-accent" /> Tipy z bazaru</h3>
            <button onClick={backToSite} className="inline-flex items-center text-sm font-medium text-accent hover:gap-1">Do bazaru <ArrowRight className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {recommended.map((c, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-ink-950">
                <div className="aspect-[16/10] bg-ink-800">{c.image_url && <img src={c.image_url} alt="" className="h-full w-full object-cover" />}</div>
                <div className="p-3">
                  <div className="truncate text-sm font-semibold text-white">{c.brand} {c.model}</div>
                  <div className="mt-0.5 text-xs text-zinc-500">{c.year} · <span className="font-semibold text-accent">{czk(c.price)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doporučené flipy náhled + materiály */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
          <div className="flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 font-display font-bold text-white"><Sparkles className="h-4 w-4 text-accent" /> Doporučené flipy</h3>
            <button onClick={() => setTab('doporucene')} className="inline-flex items-center text-sm font-medium text-accent hover:gap-1">Vše <ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 space-y-2.5">
            <RecommendedFlipsPreview />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
          <div className="flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 font-display font-bold text-white"><GraduationCap className="h-4 w-4 text-accent" /> Pokrok v kurzech</h3>
            <button onClick={() => setTab('materialy')} className="inline-flex items-center text-sm font-medium text-accent hover:gap-1">Vše <ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 space-y-3">
            {COURSES.slice(0, 3).map((c) => <CourseRow key={c.title} c={c} />)}
          </div>
        </div>
      </div>

      {/* Komunita */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/25 bg-accent-soft p-5">
        <div>
          <div className="font-display font-bold text-white">Discord komunita</div>
          <div className="text-sm text-zinc-400">1 800+ členů, kteří si navzájem pomáhají. Připoj se.</div>
        </div>
        <a href="#" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:brightness-110">Otevřít Discord <ExternalLink className="h-4 w-4" /></a>
      </div>
    </div>
  );
}

/* ---------- Doporučené flipy (živá data z algdash API — PODHODNOCENÉ) ---------- */
const DEFAULT_FLIP_FILTERS = {
  manufacturer: '', model: '', min_gap_pct: '', min_sample_size: 5,
  min_price: '', max_price: '', min_km: '', max_km: '', min_year: '', max_year: '',
  include_damaged: false, reference: 'median', sort: 'gap_czk', order: 'desc',
};

const flipInputClass =
  'w-full rounded-xl border border-white/10 bg-ink-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20 disabled:opacity-40';

function FlipField({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-zinc-500">{hint}</span>}
    </label>
  );
}

const SORT_COLUMNS = [
  { key: 'year', label: 'Rok' },
  { key: 'mileage_km', label: 'Nájezd' },
  { key: 'price_czk', label: 'Cena' },
  { key: 'gap_pct', label: 'Rozdíl' },
];

/** Náhled na Přehledu — 2 nejlepší nálezy dle výchozích filtrů. */
function RecommendedFlipsPreview() {
  const { data, isLoading, isError } = useUndervalued({ page: 1, page_size: 2, sort: 'gap_czk', order: 'desc', min_sample_size: 5 });
  const items = data?.items || [];

  if (isLoading && !data) return <p className="text-sm text-zinc-500">Načítám…</p>;
  if (isError) return <p className="text-sm text-zinc-500">Nálezy se teď nepodařilo načíst.</p>;
  if (items.length === 0) return <p className="text-sm text-zinc-500">Zatím žádné nálezy.</p>;

  return items.map((item) => (
    <div key={item.external_id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-950 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><Sparkles className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-white">{item.manufacturer} {item.model}</div>
        <div className="truncate text-xs text-zinc-500">{item.year ?? '—'} · {kmFmt(item.mileage_km)}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-white">{czk(item.price_czk)}</div>
        {item.gap_pct != null && <div className="text-xs font-semibold text-accent">−{Math.round(item.gap_pct * 100)} % pod trhem</div>}
      </div>
    </div>
  ));
}

function RecommendedFlips() {
  // `filters` je rozpracovaný draft ve formuláři, `applied` je to, na co se
  // skutečně dotazujeme API. Sladí se jen po „Hledat" (nebo resetu) — API
  // přepočítává celou množinu server-side, takže dotaz na každý stisk klávesy
  // by tabulku zpomalil (stejný důvod jako v algdash).
  const [filters, setFilters] = useState(DEFAULT_FLIP_FILTERS);
  const [applied, setApplied] = useState(DEFAULT_FLIP_FILTERS);
  const [page, setPage] = useState(1);
  const [openingId, setOpeningId] = useState(null);

  const updateFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val, ...(key === 'manufacturer' ? { model: '' } : {}) }));
  const resetFilters = () => { setFilters(DEFAULT_FLIP_FILTERS); setApplied(DEFAULT_FLIP_FILTERS); setPage(1); };
  const applyFilters = () => { setApplied(filters); setPage(1); };
  const dirty = useMemo(() => JSON.stringify(filters) !== JSON.stringify(applied), [filters, applied]);

  const manufacturersQuery = useMobiledeManufacturers();
  const modelsQuery = useMobiledeModels(filters.manufacturer || undefined);

  const listParams = useMemo(() => {
    const { min_gap_pct, ...rest } = applied;
    return { ...rest, min_gap_pct: min_gap_pct === '' ? undefined : Number(min_gap_pct) / 100, page, page_size: 20 };
  }, [applied, page]);

  const { data, isLoading, isError } = useUndervalued(listParams);
  const items = data?.items || [];
  const total = data?.total ?? 0;
  const pageSize = data?.page_size ?? listParams.page_size;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // Hook drží předchozí data při refetchi -> isLoading + existující data = refetch na pozadí, ne první načtení.
  const refetching = isLoading && Boolean(data);

  const handleSort = (key) => {
    const order = filters.sort === key ? (filters.order === 'asc' ? 'desc' : 'asc') : 'desc';
    const next = { ...filters, sort: key, order };
    setFilters(next);
    setApplied(next);
    setPage(1);
  };

  const openListing = async (externalId) => {
    setOpeningId(externalId);
    try {
      const detail = await dealsApi.undervaluedDetail(externalId);
      if (detail?.source_url) window.open(detail.source_url, '_blank', 'noopener,noreferrer');
    } catch {
      // tiché selhání — inzerát se prostě neotevře
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white"><Sparkles className="h-5 w-5 text-accent" /> Doporučené flipy</h1>
        <p className="mt-1 text-sm text-zinc-400">Živá auta pod tržní cenou z algoritmu algdash (PODHODNOCENÉ). Uprav filtry a klikni na Hledat.</p>
      </div>

      {/* Filtry */}
      <form
        onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
        className="rounded-2xl border border-white/10 bg-ink-850 p-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="inline-flex items-center gap-2 font-display font-bold text-white"><SlidersHorizontal className="h-4 w-4 text-accent" /> Filtry</h3>
          <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition hover:text-white">
            <RotateCcw className="h-3.5 w-3.5" /> Vymazat
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FlipField label="Značka (mobile.de)">
            <select value={filters.manufacturer} onChange={(e) => updateFilter('manufacturer', e.target.value)} className={flipInputClass}>
              <option value="">Jakákoliv</option>
              {(manufacturersQuery.data || []).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </FlipField>
          <FlipField label="Model (mobile.de)">
            <select value={filters.model} onChange={(e) => updateFilter('model', e.target.value)} className={flipInputClass}>
              <option value="">Jakýkoliv</option>
              {(modelsQuery.data || []).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </FlipField>
          <FlipField label="Min. rozdíl (%)">
            <input type="number" inputMode="numeric" min="0" max="100" value={filters.min_gap_pct} onChange={(e) => updateFilter('min_gap_pct', e.target.value)} className={flipInputClass} placeholder="0" />
          </FlipField>
          <FlipField label="Min. počet vzorků" hint="kolik českých inzerátů tvoří srovnávací vzorek">
            <input type="number" inputMode="numeric" min="1" value={filters.min_sample_size} onChange={(e) => updateFilter('min_sample_size', e.target.value)} className={flipInputClass} placeholder="5" />
          </FlipField>

          <FlipField label="Cena od (Kč)">
            <input type="number" inputMode="numeric" min="0" value={filters.min_price} onChange={(e) => updateFilter('min_price', e.target.value)} className={flipInputClass} placeholder="0" />
          </FlipField>
          <FlipField label="Cena do (Kč)">
            <input type="number" inputMode="numeric" min="0" value={filters.max_price} onChange={(e) => updateFilter('max_price', e.target.value)} className={flipInputClass} placeholder="bez omezení" />
          </FlipField>
          <FlipField label="Nájezd od (km)">
            <input type="number" inputMode="numeric" min="0" value={filters.min_km} onChange={(e) => updateFilter('min_km', e.target.value)} className={flipInputClass} placeholder="0" />
          </FlipField>
          <FlipField label="Nájezd do (km)">
            <input type="number" inputMode="numeric" min="0" value={filters.max_km} onChange={(e) => updateFilter('max_km', e.target.value)} className={flipInputClass} placeholder="bez omezení" />
          </FlipField>

          <FlipField label="Rok od">
            <input type="number" inputMode="numeric" min="0" value={filters.min_year} onChange={(e) => updateFilter('min_year', e.target.value)} className={flipInputClass} placeholder="např. 2015" />
          </FlipField>
          <FlipField label="Rok do">
            <input type="number" inputMode="numeric" min="0" value={filters.max_year} onChange={(e) => updateFilter('max_year', e.target.value)} className={flipInputClass} placeholder="bez omezení" />
          </FlipField>
          <FlipField label="Řazení">
            <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} className={flipInputClass}>
              <option value="gap_czk">Rozdíl v Kč</option>
              <option value="gap_pct">Rozdíl v %</option>
              <option value="price_czk">Cena</option>
            </select>
          </FlipField>
          <FlipField label="Pořadí">
            <select value={filters.order} onChange={(e) => updateFilter('order', e.target.value)} className={flipInputClass}>
              <option value="desc">Sestupně</option>
              <option value="asc">Vzestupně</option>
            </select>
          </FlipField>

          <FlipField label="Referenční cena">
            <select value={filters.reference} onChange={(e) => updateFilter('reference', e.target.value)} className={flipInputClass}>
              <option value="median">Medián sauto.cz</option>
              <option value="p25">Spodní kvartil (p25) sauto.cz</option>
            </select>
          </FlipField>
          <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-zinc-300">
            <input type="checkbox" checked={filters.include_damaged} onChange={(e) => updateFilter('include_damaged', e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-ink-950 text-accent focus:ring-accent/40" />
            zobrazit i havarované
          </label>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          {dirty && <span className="text-xs text-amber-400/90">Neuložené změny filtrů</span>}
          <button
            type="submit"
            disabled={!dirty}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Search className="h-4 w-4" /> Hledat
          </button>
        </div>
      </form>

      {/* Tabulka výsledků */}
      <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
        <div className="flex items-center justify-between">
          <h3 className="inline-flex items-center gap-2 font-display font-bold text-white">
            <Table2 className="h-4 w-4 text-accent" /> Nálezy
            {refetching && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/15 border-t-accent" />}
          </h3>
          <span className="text-xs text-zinc-500">{total.toLocaleString('cs-CZ')} celkem</span>
        </div>

        {isLoading && !data && (
          <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" /> Načítám…</div>
        )}
        {isError && (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">Nálezy se nepodařilo načíst. Zkus to prosím znovu.</p>
        )}
        {!isError && data && items.length === 0 && (
          <p className="mt-4 rounded-xl border border-white/10 bg-ink-950 p-6 text-center text-sm text-zinc-400">Žádná auta neodpovídají zvoleným filtrům.</p>
        )}

        {!isError && items.length > 0 && (
          <div className={`relative transition-opacity ${refetching ? 'pointer-events-none opacity-50' : ''}`}>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-zinc-500">
                    <th className="whitespace-nowrap px-3 py-2 font-medium">Vůz</th>
                    {SORT_COLUMNS.map((col) => (
                      <th key={col.key} className="whitespace-nowrap px-3 py-2 font-medium">
                        <button type="button" onClick={() => handleSort(col.key)} className="inline-flex items-center gap-1 transition hover:text-white">
                          {col.label}
                          {filters.sort === col.key ? (filters.order === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                        </button>
                      </th>
                    ))}
                    <th className="whitespace-nowrap px-3 py-2 font-medium">Palivo</th>
                    <th className="whitespace-nowrap px-3 py-2 font-medium">Výkon</th>
                    <th className="whitespace-nowrap px-3 py-2 font-medium">Vzorek</th>
                    <th className="whitespace-nowrap px-3 py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.external_id} className="border-b border-white/5 transition hover:bg-white/5">
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <div className="font-medium text-white">{item.manufacturer} {item.model}</div>
                        {item.damaged === true && <div className="text-xs text-red-400">havarovaný</div>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-zinc-300">{item.year ?? '—'}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-zinc-300"><span className="inline-flex items-center gap-1"><Gauge className="h-3 w-3" /> {kmFmt(item.mileage_km)}</span></td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-white">{czk(item.price_czk)}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-accent">
                        {item.gap_czk != null ? czk(item.gap_czk) : '—'}{item.gap_pct != null ? ` · −${Math.round(item.gap_pct * 100)} %` : ''}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-zinc-300">{item.fuel_type || '—'}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-zinc-400">{item.power_kw != null ? `${item.power_kw} kW` : '—'}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-zinc-400" title="Počet srovnatelných inzerátů na sauto.cz použitých pro výpočet referenční ceny">n = {item.sample_size ?? '—'}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => openListing(item.external_id)}
                          disabled={openingId === item.external_id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-ink-950 transition hover:brightness-110 disabled:opacity-50"
                        >
                          {openingId === item.external_id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />} Inzerát
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Stránka {page} z {totalPages}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || refetching}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Předchozí
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || refetching}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:text-white disabled:opacity-30"
                >
                  Další <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Materiály ---------- */
function Materials() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white"><GraduationCap className="h-5 w-5 text-accent" /> Mé materiály</h1>
        <p className="mt-1 text-sm text-zinc-400">Vzdělávací kurzy a tvůj pokrok.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {COURSES.map((c) => (
          <div key={c.title} className="rounded-2xl border border-white/10 bg-ink-850 p-5">
            <CourseRow c={c} />
            <button className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
              {c.done === 0 ? 'Začít kurz' : c.done === c.lessons ? 'Zopakovat' : 'Pokračovat'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseRow({ c }) {
  const pct = Math.round((c.done / c.lessons) * 100);
  const done = c.done === c.lessons;
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
          {done && <Check className="h-4 w-4 text-accent" />} {c.title}
        </span>
        <span className="shrink-0 text-xs text-zinc-500">{c.done}/{c.lessons}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-700">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ---------- Faktury ---------- */
function Invoices({ planName }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white"><Receipt className="h-5 w-5 text-accent" /> Faktury & platby</h1>
        <p className="mt-1 text-sm text-zinc-400">Historie plateb a způsob úhrady.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-ink-850 p-5">
        <div className="inline-flex items-center gap-3">
          <span className="grid h-10 w-14 place-items-center rounded-lg border border-white/10 bg-ink-950 text-xs font-bold text-white">VISA</span>
          <div>
            <div className="text-sm font-medium text-white">•••• •••• •••• 4242</div>
            <div className="text-xs text-zinc-500">Platí do 04/29 · plán {planName}</div>
          </div>
        </div>
        <button className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">Změnit kartu</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        {INVOICES.map((inv, i) => (
          <div key={inv.id} className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-white/5' : ''} bg-ink-850`}>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{inv.item}</div>
              <div className="text-xs text-zinc-500">{inv.id} · {inv.date}</div>
            </div>
            <span className="hidden rounded-md bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent sm:inline">{inv.status}</span>
            <span className="text-sm font-semibold text-white">{czk(inv.amount)}</span>
            <button aria-label="Stáhnout PDF" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-400 transition hover:text-white"><Download className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Nastavení ---------- */
function SettingsPanel({ user, planName, signOut }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white"><Settings className="h-5 w-5 text-accent" /> Nastavení</h1>
        <p className="mt-1 text-sm text-zinc-400">Profil, výchozí filtry doporučených flipů a členství.</p>
      </div>

      {/* Profil */}
      <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
        <h3 className="font-display font-bold text-white">Profil</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LabeledInput label="Jméno" defaultValue={user?.user_metadata?.full_name || ''} />
          <LabeledInput label="E-mail" defaultValue={user?.email || ''} />
        </div>
        <button className="mt-4 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:brightness-110">Uložit změny</button>
      </div>

      {/* Výchozí filtry doporučených flipů */}
      <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
        <h3 className="font-display font-bold text-white">Výchozí filtry doporučených flipů</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LabeledInput label="Značky" defaultValue="BMW, Audi, VW" />
          <LabeledInput label="Max. cena" defaultValue="800 000 Kč" />
          <LabeledInput label="Min. % pod trhem" defaultValue="10 %" />
          <LabeledInput label="Lokality" defaultValue="DE, AT, CZ" />
        </div>
        <button className="mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Uložit výchozí filtry</button>
      </div>

      {/* Členství */}
      <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
        <h3 className="font-display font-bold text-white">Členství</h3>
        <p className="mt-1 text-sm text-zinc-400">Aktuální plán: <span className="font-semibold text-accent">{planName || 'žádný'}</span>{planName ? ' · obnovení 15. 7. 2026' : ''}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:brightness-110">Změnit plán</button>
          <button onClick={signOut} className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20">Odhlásit se</button>
        </div>
      </div>
    </div>
  );
}

function LabeledInput({ label, defaultValue }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>
      <input defaultValue={defaultValue} className="w-full rounded-xl border border-white/10 bg-ink-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20" />
    </label>
  );
}
