import { useState } from 'react';
import { Instagram, Youtube, Facebook, Music2, Heart, Mail, Phone, ShieldCheck } from 'lucide-react';
import { LogoMark } from './Logo.jsx';
import { COMPANY, PAYMENTS } from '../data/content.js';
import Reveal from './Reveal.jsx';

/** Sloupce odkazů v patičce */
const COLUMNS = [
  { title: 'Bazar', links: [['Všechna auta', '#marketplace'], ['Sportovní', '#marketplace'], ['Investiční kusy', '#marketplace'], ['Vykoupíme tvé auto', '#']] },
  { title: 'Akademie', links: [['Členství', '#cenik'], ['Kalkulačka zisku', '#kalkulacka'], ['Jak to funguje', '#edukace'], ['FAQ', '#faq']] },
  { title: 'Společnost', links: [['O nás', '#mise'], ['Kontakt', '#footer'], ['Obchodní podmínky', '/obchodni-podminky'], ['Zásady cookies', '/cookies'], ['Ochrana údajů (GDPR)', '/gdpr']] },
];

const SOCIALS = [
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Youtube, label: 'YouTube' },
  { Icon: Facebook, label: 'Facebook' },
  { Icon: Music2, label: 'TikTok' },
];

/** Formulář newsletteru s potvrzením */
function Newsletter() {
  const [sent, setSent] = useState(false);
  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    e.target.reset();
    setTimeout(() => setSent(false), 2500);
  };
  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md gap-3">
      <input
        type="email"
        required
        placeholder="tvuj@email.cz"
        className="flex-1 rounded-xl border border-white/10 bg-ink-950 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
      />
      <button
        type="submit"
        className={`whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold text-ink-950 shadow-glow transition hover:brightness-110 ${
          sent ? 'bg-white' : 'bg-accent'
        }`}
      >
        {sent ? 'Přihlášeno ✓' : 'Odebírat'}
      </button>
    </form>
  );
}

export default function Footer() {
  return (
    <footer id="footer" className="border-t border-white/5 bg-ink-900">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Newsletter blok */}
        <Reveal className="flex flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-ink-850 p-8 shadow-soft lg:flex-row lg:items-center md:p-10">
          <div className="max-w-md">
            <h3 className="font-display text-2xl font-bold text-white">Nezmeškej nové kusy a tipy</h3>
            <p className="mt-2 text-zinc-400">Jednou týdně to nejlepší z bazaru a flipping světa. Žádný spam.</p>
          </div>
          <Newsletter />
        </Reveal>

        {/* Odkazy */}
        <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <a href="#hero" className="flex items-center gap-2.5">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-ink-850 border border-white/10">
                <LogoMark />
              </span>
              <span className="font-display text-xl font-bold text-white">
                Flipuj<span className="text-accent">Káru</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm text-zinc-500">
              Bazar prověřených aut &amp; vzdělávací platforma pro chytrý car flipping.
            </p>
            {/* Kontakt */}
            <div className="mt-5 space-y-2 text-sm">
              <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-2 text-zinc-300 transition hover:text-accent">
                <Mail className="h-4 w-4 text-accent" /> {COMPANY.email}
              </a>
              <a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-zinc-300 transition hover:text-accent">
                <Phone className="h-4 w-4 text-accent" /> {COMPANY.phone}
              </a>
            </div>
            <div className="mt-5 flex gap-3">
              {SOCIALS.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid place-items-center w-10 h-10 rounded-xl border border-white/10 text-zinc-400 transition hover:border-accent/40 hover:text-accent"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="transition hover:text-accent">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Firemní / právní údaje + platební metody */}
        <div className="mt-12 grid grid-cols-1 gap-6 border-t border-white/5 pt-8 md:grid-cols-2">
          <div className="text-sm text-zinc-500">
            <p className="flex items-center gap-1.5 font-medium text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-accent" /> Ověřený prodejce
            </p>
            <p className="mt-2 leading-relaxed">
              {COMPANY.name} · IČO {COMPANY.ico} · DIČ {COMPANY.dic}
              <br />
              {COMPANY.address}
              <br />
              {COMPANY.registry}
            </p>
          </div>
          {/* Platební metody */}
          <div className="md:text-right">
            <p className="text-sm font-medium text-zinc-300">Bezpečné platby</p>
            <div className="mt-3 flex flex-wrap gap-2 md:justify-end">
              {PAYMENTS.map((p) => (
                <span key={p} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Spodní lišta */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-sm text-zinc-500 sm:flex-row">
          <p>© 2026 {COMPANY.name} — Všechna práva vyhrazena.</p>
          <p className="flex items-center gap-1.5">
            Vyrobeno s <Heart className="w-4 h-4 text-accent" /> v Česku
          </p>
        </div>
      </div>
    </footer>
  );
}
