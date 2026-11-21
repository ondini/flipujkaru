import { useState } from 'react';
import {
  Check, Sparkles, ArrowRight, BadgeCheck, Layers, Users, Coins, ShieldCheck, Car, Radar, BellRing,
  DollarSign, ShoppingCart, TrendingUp, Mail, Loader2,
} from 'lucide-react';
import { useApp } from '../AppContext.jsx';
import { COMPANY } from '../data/content.js';
import { homeText, LEARN_ITEMS, GROUP_REASONS, MEMBER_PERKS } from '../data/landing.js';
import Reveal from './Reveal.jsx';
import AlgoFeed from './AlgoFeed.jsx';

/* ============================================================
   Sekce nové úvodní stránky (pod Hero). Texty: data/landing.js
   + administrace (Texty webu → Úvodní stránka).
============================================================ */

const ICONS = { BadgeCheck, Layers, Users, Coins, ShieldCheck, Car, Radar, BellRing };

const useHomeText = () => {
  const { siteText } = useApp();
  return (k) => homeText(siteText, k);
};

/** Nadpis sekce ve stylu webu (nadtitulek + h3 + podnadpis). */
function SectionHead({ eyebrow, title, subtitle, children, center = true }) {
  return (
    <Reveal className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow && <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</span>}
      <h3 className="mt-3 font-display text-3xl font-bold tracking-tight text-white md:text-5xl">{title}</h3>
      {subtitle && <p className="mt-4 leading-relaxed text-zinc-400">{subtitle}</p>}
      {children}
    </Reveal>
  );
}

/** Co u nás dostaneš */
export function HomeGets() {
  const t = useHomeText();
  return (
    <section id="co-dostanes" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead title={t('home_gets_title')}>
          <p className="mt-5 text-lg leading-relaxed text-zinc-300">{t('home_gets_text')}</p>
          <p className="mt-5 font-display text-lg font-bold text-accent">{t('home_gets_accent')}</p>
        </SectionHead>
      </div>
    </section>
  );
}

