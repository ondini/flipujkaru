import { useState } from 'react';
import { Megaphone, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { useApp } from '../../AppContext.jsx';
import { BILLING_OPTIONS, campaignFromText } from '../../config/billing.js';

/**
 * Admin: přepínače kampaně (Nastavení → Kampaň). Ukládá do tabulky `content`
 * (klíče promo_trial / promo_discount, hodnoty 'on' | 'off'). Pokladnu řídí
 * server (functions/_campaign.js) — tady se jen mění přepínače.
 */
const TOGGLES = [
  {
    key: 'promo_trial',
    field: 'trial',
    title: 'První měsíc zdarma',
    text: 'Noví členové mají u všech délek členství prvních 30 dní zdarma, pak se automaticky strhne první platba.',
  },
  {
    key: 'promo_discount',
    field: 'discount',
    title: 'Sleva na první placené období',
    text: `Noví členové dostanou slevu na první placené období: ${BILLING_OPTIONS.map((o) => `${o.label} −${o.campaignPct} %`).join(', ')}. Slevový kód ji nahrazuje.`,
  },
];

export default function CampaignSettings() {
  const { siteText, reloadContent } = useApp();
  const campaign = campaignFromText(siteText);
  const [saving, setSaving] = useState(''); // klíč, který se právě ukládá
  const [error, setError] = useState('');

  const toggle = async (t) => {
    setSaving(t.key);
    setError('');
    const value = campaign[t.field] ? 'off' : 'on';
    const { error: err } = await supabase.from('content').upsert([{ key: t.key, value }], { onConflict: 'key' });
    if (err) setError('Nastavení se nepodařilo uložit, zkus to znovu.');
    else await reloadContent();
    setSaving('');
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
      <h3 className="inline-flex items-center gap-2 font-display font-bold text-white"><Megaphone className="h-4 w-4 text-accent" /> Kampaň</h3>
      <p className="mt-1 text-sm text-zinc-400">Platí pro nové objednávky ihned po přepnutí. Jen pro nové členy (e-mail bez dřívějšího předplatného).</p>
      <div className="mt-4 space-y-3">
        {TOGGLES.map((t) => {
          const on = campaign[t.field];
          return (
            <div key={t.key} className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-ink-950 p-4">
              <div>
                <div className="text-sm font-semibold text-white">{t.title}</div>
                <p className="mt-0.5 text-xs text-zinc-500">{t.text}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={t.title}
                disabled={!!saving}
                onClick={() => toggle(t)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${on ? 'bg-accent' : 'bg-white/15'}`}
              >
                {saving === t.key
                  ? <Loader2 className="mx-auto h-4 w-4 animate-spin text-ink-950" />
                  : <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />}
              </button>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
