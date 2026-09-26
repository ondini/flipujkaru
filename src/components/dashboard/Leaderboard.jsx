import { useEffect, useState } from 'react';
import { Trophy, Loader2, Car } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { czk } from '../../data/content.js';

/** Žebříčky napříč celou komunitou — nejlepší flipy a nejlepší flipeři. */
export default function Leaderboard() {
  const [flips, setFlips] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      supabase.rpc('leaderboard_top_flips', { limit_count: 10 }),
      supabase.rpc('leaderboard_top_users', { limit_count: 10 }),
    ]).then(([flipsRes, usersRes]) => {
      if (cancelled) return;
      if (flipsRes.error || usersRes.error) setError((flipsRes.error || usersRes.error).message);
      else { setFlips(flipsRes.data || []); setUsers(usersRes.data || []); setError(''); }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white"><Trophy className="h-5 w-5 text-accent" /> Žebříčky</h1>
        <p className="mt-1 text-sm text-zinc-400">Nejlepší flipy a nejúspěšnější flipeři z celé komunity.</p>
      </div>

      {error && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" /> Načítám…</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Nejlepší flipy */}
          <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
            <h3 className="inline-flex items-center gap-2 font-display font-bold text-white"><Car className="h-4 w-4 text-accent" /> Nejlepší flipy</h3>
            {flips.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-400">Zatím žádné prodané flipy k zobrazení.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {flips.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-ink-950 px-3 py-2.5">
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${i < 3 ? 'bg-accent text-ink-950' : 'bg-white/10 text-zinc-300'}`}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-white">{f.brand} {f.model}</div>
                      <div className="text-xs text-zinc-500">{f.display_name}</div>
                    </div>
                    <span className="text-sm font-semibold text-accent">+{czk(f.profit)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nejlepší flipeři */}
          <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
            <h3 className="inline-flex items-center gap-2 font-display font-bold text-white"><Trophy className="h-4 w-4 text-accent" /> Nejlepší flipeři</h3>
            {users.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-400">Zatím žádní flipeři k zobrazení.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {users.map((u, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${u.is_me ? 'border border-accent/40 bg-accent-soft' : 'bg-ink-950'}`}>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${i < 3 ? 'bg-accent text-ink-950' : 'bg-white/10 text-zinc-300'}`}>{i + 1}</span>
                    <span className={`flex-1 text-sm font-medium ${u.is_me ? 'text-accent' : 'text-white'}`}>{u.display_name}</span>
                    <span className="text-xs text-zinc-500">{u.flips_count} flipů</span>
                    <span className="text-sm font-semibold text-white">{czk(u.total_profit)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
