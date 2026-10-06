import { useEffect, useState } from 'react';
import { TrendingUp, Plus, Trash2, Loader2, X, PiggyBank, Car, Trophy, ExternalLink, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { czk, kmFmt } from '../../data/content.js';
import { useUndervalued, useMobiledeManufacturers, useMobiledeModels } from '../../hooks/useDeals.js';

const EMPTY_FORM = { buy: '', repair: '', sell: '', status: 'in_progress' };
const DEALS_PAGE_SIZE = 10;

/** Osobní sledování flipů zákazníka (ukládá se do tabulky user_flips). */
export default function MyFlips() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [deal, setDeal] = useState(null); // vybraný návrh z algoritmu

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('user_flips').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else { setList(data || []); setError(''); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Výběr návrhu předvyplní nákup (cena inzerátu) a prodej (tržní referenční cena)
  const onSelectDeal = (item) => {
    setDeal(item);
    setForm((f) => ({
      ...f,
      buy: item.price_czk != null ? String(Math.round(item.price_czk)) : f.buy,
      sell: item.sauto_ref_price != null ? String(Math.round(item.sauto_ref_price)) : f.sell,
    }));
  };

  const add = async (e) => {
    e.preventDefault();
    if (!deal) { setError('Vyber auto z návrhů algoritmu.'); return; }
    const payload = {
      brand: deal.manufacturer, model: deal.model, year: deal.year ?? null,
      deal_external_id: deal.external_id, deal_source_url: deal.source_url || null,
      buy: Number(form.buy) || 0, repair: Number(form.repair) || 0, sell: Number(form.sell) || 0,
      status: form.status,
    };
    const { error } = await supabase.from('user_flips').insert(payload);
    if (error) setError(error.message);
    else { setForm(EMPTY_FORM); setDeal(null); setAdding(false); load(); }
  };

  const remove = async (id) => {
    const { error } = await supabase.from('user_flips').delete().eq('id', id);
    if (!error) load();
  };

  const totalProfit = list.reduce((s, f) => s + ((f.sell || 0) - (f.buy || 0) - (f.repair || 0)), 0);
  const sold = list.filter((f) => f.status === 'sold').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white"><TrendingUp className="h-5 w-5 text-accent" /> Moje flipy</h1>
          <p className="mt-1 text-sm text-zinc-400">Vyber auto z návrhů algoritmu a zaznamenej svůj reálný zisk.</p>
        </div>
        <button onClick={() => setAdding((a) => !a)} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 shadow-glow transition hover:brightness-110">
          {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {adding ? 'Zavřít' : 'Přidat flip'}
        </button>
      </div>

      {/* Souhrn */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat icon={PiggyBank} label="Celkový zisk" value={(totalProfit >= 0 ? '+' : '') + czk(totalProfit)} accent />
        <Stat icon={Car} label="Počet flipů" value={list.length} />
        <Stat icon={Trophy} label="Prodáno" value={sold} />
      </div>

      {error && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">{error}</p>
      )}

      {/* Formulář */}
      {adding && (
        <form onSubmit={add} className="space-y-4 rounded-2xl border border-white/10 bg-ink-850 p-5">
          {!deal ? (
            <DealPicker onSelect={onSelectDeal} />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/30 bg-ink-950 p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{deal.manufacturer} {deal.model}</div>
                  <div className="text-xs text-zinc-500">
                    {deal.year ?? '—'} · {deal.mileage_km != null ? kmFmt(deal.mileage_km) : '—'} · inzerát {czk(deal.price_czk)}
                    {deal.sauto_ref_price != null && <> · trh {czk(deal.sauto_ref_price)}</>}
                  </div>
                </div>
                {deal.source_url && (
                  <a href={deal.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-zinc-400 transition hover:text-white">
                    Inzerát <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button type="button" onClick={() => setDeal(null)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:text-white">Změnit auto</button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Nákupní cena (Kč)" type="number" value={form.buy} onChange={(v) => setForm((f) => ({ ...f, buy: v }))} />
                <Field label="Další náklady (Kč)" type="number" value={form.repair} onChange={(v) => setForm((f) => ({ ...f, repair: v }))} />
                <Field label="Prodejní cena (Kč)" type="number" value={form.sell} onChange={(v) => setForm((f) => ({ ...f, sell: v }))} />
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-zinc-400">Stav</span>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-ink-950 px-4 py-2.5 text-sm text-white outline-none focus:border-accent/60 sm:w-64">
                  <option value="in_progress" className="bg-ink-900">Rozpracováno</option>
                  <option value="sold" className="bg-ink-900">Prodáno</option>
                </select>
              </label>

              <button type="submit" className="rounded-xl bg-accent px-6 py-3 font-semibold text-ink-950 shadow-glow transition hover:brightness-110">Uložit flip</button>
            </>
          )}
        </form>
      )}

      {/* Seznam */}
      {loading ? (
        <div className="flex items-center gap-2 text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" /> Načítám…</div>
      ) : list.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-ink-850 p-6 text-center text-zinc-400">Zatím žádný flip. Přidej svůj první a sleduj zisk! 🚗</p>
      ) : (
        <div className="space-y-3">
          {list.map((f) => {
            const profit = (f.sell || 0) - (f.buy || 0) - (f.repair || 0);
            return (
              <div key={f.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-ink-850 p-4">
                <div className="min-w-0 flex-1">
                  <div className="font-display font-bold text-white">
                    {f.brand} <span className="font-normal text-zinc-400">{f.model}{f.year ? ` (${f.year})` : ''}</span>
                    {f.deal_source_url && (
                      <a href={f.deal_source_url} target="_blank" rel="noopener noreferrer" aria-label="Inzerát" className="ml-2 inline-flex align-middle text-zinc-500 transition hover:text-white"><ExternalLink className="h-3.5 w-3.5" /></a>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500">Nákup {czk(f.buy)} · další náklady {czk(f.repair)} · prodej {czk(f.sell)}</div>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${f.status === 'sold' ? 'bg-accent-soft text-accent' : 'bg-white/10 text-zinc-300'}`}>{f.status === 'sold' ? 'Prodáno' : 'Rozpracováno'}</span>
                <div className="text-right">
                  <div className="text-xs text-zinc-500">Zisk</div>
                  <div className={`font-display text-lg font-bold ${profit >= 0 ? 'text-accent' : 'text-red-400'}`}>{profit >= 0 ? '+' : ''}{czk(profit)}</div>
                </div>
                <button onClick={() => remove(f.id)} aria-label="Smazat" className="grid h-9 w-9 place-items-center rounded-lg border border-red-500/20 text-red-400 transition hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Výběr auta ze všech návrhů algoritmu (algdash /undervalued) — filtr značka/model + stránkování. */
function DealPicker({ onSelect }) {
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [page, setPage] = useState(1);

  const manufacturersQuery = useMobiledeManufacturers();
  const modelsQuery = useMobiledeModels(manufacturer || undefined);
  const { data, isLoading, isError } = useUndervalued({
    manufacturer, model, sort: 'gap_czk', order: 'desc', page, page_size: DEALS_PAGE_SIZE,
  });
  const items = data?.items || [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / DEALS_PAGE_SIZE));

  const selectClass = 'w-full rounded-xl border border-white/10 bg-ink-950 px-4 py-2.5 text-sm text-white outline-none focus:border-accent/60';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-zinc-400">Značka</span>
          <select value={manufacturer} onChange={(e) => { setManufacturer(e.target.value); setModel(''); setPage(1); }} className={selectClass}>
            <option value="" className="bg-ink-900">Jakákoliv</option>
            {(manufacturersQuery.data || []).map((m) => <option key={m} value={m} className="bg-ink-900">{m}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-zinc-400">Model</span>
          <select value={model} onChange={(e) => { setModel(e.target.value); setPage(1); }} disabled={!manufacturer} className={`${selectClass} disabled:opacity-40`}>
            <option value="" className="bg-ink-900">Jakýkoliv</option>
            {(modelsQuery.data || []).map((m) => <option key={m} value={m} className="bg-ink-900">{m}</option>)}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Návrhy algoritmu {isLoading && data && <Loader2 className="ml-1 inline h-3 w-3 animate-spin" />}</span>
        <span>{total.toLocaleString('cs-CZ')} celkem</span>
      </div>

      {isLoading && !data ? (
        <div className="flex items-center gap-2 text-sm text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" /> Načítám návrhy…</div>
      ) : isError ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">Návrhy se nepodařilo načíst. Zkus to prosím znovu.</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-ink-950 p-4 text-center text-sm text-zinc-400">Žádné návrhy pro zvolený filtr.</p>
      ) : (
        <div className={`space-y-2 transition-opacity ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
          {items.map((item) => (
            <button key={item.external_id} type="button" onClick={() => onSelect(item)}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-ink-950 p-3 text-left transition hover:border-accent/50">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{item.manufacturer} {item.model}</div>
                <div className="truncate text-xs text-zinc-500">
                  {item.year ?? '—'} · <Gauge className="inline h-3 w-3" /> {item.mileage_km != null ? kmFmt(item.mileage_km) : '—'}{item.fuel_type ? ` · ${item.fuel_type}` : ''}{item.power_kw != null ? ` · ${item.power_kw} kW` : ''}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">{czk(item.price_czk)}</div>
                {item.gap_pct != null && <div className="text-xs font-semibold text-accent">−{Math.round(item.gap_pct * 100)} % pod trhem</div>}
              </div>
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Stránka {page} z {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1 || isLoading} aria-label="Předchozí"
              className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-zinc-300 transition hover:text-white disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages || isLoading} aria-label="Další"
              className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-zinc-300 transition hover:text-white disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
      <Icon className="h-5 w-5 text-accent" />
      <div className={`mt-3 font-display text-2xl font-bold ${accent ? 'text-accent' : 'text-white'}`}>{value}</div>
      <div className="text-sm text-zinc-400">{label}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} {...props}
        className="w-full rounded-xl border border-white/10 bg-ink-950 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20" />
    </label>
  );
}
