import { useEffect, useState } from 'react';
import { Type, Save, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import { useApp } from '../AppContext.jsx';
import { HOME_TEXT } from '../data/landing.js';

/* Editovatelné texty webu, seskupené po sekcích.
   Přidání dalšího pole = jeden řádek sem + použití klíče v dané komponentě. */
const GROUPS = [
  { group: 'Úvodní stránka — hero', items: [
    { key: 'home_hero_badge', label: 'Odznak nahoře' },
    { key: 'home_hero_title', label: 'Nadpis (bílá část)' },
    { key: 'home_hero_title_accent', label: 'Nadpis (zelená část)' },
    { key: 'home_hero_subtitle', label: 'Podnadpis', multiline: true },
    { key: 'home_hero_savings', label: 'Zelený box (spořicí účet)', multiline: true },
    { key: 'home_stat_sold', label: 'Počet prodaných aut (jen číslo, zobrazí se s „+")' },
    { key: 'home_stat_members', label: 'Počet členů komunity (jen číslo, zobrazí se s „+")' },
  ]},
  { group: 'Úvodní stránka — co dostaneš a co se naučíš', items: [
    { key: 'home_gets_title', label: '„Co u nás dostaneš" — nadpis' },
    { key: 'home_gets_text', label: '„Co u nás dostaneš" — text', multiline: true },
    { key: 'home_gets_accent', label: '„Co u nás dostaneš" — zelený řádek' },
    { key: 'home_learn_title', label: '„Co se naučíš" — nadpis' },
    { key: 'home_learn_subtitle', label: '„Co se naučíš" — úvod', multiline: true },
    { key: 'home_group_badge', label: '„Proč zrovna naše skupina" — odznak' },
    { key: 'home_group_title', label: '„Proč zrovna naše skupina" — nadpis' },
  ]},
  { group: 'Úvodní stránka — členství komunity', items: [
    { key: 'home_member_eyebrow', label: 'Štítek' },
    { key: 'home_member_title', label: 'Nadpis (bílá část)' },
    { key: 'home_member_title_accent', label: 'Nadpis (zelené slovo)' },
    { key: 'home_member_subtitle', label: 'Text pod nadpisem (cena)', multiline: true },
    { key: 'home_member_netflix_price', label: 'Srovnání vlevo — cena (např. 330 Kč)' },
    { key: 'home_member_netflix_label', label: 'Srovnání vlevo — název (Netflix Premium)' },
    { key: 'home_member_netflix_text', label: 'Srovnání vlevo — popis' },
    { key: 'home_member_our_price', label: 'Srovnání vpravo — naše cena' },
    { key: 'home_member_our_label', label: 'Srovnání vpravo — název' },
    { key: 'home_member_our_text', label: 'Srovnání vpravo — popis' },
    { key: 'home_member_compare_note', label: 'Věta pod srovnáním', multiline: true },
    { key: 'home_member_referral_title', label: 'Box s provizí — nadpis' },
    { key: 'home_member_referral_text', label: 'Box s provizí — text', multiline: true },
    { key: 'home_member_cta', label: 'Tlačítko' },
    { key: 'home_member_cta_note', label: 'Poznámka pod tlačítkem' },
  ]},
  { group: 'Úvodní stránka — naše auta a kontakt', items: [
    { key: 'home_flips_title', label: '„Tohle jsme sami naflipovali" — nadpis' },
    { key: 'home_flips_subtitle', label: '„Tohle jsme sami naflipovali" — text', multiline: true },
    { key: 'home_contact_title', label: 'Kontakt — nadpis newsletteru' },
    { key: 'home_contact_text', label: 'Kontakt — text newsletteru', multiline: true },
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
  { group: 'Finanční služby (cashback)', items: [
    { key: 'fin_rate_insurance', label: 'Cashback pojištění – % z ročního pojistného (jen číslo, např. 10)' },
    { key: 'fin_rate_loan', label: 'Cashback úvěr – % z výše úvěru (jen číslo, např. 0,8)' },
    { key: 'fin_rate_leasing', label: 'Cashback leasing – % z financované částky (jen číslo)' },
    { key: 'fin_rate_refinancing', label: 'Cashback refinancování – % z refinancované částky (jen číslo)' },
    { key: 'fin_intermediary', label: 'Zprostředkovatel (např. „Pojištění a úvěry zprostředkovává XY s.r.o., registrovaná u ČNB pod č. 123.")', multiline: true },
    { key: 'fin_disclaimer', label: 'Právní poznámka pod stránkou (prázdné = výchozí text)', multiline: true },
  ]},
  { group: 'Prodej auta (Prodáme ti auto)', items: [
    { key: 'sell_eyebrow', label: 'Nadtitulek (prázdné = „Prodáme ti auto")' },
    { key: 'sell_subtitle', label: 'Podnadpis (prázdné = výchozí text)', multiline: true },
    { key: 'sell_example_price', label: 'Příklad – tvoje cena v Kč (jen číslo, prázdné = 350 000)' },
    { key: 'sell_example_commission', label: 'Příklad – naše provize v Kč (jen číslo; prázdné = „dle dohody")' },
    { key: 'sell_response_hours', label: 'Ozveme se do X hodin – jen číslo (prázdné = „ozveme se co nejdřív")' },
    { key: 'sell_address', label: 'Adresa pro podpis smlouvy „U nás, …" (např. Světova 523/1, Praha 8)' },
    { key: 'sell_faq_unsold', label: 'FAQ: Co když se auto neprodá? (prázdné = otázka se neukáže)', multiline: true },
    { key: 'sell_faq_higher', label: 'FAQ: Můžu chtít vyšší cenu, než navrhnete? (prázdné = výchozí odpověď)', multiline: true },
    { key: 'sell_faq_where', label: 'FAQ: Kde je auto během prodeje? (prázdné = otázka se neukáže)', multiline: true },
    { key: 'sell_faq_duration', label: 'FAQ: Jak dlouho prodej trvá? (prázdné = otázka se neukáže)', multiline: true },
    { key: 'sell_faq_payout', label: 'FAQ: Kdy dostanu peníze? (prázdné = otázka se neukáže)', multiline: true },
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
    // Texty úvodní stránky mají výchozí znění → ukaž ho, ať je co upravovat.
    ALL_FIELDS.forEach((f) => { init[f.key] = siteText[f.key] || HOME_TEXT[f.key] || ''; });
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
