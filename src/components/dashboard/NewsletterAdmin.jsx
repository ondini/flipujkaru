import { useEffect, useState } from 'react';
import { Mail, Download, Trash2, Loader2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

const fmtDate = (iso) => new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });

/** Administrace → Newsletter (e-maily z formuláře Kontakt na úvodní stránce). */
export default function NewsletterAdmin() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [deleting, setDeleting] = useState('');

  const load = async () => {
    const { data, error: err } = await supabase
      .from('newsletter_subscribers').select('id, email, created_at').order('created_at', { ascending: false });
    if (err) setError(`Seznam se nepodařilo načíst: ${err.message}`);
    else { setList(data || []); setError(''); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (r) => {
    if (!window.confirm(`Odebrat ${r.email} ze seznamu?`)) return;
    setDeleting(r.id);
    const { error: err } = await supabase.from('newsletter_subscribers').delete().eq('id', r.id);
    if (err) setError(`Odebrání se nepovedlo: ${err.message}`);
    else setList((l) => l.filter((x) => x.id !== r.id));
    setDeleting('');
  };

  const exportCsv = () => {
    const rows = [['email', 'prihlaseno'], ...list.map((r) => [r.email, r.created_at])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `newsletter-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const q = query.trim().toLowerCase();
  const shown = q ? list.filter((r) => r.email.includes(q)) : list;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white"><Mail className="h-5 w-5 text-accent" /> Newsletter</h1>
          <p className="mt-1 text-sm text-zinc-400">E-maily z formuláře Kontakt na úvodní stránce. Celkem {list.length}.</p>
        </div>
        <button onClick={exportCsv} disabled={!list.length} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5 disabled:opacity-40">
          <Download className="h-4 w-4" /> Stáhnout CSV
        </button>
      </div>

      {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}

      <label className="relative block max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Hledat e-mail"
          className="w-full rounded-xl border border-white/10 bg-ink-950 py-2.5 pl-9 pr-4 text-sm text-white outline-none transition focus:border-accent/60" />
      </label>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-850">
        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>
        ) : !shown.length ? (
          <p className="p-8 text-center text-sm text-zinc-500">{list.length ? 'Nic nenalezeno.' : 'Zatím se nikdo nepřihlásil.'}</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {shown.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{r.email}</div>
                  <div className="text-xs text-zinc-500">{fmtDate(r.created_at)}</div>
                </div>
                <button onClick={() => remove(r)} disabled={deleting === r.id} aria-label={`Odebrat ${r.email}`} title="Odebrat (odhlásit)"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-red-500/40 hover:text-red-400 disabled:opacity-50">
                  {deleting === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
