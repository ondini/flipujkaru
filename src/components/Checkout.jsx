import { useEffect, useState } from 'react';
import { X, CreditCard, Landmark, ShieldCheck, Lock, Check, Loader2, Apple, AlertCircle } from 'lucide-react';
import { useApp } from '../AppContext.jsx';
import { czk } from '../data/content.js';
import { STRIPE_READY, DEFAULT_BILLING, BILLING_OPTIONS, perMonth } from '../config/billing.js';
import { getTg } from '../lib/telegram.js';

const STEPS = ['Souhrn', 'Platba', 'Hotovo'];
const MONTHLY_RATE = perMonth(BILLING_OPTIONS.find((o) => o.id === 'monthly') || BILLING_OPTIONS[0]);
const savePct = (o) => Math.max(0, Math.round((1 - perMonth(o) / MONTHLY_RATE) * 100));

/** Pomocné formátování vstupů karty */
const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const fmtExp = (v) => v.replace(/\D/g, '').slice(0, 4).replace(/(.{2})(.+)/, '$1/$2');

export default function Checkout() {
  const { checkout, closeCheckout, completePurchase, user } = useApp();
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', name: '', card: '', exp: '', cvc: '' });
  const [promoCode, setPromoCode] = useState(''); // slevový kód — uplatní se už při vytvoření platby
  const [promoOpen, setPromoOpen] = useState(false);
  const [billing, setBilling] = useState(DEFAULT_BILLING); // délka členství — jde změnit i tady

  // Reset při otevření + zámek scrollu
  useEffect(() => {
    if (checkout) {
      setStep(0);
      setMethod('card');
      setProcessing(false);
      setError('');
      setBilling(checkout.billing || DEFAULT_BILLING); // předvol variantu z ceníku
      // Kód z odkazu (?promo=…) předvyplníme
      const urlPromo = new URLSearchParams(window.location.search).get('promo');
      if (urlPromo) { setPromoCode(urlPromo.toUpperCase()); setPromoOpen(true); }
      setForm((f) => ({ ...f, email: user?.email || f.email })); // předvyplň e-mail účtu
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [checkout]);

  if (!checkout) return null;
  const { plan } = checkout;
  const total = billing.price;
  const period = billing.period;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const cardValid = method !== 'card' || (form.email.includes('@') && form.card.replace(/\s/g, '').length === 16 && form.exp.length === 5 && form.cvc.length >= 3);

  // Mock platba (demo režim, když nejsou nastavené Stripe ceny)
  const pay = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setStep(2); }, 1600);
  };

  // Reálná platba: vytvoříme Stripe Checkout Session na backendu a přesměrujeme
  const goToStripe = async () => {
    if (!STRIPE_READY) { setStep(1); return; } // fallback na demo pokladnu
    setProcessing(true);
    setError('');
    try {
      // Uložíme volbu, ať po návratu ze Stripe víme, co aktivovat
      localStorage.setItem('fk_pending', JSON.stringify({ planName: plan.name, billing: billing.id, email: form.email }));
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: billing.priceId, email: form.email || undefined, planName: plan.name, billing: billing.id, userId: user?.id, tg: getTg(), promoCode: promoCode.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) { setError(data.error || 'Nepodařilo se vytvořit platbu. Zkus to prosím znovu.'); setProcessing(false); return; }
      window.location.href = data.url; // → bezpečná stránka Stripe
    } catch {
      setError('Platbu se nepodařilo spustit — zkontroluj připojení a zkus to znovu.');
      setProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-ink-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={closeCheckout}
      role="dialog"
      aria-modal="true"
      aria-label="Pokladna"
    >
      <div
        className="animate-fade-up max-h-[94vh] w-full max-w-lg overflow-y-auto overflow-x-hidden rounded-t-3xl border border-white/10 bg-ink-900 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hlavička + stepper */}
        <div className="sticky top-0 z-10 border-b border-white/5 bg-ink-900/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-white">Objednávka členství</span>
            <button onClick={closeCheckout} aria-label="Zavřít" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-400 transition hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${i <= step ? 'bg-accent text-ink-950' : 'bg-white/10 text-zinc-400'}`}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={`text-xs font-medium ${i <= step ? 'text-white' : 'text-zinc-500'}`}>{s}</span>
                {i < STEPS.length - 1 && <span className={`h-px flex-1 ${i < step ? 'bg-accent/50' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* KROK 1 — Souhrn objednávky */}
          {step === 0 && (
            <div>
              <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-lg font-bold text-white">Plán {plan.name}</div>
                    <div className="text-sm text-zinc-400">{plan.tagline}</div>
                  </div>
                </div>
                {/* Délka členství — stejný přepínač jako v ceníku */}
                <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-2xl border border-white/10 bg-ink-950 p-1.5" role="radiogroup" aria-label="Délka členství">
                  {BILLING_OPTIONS.map((o) => {
                    const active = o.id === billing.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setBilling(o)}
                        className={`rounded-xl px-2 py-2 text-center text-sm font-semibold transition ${active ? 'bg-accent text-ink-950 shadow-glow' : 'text-zinc-300 hover:text-white'}`}
                      >
                        {o.label}
                        <span className={`mt-0.5 block whitespace-nowrap text-[11px] font-medium ${active ? 'text-ink-950/70' : 'text-zinc-500'}`}>{czk(o.price)}</span>
                        {/* Řádek se slevou i u měsíční varianty (prázdný) — stejná výška tlačítek */}
                        <span className={`block text-[10px] font-bold ${active ? 'text-ink-950/70' : 'text-accent'}`}>{savePct(o) > 0 ? `−${savePct(o)} %` : '\u00a0'}</span>
                      </button>
                    );
                  })}
                </div>
                <ul className="mt-4 space-y-2 border-t border-white/5 pt-4 text-sm">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-zinc-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-ink-850 p-5 text-sm">
                <div className="flex justify-between text-zinc-400"><span>Cena za {period}</span><span>{czk(total)}</span></div>
                <div className="flex justify-between border-t border-white/5 pt-2 font-display text-lg font-bold text-white">
                  <span>Celkem</span><span>{czk(total)}</span>
                </div>
                <p className="text-xs text-zinc-500">Vč. DPH. {billing.note}, zrušíš kdykoli.</p>
              </div>

              {/* E-mail (předvyplní se na Stripe) */}
              <div className="mt-4">
                <Field label="E-mail" value={form.email} onChange={set('email')} placeholder="tvuj@email.cz" type="email" />
              </div>

              {/* Slevový kód — uplatníme ho při vytvoření platby (na stránce Stripe ho pak uvidíš odečtený) */}
              <div className="mt-3">
                {promoOpen ? (
                  <Field label="Slevový kód" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="KÓD" autoComplete="off" />
                ) : (
                  <button type="button" onClick={() => setPromoOpen(true)} className="text-sm font-medium text-accent hover:underline">Mám slevový kód</button>
                )}
              </div>

              {error && (
                <p className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                </p>
              )}

              <button
                onClick={goToStripe}
                disabled={processing}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-semibold text-ink-950 shadow-glow transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Přesměrovávám na platbu…</> : <><Lock className="h-4 w-4" /> Pokračovat k bezpečné platbě</>}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Platbu zpracuje Stripe · karty, Apple&nbsp;/&nbsp;Google&nbsp;Pay
              </p>
            </div>
          )}

          {/* KROK 2 — Platba */}
          {step === 1 && (
            <div>
              {/* Výběr metody */}
              <div className="grid grid-cols-3 gap-2">
                {[{ k: 'card', label: 'Karta', Icon: CreditCard }, { k: 'apple', label: 'Apple Pay', Icon: Apple }, { k: 'bank', label: 'Převod', Icon: Landmark }].map(({ k, label, Icon }) => (
                  <button key={k} onClick={() => setMethod(k)} className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition ${method === k ? 'border-accent/50 bg-accent-soft text-white' : 'border-white/10 text-zinc-400 hover:border-white/20'}`}>
                    <Icon className="h-5 w-5" /> {label}
                  </button>
                ))}
              </div>

              {/* Formulář karty */}
              {method === 'card' && (
                <div className="mt-5 space-y-3">
                  <Field label="E-mail" value={form.email} onChange={set('email')} placeholder="tvuj@email.cz" type="email" />
                  <Field label="Jméno na kartě" value={form.name} onChange={set('name')} placeholder="Jan Novák" />
                  <Field label="Číslo karty" value={form.card} onChange={(e) => setForm((f) => ({ ...f, card: fmtCard(e.target.value) }))} placeholder="0000 0000 0000 0000" icon={CreditCard} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Platnost" value={form.exp} onChange={(e) => setForm((f) => ({ ...f, exp: fmtExp(e.target.value) }))} placeholder="MM/RR" />
                    <Field label="CVC" value={form.cvc} onChange={(e) => setForm((f) => ({ ...f, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="123" icon={Lock} />
                  </div>
                </div>
              )}
              {method === 'apple' && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-ink-850 p-6 text-center text-sm text-zinc-400">
                  <Apple className="mx-auto mb-2 h-8 w-8 text-white" />
                  Platbu potvrdíš přes Apple Pay. Stačí zadat e-mail níže.
                  <div className="mt-3 text-left"><Field label="E-mail" value={form.email} onChange={set('email')} placeholder="tvuj@email.cz" type="email" /></div>
                </div>
              )}
              {method === 'bank' && (
                <div className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-ink-850 p-5 text-sm text-zinc-300">
                  <p className="text-zinc-400">Pošli platbu na náš účet, přístup aktivujeme do 24 h:</p>
                  <div className="flex justify-between"><span className="text-zinc-500">Číslo účtu</span><span className="font-medium text-white">2702 837 461 / 2010</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Částka</span><span className="font-medium text-white">{czk(total)}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">VS</span><span className="font-medium text-white">100 234</span></div>
                  <div className="mt-2"><Field label="E-mail pro potvrzení" value={form.email} onChange={set('email')} placeholder="tvuj@email.cz" type="email" /></div>
                </div>
              )}

              <button
                disabled={!cardValid || processing}
                onClick={pay}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-semibold text-ink-950 shadow-glow transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Zpracovávám…</> : <><Lock className="h-4 w-4" /> {method === 'bank' ? 'Potvrdit objednávku' : `Zaplatit ${czk(total)}`}</>}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Zabezpečeno · 256-bit SSL · 2měsíční záruka vrácení
              </p>
            </div>
          )}

          {/* KROK 3 — Hotovo */}
          {step === 2 && (
            <div className="py-4 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-ink-950 shadow-glow">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold text-white">Vítej v týmu! 🏁</h3>
              <p className="mt-2 text-zinc-400">
                Platba {czk(total)} proběhla. Tvé členství <span className="text-accent">{plan.name}</span> je aktivní.
                Potvrzení jsme poslali na {form.email || 'tvůj e-mail'}.
              </p>
              <button
                onClick={() => completePurchase({ email: form.email || 'clen@flipujkaru.cz', plan })}
                className="mt-6 w-full rounded-xl bg-accent py-3.5 font-semibold text-ink-950 shadow-glow transition hover:brightness-110"
              >
                Přejít do administrace →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Vstupní pole s popiskem */
function Field({ label, icon: Icon, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>
      <div className="relative">
        <input
          {...props}
          className={`w-full rounded-xl border border-white/10 bg-ink-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20 ${Icon ? 'pr-10' : ''}`}
        />
        {Icon && <Icon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />}
      </div>
    </label>
  );
}