/** Co se v komunitě naučíš — 12 karet */
export function HomeLearn() {
  const t = useHomeText();
  return (
    <section id="co-se-naucis" className="relative border-y border-white/5 bg-ink-900/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead title={t('home_learn_title')} subtitle={t('home_learn_subtitle')} />
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LEARN_ITEMS.map((it, i) => (
            <Reveal key={it.title} delay={(i % 4) * 50}>
              <div className="h-full rounded-2xl border border-white/10 bg-ink-850 p-5 transition hover:border-accent/40">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-accent">
                  <Check className="h-4 w-4" />
                </span>
                <h4 className="mt-4 font-display font-bold text-white">{it.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{it.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Proč zrovna naše skupina — 4 karty + live feed algoritmu */
export function HomeGroup() {
  const t = useHomeText();
  return (
    <section id="proc-my" className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute left-1/2 top-20 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent/5 blur-[150px]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-4 py-2 text-xs font-bold uppercase tracking-wide text-accent">
            <Sparkles className="h-4 w-4" /> {t('home_group_badge')}
          </div>
          <h3 className="mt-5 font-display text-3xl font-bold tracking-tight text-white md:text-5xl">{t('home_group_title')}</h3>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {GROUP_REASONS.map((r, i) => {
              const Icon = ICONS[r.icon];
              return (
                <Reveal key={r.title} delay={i * 60}>
                  <div className="h-full rounded-2xl border border-white/10 bg-ink-850 p-6 transition hover:border-accent/40">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent"><Icon className="h-5 w-5" /></div>
                    <h4 className="mt-4 font-display font-bold text-white">{r.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{r.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={120} className="rounded-3xl border border-accent/25 bg-ink-850 p-4 shadow-glow md:p-6">
            <AlgoFeed />
            <p className="mt-4 inline-flex items-center gap-2 px-1 text-sm font-semibold text-accent">
              <Sparkles className="h-4 w-4 shrink-0" /> Každý týden nový seznam aut pod tržní cenou napříč Evropou
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Členství komunity — srovnání s Netflixem, provize, výhody, CTA */
export function HomeMembership() {
  const t = useHomeText();
  const { startDefaultCheckout } = useApp();
  return (
    <section id="clenstvi" className="relative scroll-mt-16 border-y border-white/5 bg-ink-900/40 py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink-950">{t('home_member_eyebrow')}</span>
          <h3 className="mt-5 max-w-3xl font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t('home_member_title')} <span className="text-grad">{t('home_member_title_accent')}</span>.
          </h3>
          <p className="mt-4 max-w-2xl leading-relaxed text-zinc-400">{t('home_member_subtitle')}</p>
        </Reveal>

        {/* Netflix vs FlipujKáru */}
        <Reveal delay={60} className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-ink-850 p-6 text-center">
            <div className="font-display text-3xl font-bold text-zinc-300">{t('home_member_netflix_price')}</div>
            <div className="mt-1 text-sm font-semibold text-zinc-400">{t('home_member_netflix_label')}</div>
            <div className="mt-1 text-sm text-zinc-500">{t('home_member_netflix_text')}</div>
          </div>
          <div className="rounded-2xl border border-accent/50 bg-accent-soft p-6 text-center shadow-glow">
            <div className="font-display text-3xl font-bold text-accent">{t('home_member_our_price')}</div>
            <div className="mt-1 text-sm font-semibold text-white">{t('home_member_our_label')}</div>
            <div className="mt-1 text-sm text-zinc-300">{t('home_member_our_text')}</div>
          </div>
        </Reveal>
        <p className="mx-auto mt-5 max-w-xl text-center text-sm text-zinc-500">{t('home_member_compare_note')}</p>

        {/* Provize za doporučení */}
        <Reveal delay={60} className="mt-10 flex gap-4 rounded-2xl border border-accent/40 bg-ink-850 p-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-ink-950"><DollarSign className="h-5 w-5" /></span>
          <div>
            <h4 className="font-display font-bold text-white">{t('home_member_referral_title')}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{t('home_member_referral_text')}</p>
          </div>
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBER_PERKS.map((p, i) => {
            const Icon = ICONS[p.icon];
            return (
              <Reveal key={p.title} delay={i * 50}>
                <div className="h-full rounded-2xl border border-white/10 bg-ink-850 p-5">
                  <Icon className="h-5 w-5 text-accent" />
                  <h4 className="mt-3 font-display text-sm font-bold text-white">{p.title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{p.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={startDefaultCheckout}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-7 py-4 font-semibold text-ink-950 transition animate-glow hover:scale-[1.02] hover:brightness-110 active:scale-95"
          >
            {t('home_member_cta')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </button>
          <p className="mt-3 text-xs text-zinc-500">
            {t('home_member_cta_note')} · <a href="/cenik" className="underline decoration-white/20 underline-offset-2 hover:text-accent">další varianty a časté dotazy</a>
          </p>
        </div>
      </div>
    </section>
  );
}

/** Tohle jsme sami naflipovali — rozcestník do bazaru */
export function HomeFlips() {
  const t = useHomeText();
  return (
    <section id="nase-auta" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-ink-850 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-xl">
            <h3 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">{t('home_flips_title')}</h3>
            <p className="mt-3 text-zinc-400">{t('home_flips_subtitle')}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <a href="/bazar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-ink-950 shadow-glow transition hover:brightness-110">
              <ShoppingCart className="h-4 w-4" /> Koupit auto od nás
            </a>
            <a href="/nase-flipy" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/5">
              <TrendingUp className="h-4 w-4" /> Ukázky úspěšných flipů
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Odběr novinek — ukládá e-mail přes /api/newsletter */
function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setState('sending');
    setError('');
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website: fd.get('website') || '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Přihlášení se nepovedlo, zkus to prosím znovu.');
      setState('done');
      setEmail('');
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <p className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm font-semibold text-accent">
        <Check className="h-4 w-4" /> Hotovo, jsi přihlášený k odběru.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <div className="flex gap-3">
        <label className="sr-only" htmlFor="newsletter-email">E-mail</label>
        <input
          id="newsletter-email"
          type="email"
          required
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tvuj@email.cz"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-ink-950 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
        />
        {/* Past na roboty — člověk pole nevidí */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-ink-950 shadow-glow transition hover:brightness-110 disabled:opacity-60"
        >
          {state === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />} Odebírat
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <p className="mt-2 text-xs text-zinc-500">
        Odesláním souhlasíš se zasíláním novinek. Odhlásit se můžeš kdykoli. <a href="/gdpr" className="underline decoration-white/20 underline-offset-2 hover:text-accent">Ochrana údajů</a>
      </p>
    </form>
  );
}

/** Kontakt — newsletter + e-mail */
export function HomeContact() {
  const t = useHomeText();
  return (
    <section id="kontakt" className="relative scroll-mt-16 pb-20 md:pb-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="grid grid-cols-1 gap-8 rounded-3xl border border-white/10 bg-ink-850 p-8 shadow-soft md:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Kontakt</span>
            <h3 className="mt-3 font-display text-2xl font-bold text-white md:text-3xl">{t('home_contact_title')}</h3>
            <p className="mt-2 text-zinc-400">{t('home_contact_text')}</p>
            <p className="mt-5 text-sm text-zinc-400">Máš dotaz? Napiš nám, odpovídají reální lidé:</p>
            <a href={`mailto:${COMPANY.email}`} className="mt-2 inline-flex items-center gap-2 font-semibold text-white transition hover:text-accent">
              <Mail className="h-4 w-4 text-accent" /> {COMPANY.email}
            </a>
          </div>
          <div className="lg:justify-self-end">
            <Newsletter />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
