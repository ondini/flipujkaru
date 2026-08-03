import { Users, ExternalLink, Trophy, Sparkles } from 'lucide-react';
import { czk } from '../../data/content.js';
import { LEADERBOARD, COMMUNITY_WINS } from '../../data/member.js';

/** Komunitní sekce — žebříček, feed úspěchů, Discord. */
export default function Community() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white"><Users className="h-5 w-5 text-accent" /> Komunita</h1>
        <p className="mt-1 text-sm text-zinc-400">1 800+ členů, kteří si navzájem pomáhají. Rosteme spolu.</p>
      </div>

      {/* Discord CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/25 bg-accent-soft p-5">
        <div>
          <div className="font-display font-bold text-white">Discord komunita</div>
          <div className="text-sm text-zinc-400">Sdílej dealy, ptej se, dostávej odpovědi do hodiny.</div>
        </div>
        <a href="#" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:brightness-110">Otevřít Discord <ExternalLink className="h-4 w-4" /></a>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Žebříček */}
        <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
          <h3 className="inline-flex items-center gap-2 font-display font-bold text-white"><Trophy className="h-4 w-4 text-accent" /> Žebříček měsíce</h3>
          <div className="mt-4 space-y-2">
            {LEADERBOARD.map((r) => (
              <div key={r.rank} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${r.me ? 'border border-accent/40 bg-accent-soft' : 'bg-ink-950'}`}>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${r.rank <= 3 ? 'bg-accent text-ink-950' : 'bg-white/10 text-zinc-300'}`}>{r.rank}</span>
                <span className={`flex-1 text-sm font-medium ${r.me ? 'text-accent' : 'text-white'}`}>{r.name}</span>
                <span className="text-xs text-zinc-500">{r.flips} flipů</span>
                <span className="text-sm font-semibold text-white">{czk(r.profit)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feed úspěchů */}
        <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
          <h3 className="inline-flex items-center gap-2 font-display font-bold text-white"><Sparkles className="h-4 w-4 text-accent" /> Poslední úspěchy</h3>
          <div className="mt-4 space-y-2.5">
            {COMMUNITY_WINS.map((w, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-ink-950 px-3 py-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent">{w.name.split(' ').map((x) => x[0]).join('')}</div>
                <div className="min-w-0 flex-1 text-sm text-zinc-300"><span className="font-semibold text-white">{w.name}</span> {w.text} <span className="text-xs text-zinc-500">· {w.time}</span></div>
                {w.profit > 0 && <span className="shrink-0 rounded-md bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent">+{czk(w.profit)}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
