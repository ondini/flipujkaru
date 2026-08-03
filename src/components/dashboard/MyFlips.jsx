import { useEffect, useState } from 'react';
import { TrendingUp, Plus, Trash2, Loader2, X, PiggyBank, Car, Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { czk } from '../../data/content.js';

/** Osobní sledování flipů zákazníka (ukládá se do tabulky user_flips). */
export default function MyFlips() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ brand: '', model: '', buy: '', repair: '', sell: '', status: 'in_progress' });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('user_flips').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else { setList(data || []); setError(''); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    const payload = {
      brand: form.brand, model: form.model,
      buy: Number(form.buy) || 0, repair: Number(form.repair) || 0, sell: Number(form.sell) || 0,
      status: form.status,
    };
    const { error } = await supabase.from('user_flips').insert(payload);
    if (error) setError(error.message);
    else { setForm({ brand: '', model: '', buy: '', repair: '', sell: '', status: 'in_progress' }); setAdding(false); load(); }
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
          <p className="mt-1 text-sm text-zinc-400">Zaznamenávej svoje auta a sleduj reálný zisk.</p>
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
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
          Tabulka „user_flips" zatím neexistuje. Spusť v Supabase SQL z poslední zprávy. ({error})
        </p>
      )}

      {/* Formulář */}
      {adding && (
        <form onSubmit={add} className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-ink-850 p-5 sm:grid-cols-2">
          <Field label="Značka" value={form.brand} onChange={(v) => setForm((f) => ({ ...f, brand: v }))} placeholder="BMW" required />
          <Field label="Model" value={form.model} onChange={(v) => setForm((f) => ({ ...f, model: v }))} placeholder="330i" required />
          <Field label="Nákup (Kč)" type="number" value={form.buy} onChange={(v) => setForm((f) => ({ ...f, buy: v }))} />
          <Field label="Oprava (Kč)" type="number" value={form.repair} onChange={(v) => setForm((f) => ({ ...f, repair: v }))} />
          <Field label="Prodej (Kč)" type="number" value={form.sell} onChange={(v) => setForm((f) => ({ ...f, sell: v }))} />
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-zinc-400">Stav</span>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-ink-950 px-4 py-2.5 text-sm text-white outline-none focus:border-accent/60">
              <option value="in_progress" className="bg-ink-900">Rozpracováno</option>
              <option value="sold" className="bg-ink-900">Prodáno</option>
            </select>
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-xl bg-accent px-6 py-3 font-semibold text-ink-950 shadow-glow transition hover:brightness-110">Uložit flip</button>
          </div>
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
                  <div className="font-display font-bold text-white">{f.brand} <span className="font-normal text-zinc-400">{f.model}</span></div>
                  <div className="text-xs text-zinc-500">Nákup {czk(f.buy)} · oprava {czk(f.repair)} · prodej {czk(f.sell)}</div>
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
