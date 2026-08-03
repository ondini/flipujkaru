import { lazy, Suspense, useEffect, useState } from 'react';
import {
  LayoutDashboard, Radar, GraduationCap, Receipt, Settings, PiggyBank, Car, Trophy,
  Bell, LogOut, ArrowLeft, ExternalLink, Download, Check, TrendingUp, ChevronRight, Type,
  Calculator, Users, ArrowRight,
} from 'lucide-react';
import { useApp } from '../AppContext.jsx';
import { czk } from '../data/content.js';
import { supabase } from '../lib/supabase.js';
import { DASH_NAV, DASH_STATS, COURSES, WATCH_ALERTS, INVOICES, ONBOARDING } from '../data/member.js';
import { LogoMark } from './Logo.jsx';

// Panely → lazy, načtou se až po kliknutí na danou záložku
const AdminCars = lazy(() => import('./AdminCars.jsx'));
const TextsAdmin = lazy(() => import('./TextsAdmin.jsx'));
const MyFlips = lazy(() => import('./dashboard/MyFlips.jsx'));
const CalcPanel = lazy(() => import('./dashboard/CalcPanel.jsx'));
const Community = lazy(() => import('./dashboard/Community.jsx'));

const NAV_ICONS = { LayoutDashboard, Radar, GraduationCap, Receipt, Settings, Car, Type, Calculator, Users, TrendingUp };
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
            {tab === 'hlidac' && <Watchdog />}
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
  { tab: 'hlidac', label: 'Hlídací pes', icon: Radar },
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
            <div className="mt-1 text-sm text-zinc-400">Odemkni materiály, hlídacího psa i komunitu.</div>
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

      {/* Hlídací pes náhled + materiály */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
          <div className="flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 font-display font-bold text-white"><Radar className="h-4 w-4 text-accent" /> Hlídací pes</h3>
            <button onClick={() => setTab('hlidac')} className="inline-flex items-center text-sm font-medium text-accent hover:gap-1">Vše <ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 space-y-2.5">
            {WATCH_ALERTS.slice(0, 2).map((a) => <AlertRow key={a.car} a={a} compact />)}
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

/* ---------- Hlídací pes ---------- */
function Watchdog() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white"><Radar className="h-5 w-5 text-accent" /> Hlídací pes</h1>
        <p className="mt-1 text-sm text-zinc-400">Auta pod tržní cenou dle tvých parametrů. Algoritmus skenuje celou Evropu 24/7.</p>
      </div>
      <div className="space-y-3">
        {WATCH_ALERTS.map((a) => <AlertRow key={a.car} a={a} />)}
      </div>
    </div>
  );
}

function AlertRow({ a, compact }) {
  const diff = Math.round((1 - a.price / a.market) * 100);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-950 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><Bell className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-white">{a.car}</div>
        <div className="truncate text-xs text-zinc-500">{compact ? a.loc : `${a.spec} · ${a.loc} · ${a.time}`}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-white">{czk(a.price)}</div>
        <div className="text-xs font-semibold text-accent">−{diff} % pod trhem</div>
      </div>
      {!compact && <button className="ml-2 hidden shrink-0 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-ink-950 transition hover:brightness-110 sm:inline-flex">Inzerát</button>}
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
        <p className="mt-1 text-sm text-zinc-400">Profil, parametry hlídače a členství.</p>
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

      {/* Parametry hlídače */}
      <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
        <h3 className="font-display font-bold text-white">Parametry hlídacího psa</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LabeledInput label="Značky" defaultValue="BMW, Audi, VW" />
          <LabeledInput label="Max. cena" defaultValue="800 000 Kč" />
          <LabeledInput label="Min. % pod trhem" defaultValue="10 %" />
          <LabeledInput label="Lokality" defaultValue="DE, AT, CZ" />
        </div>
        <button className="mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Aktualizovat hlídač</button>
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
