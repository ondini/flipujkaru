import { useEffect, useState } from 'react';
import { Newspaper, Scale, Check, X, PenLine, ExternalLink, RefreshCw, Search, Loader2, ShieldCheck, AlertTriangle, ChevronDown } from 'lucide-react';
import { novinkyApi } from '../../lib/novinkyApi.js';
import { Loading, ErrorBox, useHlidac, safeUrl } from '../hlidac/HlidacAdmin.jsx';

const SEKCE = [
  { key: 'novinky', label: 'Novinky', icon: Newspaper, kam: 'téma Novinky ve skupině Akademie' },
  { key: 'zakony', label: 'Zákony a úřady', icon: Scale, kam: 'kanál Zákony' },
];
const FILTRY = [['ceka', 'Ke schválení'], ['schvaleno', 'Zveřejněné'], ['ostatni', 'Zamítnuté a neprošlé'], ['vse', 'Vše']];
const STAV = {
  navrh: ['Ke schválení', 'border-accent/40 bg-accent-soft text-accent'],
  prepis: ['Ke schválení', 'border-accent/40 bg-accent-soft text-accent'],
  schvaleno: ['Zveřejněno', 'border-sky-400/40 bg-sky-400/10 text-sky-200'],
  zamitnuto: ['Zamítnuto', 'border-white/10 text-zinc-400'],
  neproslo: ['Neprošlo kontrolou', 'border-red-500/30 bg-red-500/10 text-red-300'],
  propadlo: ['Propadlo', 'border-white/10 text-zinc-500'],
};
const datum = (d) => (d ? new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }) : '');

