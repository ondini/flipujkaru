import { useEffect, useState } from 'react';
import { Sparkles, Lock, Undo2, XCircle } from 'lucide-react';
import { PLANS, czk } from '../data/content.js';
import { BILLING_OPTIONS, DEFAULT_BILLING, perMonth } from '../config/billing.js';
import { useApp } from '../AppContext.jsx';
import Reveal from './Reveal.jsx';

// Sazba za měsíc u nejdražší (měsíční) varianty — základ pro výpočet úspory
const MONTHLY_RATE = perMonth(BILLING_OPTIONS.find((o) => o.id === 'monthly') || BILLING_OPTIONS[0]);
const savePct = (o) => Math.max(0, Math.round((1 - perMonth(o) / MONTHLY_RATE) * 100));

// Garanční odznaky pod ceníkem — snižují vnímané riziko nákupu
const TRUST = [
  { icon: Lock, text: 'Zabezpečená platba' },
  { icon: Undo2, text: '2měsíční garance vrácení peněz' },
  { icon: XCircle, text: 'Zrušíš kdykoli, bez závazků' },
];

/** Animované zaškrtnutí — „nakreslí" se po objevení (stagger dle indexu) */
function FeatureCheck({ label, index, strong }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 200 + index * 90);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <li className={`flex items-start gap-3 ${strong ? 'font-semibold text-white' : 'text-zinc-300'}`}>
      <span
        className={`check-draw mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors duration-300 ${
          on ? 'check-on border-accent bg-accent-soft' : 'border-white/20'
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="#39FF14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5L20 6" />
        </svg>
      </span>
      <span className="text-sm">{label}</span>
    </li>
  );
}

/** Cenová karta — jedno členství, tři varianty podle frekvence platby. */
function PlanCard({ plan }) {
  const { startCheckout } = useApp();
  const [billing, setBilling] = useState(DEFAULT_BILLING);

  return (
    <div className="grad-border relative mx-auto w-full max-w-md rounded-3xl p-8 shadow-glow">
      <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-3 py-1 text-xs font-bold text-ink-950 shadow-glow animate-glow">
        <Sparkles className="w-3.5 h-3.5" /> JEDINÉ ČLENSTVÍ
      </span>

      <h4 className="font-display text-sm font-bold tracking-[0.2em] text-accent">{plan.name}</h4>
      <p className="mt-1 text-sm text-zinc-500">{plan.tagline}</p>

      {/* Přepínač frekvence platby */}
      <div className="mt-5 grid grid-cols-3 gap-1.5 rounded-2xl border border-white/10 bg-ink-850 p-1.5">
        {BILLING_OPTIONS.map((o) => {
          const active = o.id === billing.id;
          return (
            <button
              key={o.id}
              onClick={() => setBilling(o)}
              className={`relative rounded-xl px-2 py-2 text-center text-sm font-semibold transition ${
                active ? 'bg-accent text-ink-950 shadow-glow' : 'text-zinc-300 hover:text-white'
              }`}
            >
              {o.label}
              {savePct(o) > 0 && (
                <span className={`mt-0.5 block text-[10px] font-bold ${active ? 'text-ink-950/70' : 'text-accent'}`}>
                  −{savePct(o)} %
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-end gap-1">
        <span className="font-display text-4xl font-bold text-white">{czk(billing.price)}</span>
        <span className="mb-1 text-sm text-zinc-500">/ {billing.period}</span>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        {billing.months > 1 ? `${czk(perMonth(billing))} / měsíc · ${billing.note}` : billing.note}
      </p>

      <ul className="mt-6 space-y-3">
        {plan.features.map((f, i) => (
          <FeatureCheck key={f} label={f} index={i} strong={f.includes('+')} />
        ))}
      </ul>

      <button
        onClick={() => startCheckout(plan, billing)}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 font-semibold text-ink-950 transition hover:brightness-110"
      >
        {plan.cta}
      </button>
    </div>
  );
}

export default function Pricing() {
  const { siteText: t } = useApp();
  const plan = PLANS[0];

  return (
    <section id="cenik" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t.price_eyebrow || 'Členství'}</span>
          <h3 className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight text-white">
            {t.price_title || 'Jedno členství. Žádné kompromisy.'}
          </h3>
          <p className="mt-3 text-zinc-400">{t.price_subtitle || 'Zruš kdykoli. Bez závazků. 2měsíční garance vrácení peněz.'}</p>
        </Reveal>

        <div className="mt-14">
          <Reveal>
            <PlanCard plan={plan} />
          </Reveal>
        </div>

        {/* Garanční odznaky */}
        <Reveal delay={120} className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUST.map(({ icon: Icon, text }) => (
            <span key={text} className="inline-flex items-center gap-2 text-sm text-zinc-400">
              <Icon className="h-4 w-4 text-accent" />
              {text}
            </span>
          ))}
        </Reveal>

        <p className="mt-6 text-center text-sm text-zinc-500">Cena vč. DPH.</p>
      </div>
    </section>
  );
}
