import { useEffect, useState } from 'react';
import { Type, Save, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import { useApp } from '../AppContext.jsx';

/* Editovatelné texty webu, seskupené po sekcích.
   Přidání dalšího pole = jeden řádek sem + použití klíče v dané komponentě. */
const GROUPS = [
  { group: 'Hero (úvod)', items: [
    { key: 'hero_badge', label: 'Odznak nahoře' },
    { key: 'hero_title', label: 'Nadpis (bílá část)' },
    { key: 'hero_title_accent', label: 'Nadpis (zelená část)' },
    { key: 'hero_subtitle', label: 'Podnadpis', multiline: true },
  ]},
  { group: 'Proč my', items: [
    { key: 'whyus_eyebrow', label: 'Nadtitulek' },
    { key: 'whyus_title', label: 'Nadpis' },
    { key: 'whyus_subtitle', label: 'Podnadpis', multiline: true },
    { key: 'whyus_badge', label: 'Odznak unikátnosti' },
  ]},
  { group: 'Bazar', items: [
    { key: 'market_eyebrow', label: 'Nadtitulek' },
    { key: 'market_title', label: 'Nadpis' },
    { key: 'market_subtitle', label: 'Podnadpis', multiline: true },
  ]},
  { group: 'Jak prověřujeme auta', items: [
    { key: 'verify_eyebrow', label: 'Nadtitulek' },
    { key: 'verify_title', label: 'Nadpis' },
    { key: 'verify_subtitle', label: 'Podnadpis', multiline: true },
  ]},
  { group: 'Jak to funguje', items: [
    { key: 'how_eyebrow', label: 'Nadtitulek' },
    { key: 'how_title', label: 'Nadpis' },
    { key: 'how_subtitle', label: 'Podnadpis', multiline: true },
  ]},
  { group: 'Recenze studentů', items: [
    { key: 'rev_eyebrow', label: 'Nadtitulek' },
    { key: 'rev_title', label: 'Nadpis' },
    { key: 'rev_subtitle', label: 'Podnadpis', multiline: true },
  ]},
  { group: 'Kalkulačka', items: [
    { key: 'calc_eyebrow', label: 'Nadtitulek' },
    { key: 'calc_title', label: 'Nadpis' },
    { key: 'calc_subtitle', label: 'Podnadpis', multiline: true },
  ]},
  { group: 'Akademie', items: [
    { key: 'edu_eyebrow', label: 'Nadtitulek' },
    { key: 'edu_title', label: 'Nadpis' },
    { key: 'edu_subtitle', label: 'Podnadpis', multiline: true },
  ]},
  { group: 'Ceník', items: [
    { key: 'price_eyebrow', label: 'Nadtitulek' },
    { key: 'price_title', label: 'Nadpis' },
    { key: 'price_subtitle', label: 'Podnadpis', multiline: true },
  ]},
  { group: 'FAQ', items: [
    { key: 'faq_eyebrow', label: 'Nadtitulek' },
    { key: 'faq_title', label: 'Nadpis' },
  ]},
];

const ALL_FIELDS = GROUPS.flatMap((g) => g.items);

export default function TextsAdmin() {
  const { siteText, reloadContent } = useApp();
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = {};
    ALL_FIELDS.forEach((f) => { init[f.key] = siteText[f.key] ?? ''; });
    setValues(init);
  }, [siteText]);

  const save = async () => {
    setSaving(true); setError(''); setSavedAt(false);
    const rows = ALL_FIELDS.map((f) => ({ key: f.key, value: values[f.key] ?? '', updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('content').upsert(rows, { onConflict: 'key' });
    if (error) setError(error.message);
    else { await reloadContent(); setSavedAt(true); setTimeout(() => setSavedAt(false), 2500); }
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white"><Type className="h-5 w-5 text-accent" /> Texty webu</h1>
        <p className="mt-1 text-sm text-zinc-400">Uprav texty a klikni Uložit — na webu se hned projeví.</p>
      </div>

      {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}

      {GROUPS.map((g) => (
        <div key={g.group} className="space-y-4 rounded-2xl border border-white/10 bg-ink-850 p-5">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-accent">{g.group}</h3>
          {g.items.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">{f.label}</span>
              {f.multiline ? (
                <textarea rows={3} value={values[f.key] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="w-full resize-y rounded-xl border border-white/10 bg-ink-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20" />
              ) : (
                <input value={values[f.key] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-ink-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20" />
              )}
            </label>
          ))}
        </div>
      ))}

      <div className="sticky bottom-4">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-ink-950 shadow-glow transition enabled:hover:brightness-110 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : savedAt ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {savedAt ? 'Uloženo' : 'Uložit texty'}
        </button>
      </div>
    </div>
  );
}
