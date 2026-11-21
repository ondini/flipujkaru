import { Heart, Mail, Phone, ShieldCheck } from 'lucide-react';
import { LogoMark } from './Logo.jsx';
import { COMPANY, PAYMENTS } from '../data/content.js';

/** Sloupce odkazů v patičce */
const COLUMNS = [
  { title: 'Bazar', links: [['Auta na prodej', '/bazar'], ['Naše flipy', '/nase-flipy'], ['Prodáme ti auto', '/prodej-auta'], ['Nacenit auto', '/prodej-auta/formular']] },
  { title: 'Akademie', links: [['O akademii', '/akademie'], ['Členství', '/cenik'], ['Osobní servis', '/cenik#osobni-servis'], ['Kalkulačka zisku', '/kalkulacka'], ['Časté dotazy', '/cenik#faq']] },
  { title: 'Společnost', links: [['O nás', '/akademie#mise'], ['Kontakt', '/#kontakt'], ['Obchodní podmínky', '/obchodni-podminky'], ['Zásady cookies', '/cookies'], ['Ochrana údajů (GDPR)', '/gdpr']] },
];

export default function Footer() {
  return (
    <footer id="footer" className="border-t border-white/5 bg-ink-900">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Odkazy */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2.5">
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