/** Admin → Novinky: schvalování zpráv z bota (Novinky do skupiny, Zákony do kanálu). Data jsou na Macu s botem. */
export default function NovinkyAdmin() {
  const [sekce, setSekce] = useState('novinky');
  const [prehled, chybaPrehledu, , obnovPrehled] = useHlidac(() => novinkyApi.prehled());
  const [hlaska, setHlaska] = useState('');

  const hledej = async () => {
    try { setHlaska((await novinkyApi.kolo()).zprava); } catch (e) { setHlaska(e.message); }
    obnovPrehled();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white"><Newspaper className="h-5 w-5 text-accent" /> Novinky a zákony</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">Bot 2× denně najde zprávy, napíše je a ověří proti zdrojům. Nic nevyjde bez schválení tady nebo v Telegramu.</p>
        </div>
        <button onClick={hledej} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-zinc-200 hover:text-white">
          <Search className="h-4 w-4" /> Hledat teď
        </button>
      </div>
      <ErrorBox error={chybaPrehledu} onRetry={obnovPrehled} />
      {hlaska && <p className="rounded-xl border border-white/10 bg-ink-850 p-3 text-sm text-zinc-300">{hlaska}</p>}
      {prehled?.rezim === 'test' && (
        <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
          Testovací režim: schválená zpráva jde jen schvalovateli do Telegramu, ne do skupiny ani kanálu.
        </p>
      )}
      <div role="tablist" className="flex gap-2 overflow-x-auto">
        {SEKCE.map((s) => {
          const ceka = prehled?.sekce?.[s.key]?.ceka || 0;
          return (
            <button key={s.key} role="tab" aria-selected={sekce === s.key} onClick={() => setSekce(s.key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${sekce === s.key ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
              <s.icon className="h-4 w-4" /> {s.label}
              {ceka > 0 && <span className="rounded-md bg-accent px-1.5 text-xs font-bold text-ink-950">{ceka}</span>}
            </button>
          );
        })}
      </div>
      <Seznam key={sekce} sekce={SEKCE.find((s) => s.key === sekce)} onZmena={obnovPrehled} />
    </div>
  );
}

function Seznam({ sekce, onZmena }) {
  const [data, error, loading, reload] = useHlidac(() => novinkyApi.pribehy(sekce.key), [sekce.key]);
  const [filtr, setFiltr] = useState('ceka');
  const prepisuje = data?.pribehy?.some((p) => p.prepisuje);

  useEffect(() => { // během přepisu se seznam sám obnovuje, nová verze přijde za pár minut
    if (!prepisuje) return undefined;
    const t = setInterval(reload, 20000);
    return () => clearInterval(t);
  }, [prepisuje, reload]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const vse = data.pribehy;
  const shown = vse.filter((p) => filtr === 'vse'
    || (filtr === 'ceka' && ['navrh', 'prepis'].includes(p.stav))
    || (filtr === 'schvaleno' && p.stav === 'schvaleno')
    || (filtr === 'ostatni' && ['zamitnuto', 'neproslo', 'propadlo'].includes(p.stav)));
  const hotovo = () => { reload(); onZmena(); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTRY.map(([v, l]) => (
          <button key={v} onClick={() => setFiltr(v)} aria-pressed={filtr === v}
            className={`rounded-xl border px-3 py-1.5 text-sm ${filtr === v ? 'border-accent/50 bg-accent-soft text-accent' : 'border-white/10 text-zinc-400 hover:text-white'}`}>{l}</button>
        ))}
        <button onClick={reload} className="ml-auto inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"><RefreshCw className="h-3.5 w-3.5" /> Obnovit</button>
      </div>
      {shown.length === 0 && (
        <p className="rounded-2xl border border-white/10 bg-ink-850 p-4 text-sm text-zinc-400">
          {filtr === 'ceka' ? 'Teď nic nečeká na schválení. Nové návrhy přicházejí v 10:00 a 16:00.' : 'Nic tu není.'}
        </p>
      )}
      {shown.map((p) => <Karta key={p.id} p={p} kam={sekce.kam} onHotovo={hotovo} />)}
    </div>
  );
}

function Karta({ p, kam, onHotovo }) {
  const [clanek, setClanek] = useState(false);
  const [rezim, setRezim] = useState(null); // null | 'prepis' | 'zamitnout'
  const [pokyn, setPokyn] = useState('');
  const [bezi, setBezi] = useState(false);
  const [vysledek, setVysledek] = useState(null);
  const [label, barva] = STAV[p.stav] || [p.stav, 'border-white/10 text-zinc-400'];
  const aktivni = ['navrh', 'prepis'].includes(p.stav) && !p.prepisuje;
  const o = p.overeni || {};

  const proved = async (fn) => {
    setBezi(true); setVysledek(null);
    try { setVysledek({ ok: true, text: (await fn()).zprava }); setRezim(null); onHotovo(); }
    catch (e) { setVysledek({ ok: false, text: e.message }); }
    finally { setBezi(false); }
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-ink-850 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-lg border px-2 py-0.5 font-semibold ${barva}`}>{p.prepisuje ? 'Přepisuje se' : label}</span>
        <span className="text-zinc-400">užitek <b className="text-zinc-200">{p.skore}/10</b></span>
        {p.datum_udalosti && <span className="text-zinc-500">událost {datum(p.datum_udalosti)}</span>}
        <span className="text-zinc-500">návrh {datum(p.vytvoreno)}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Náhled postu přesně tak, jak půjde do Telegramu */}
        <div className="overflow-hidden rounded-xl border border-white/5 bg-ink-950/70">
          {p.obrazek && <img src={safeUrl(p.obrazek)} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" onError={(e) => { e.currentTarget.hidden = true; }} />}
          <p className="p-3 text-sm leading-relaxed text-zinc-100"><b>{p.predpona}</b> {p.post}</p>
        </div>
        <div className="min-w-0 space-y-2 text-sm">
          <h3 className="font-semibold text-white">{p.titulek || p.tema}</h3>
          {p.duvod && <p className="text-zinc-400"><span className="text-zinc-500">Proč: </span>{p.duvod}</p>}
          <p className={`inline-flex flex-wrap items-center gap-1.5 text-xs ${o.ai_ok && !o.problemy?.length ? 'text-accent' : 'text-zinc-400'}`}>
            <ShieldCheck className="h-3.5 w-3.5" /> citace {o.citace - o.spatne_citace}/{o.citace} · čísla {o.cisla - o.chybi_cisla}/{o.cisla} · kontrola AI {o.ai_ok ? 'bez výhrad' : 's výhradou'}
          </p>
          {o.problemy?.length > 0 && (
            <ul className="space-y-1 rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-xs text-red-200">
              {o.problemy.map((x) => <li key={x} className="flex gap-1.5"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />{x}</li>)}
            </ul>
          )}
          {o.drobnosti?.length > 0 && (
            <details className="text-xs text-zinc-400">
              <summary className="cursor-pointer select-none text-zinc-500 hover:text-zinc-300">Drobnosti z kontroly ({o.drobnosti.length}), článek nezastavily</summary>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">{o.drobnosti.map((x) => <li key={x}>{x}</li>)}</ul>
            </details>
          )}
          <ul className="space-y-0.5 text-xs">
            {p.zdroje.map((z) => (
              <li key={z.url}><a href={safeUrl(z.url)} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 text-zinc-400 hover:text-accent">
                <span className="truncate">{z.zdroj}: {z.titulek}</span><ExternalLink className="h-3 w-3 shrink-0" /></a></li>
            ))}
          </ul>
        </div>
      </div>

      {p.odstavce?.length > 0 && (
        <div className="mt-3">
          <button onClick={() => setClanek(!clanek)} aria-expanded={clanek} className="inline-flex items-center gap-1 text-sm text-zinc-300 hover:text-white">
            <ChevronDown className={`h-4 w-4 transition ${clanek ? 'rotate-180' : ''}`} /> Celý článek na web
          </button>
          {clanek && (
            <div className="mt-2 space-y-2 rounded-xl border border-white/5 bg-ink-950/50 p-3 text-sm leading-relaxed text-zinc-300">
              <p className="font-medium text-zinc-100">{p.perex}</p>
              {p.odstavce.map((x) => <p key={x}>{x}</p>)}
              {p.pro_flip && <p className="rounded-lg bg-accent-soft p-2 text-zinc-100"><b>Co to znamená pro flip:</b> {p.pro_flip}</p>}
            </div>
          )}
        </div>
      )}

      {p.url && (
        <a href={safeUrl(p.url)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
          Otevřít zveřejněný článek <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}

      {aktivni && (
        <div className="mt-4 space-y-3 border-t border-white/5 pt-3">
          <div className="flex flex-wrap gap-2">
            <button disabled={bezi} onClick={() => proved(() => novinkyApi.schvalit(p.id))}
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-sm font-bold text-ink-950 transition hover:bg-accent-dim disabled:opacity-50">
              {bezi && !rezim ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Schválit a zveřejnit
            </button>
            <button disabled={bezi} onClick={() => setRezim(rezim === 'prepis' ? null : 'prepis')} aria-pressed={rezim === 'prepis'}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2 text-sm text-zinc-200 hover:text-white disabled:opacity-50">
              <PenLine className="h-4 w-4" /> Přepsat
            </button>
            <button disabled={bezi} onClick={() => setRezim(rezim === 'zamitnout' ? null : 'zamitnout')} aria-pressed={rezim === 'zamitnout'}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2 text-sm text-zinc-400 hover:text-red-300 disabled:opacity-50">
              <X className="h-4 w-4" /> Zamítnout
            </button>
          </div>
          <p className="text-xs text-zinc-500">Schválením půjde post s fotkou a tlačítkem „Celý článek“ do: {kam}.</p>
          {rezim === 'prepis' && (
            <form onSubmit={(e) => { e.preventDefault(); if (pokyn.trim()) proved(() => novinkyApi.prepsat(p.id, pokyn.trim())); }} className="space-y-2">
              <label htmlFor={`pokyn-${p.id}`} className="block text-sm text-zinc-300">Co změnit? Fakta zůstanou jen ze zdrojů.</label>
              <textarea id={`pokyn-${p.id}`} value={pokyn} onChange={(e) => setPokyn(e.target.value)} rows={2} maxLength={1000}
                placeholder="např. kratší post, víc o cenách, jiný titulek"
                className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600" />
              <button disabled={bezi || !pokyn.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-sm font-medium text-white disabled:opacity-50">
                {bezi && <Loader2 className="h-4 w-4 animate-spin" />} Přepsat a znovu ověřit
              </button>
            </form>
          )}
          {rezim === 'zamitnout' && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
              Opravdu zamítnout? Bot se podle toho učí, co nechceš.
              <button disabled={bezi} onClick={() => proved(() => novinkyApi.zamitnout(p.id))} className="rounded-xl border border-red-500/40 px-3 py-1.5 text-red-300 hover:bg-red-500/10">Ano, zamítnout</button>
            </div>
          )}
        </div>
      )}
      {p.prepisuje && (
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-amber-200"><Loader2 className="h-4 w-4 animate-spin" /> Přepisuju a znovu ověřuju, nová verze se tu objeví sama.</p>
      )}
      {vysledek && <p role="status" className={`mt-3 text-sm ${vysledek.ok ? 'text-accent' : 'text-red-300'}`}>{vysledek.text}</p>}
    </article>
  );
}
