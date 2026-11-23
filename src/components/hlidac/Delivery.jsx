import { useEffect, useState } from 'react';
import { Save, Loader2, Send, Mail, BellOff } from 'lucide-react';
import { hlidacApi } from '../../lib/hlidacApi.js';
import { useHlidac, Loading, ErrorBox } from './HlidacAdmin.jsx';

const FIELDS = {
  telegram: [
    ['tg_daily_cap', 'Max zpráv za den', 'Kolik aut nejvýš za den přijde do Telegramu. Když je jich víc, přednost mají ta s nejvyšší marží.', 'zpráv'],
    ['tg_gap_min', 'Rozestup mezi zprávami', 'Nejkratší pauza mezi dvěma auty, ať chat nezahltí.', 'min'],
    ['max_age_h', 'Nejdéle čekat', 'Auto, které kvůli limitu čeká déle, se už nepošle (bývá prodané). Tady v adminu zůstane.', 'h'],
  ],
  members: [
    ['member_watchers', 'Hlídačů na člena', 'Kolik hlídačů si může nastavit člen s aktivním předplatným.', 'hlídače'],
    ['email_daily_cap', 'E-mailů na člena za den', 'Každé nalezené auto jde členovi hned e-mailem, nejvýš tolik za den.', 'e-mailů'],
  ],
};

export default function Delivery() {
  const [data, error, loading, reload] = useHlidac(() => hlidacApi.delivery());
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  return <Editor data={data} onSaved={reload} />;
}

function Editor({ data, onSaved }) {
  const [draft, setDraft] = useState(data.settings);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  useEffect(() => setDraft(data.settings), [data]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(data.settings);
  const tg = data.stats?.telegram || {};

  const save = async () => {
    setBusy(true); setMsg(null);
    try { await hlidacApi.saveDelivery(draft); setMsg({ ok: true, text: 'Uloženo, platí hned.' }); onSaved(); }
    catch (e) { setMsg({ ok: false, text: e.message }); }
    finally { setBusy(false); }
  };

  const field = ([k, label, help, unit]) => {
    const [lo, hi] = data.limits[k] || [0, 999];
    return (
      <label key={k} className="block">
        <span className="text-sm font-semibold text-white">{label}</span>
        <span className="mt-0.5 block text-xs text-zinc-500">{help}</span>
        <span className="mt-2 flex items-center gap-2">
          <input type="number" min={lo} max={hi} step={k === 'tg_gap_min' ? 0.5 : 1} value={draft[k] ?? ''}
            onChange={(e) => setDraft({ ...draft, [k]: e.target.value === '' ? '' : Number(e.target.value) })}
            className="w-28 rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-white focus:border-accent/60 focus:outline-none" />
          <span className="text-sm text-zinc-400">{unit}</span>
        </span>
      </label>
    );
  };

  return (
    <div className="max-w-2xl space-y-4">
      <section className="rounded-2xl border border-white/10 bg-ink-850 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${draft.telegram ? 'bg-accent-soft text-accent' : 'bg-white/5 text-zinc-400'}`}>
              {draft.telegram ? <Send className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            </span>
            <div>
              <h3 className="font-semibold text-white">Telegram</h3>
              <p className="mt-0.5 text-sm text-zinc-400">
                {draft.telegram ? 'Nalezená auta chodí do chatu podle limitů níže.' : 'Tichý režim: auta se jen ukládají sem do adminu, do chatu nechodí nic.'}
              </p>
            </div>
          </div>
          <Toggle on={draft.telegram} onChange={(v) => setDraft({ ...draft, telegram: v })} label="Posílat do Telegramu" />
        </div>
        {!data.telegram_ready && draft.telegram && (
          <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">Hlídač nemá nastaveného bota Telegramu, zprávy zatím nepůjdou.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Stat label="dnes odesláno" n={tg.sent} />
          <Stat label="čeká ve frontě" n={tg.queued} />
          <Stat label="propadlo" n={tg.expired} />
          <Stat label="prodáno dřív" n={tg.gone} />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">{FIELDS.telegram.map(field)}</div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-ink-850 p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-zinc-300"><Mail className="h-5 w-5" /></span>
          <div>
            <h3 className="font-semibold text-white">Hlídače členů</h3>
            <p className="mt-0.5 text-sm text-zinc-400">Členové si v klientské sekci nastaví vlastní hlídač, auta jim chodí e-mailem.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">{FIELDS.members.map(field)}</div>
      </section>

      <div className="sticky bottom-3 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-ink-950/90 p-3 backdrop-blur">
        <button type="button" onClick={save} disabled={busy || !dirty} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 shadow-glow hover:brightness-110 disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Uložit
        </button>
        {dirty && <button type="button" onClick={() => setDraft(data.settings)} className="text-sm text-zinc-400 hover:text-white">Zahodit změny</button>}
        {msg && <span role="alert" className={`text-sm ${msg.ok ? 'text-accent' : 'text-red-400'}`}>{msg.text}</span>}
      </div>
    </div>
  );
}

export function Toggle({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? 'bg-accent' : 'bg-white/15'}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

function Stat({ label, n }) {
  return <span className="rounded-lg border border-white/10 px-2.5 py-1 text-zinc-400"><b className="font-semibold text-white">{n || 0}</b> {label}</span>;
}
