import { useState } from 'react';
import { Plus } from 'lucide-react';
import { FAQ } from '../data/content.js';
import { useApp } from '../AppContext.jsx';
import Reveal from './Reveal.jsx';

/** Jedna položka akordeonu s plynulým rozbalením (grid-rows trik) */
function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border bg-ink-850 transition ${open ? 'border-accent/40' : 'border-white/10'}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <span className="font-medium text-white">{item.q}</span>
        <Plus className={`w-5 h-5 shrink-0 text-accent transition-transform ${open ? 'rotate-45' : ''}`} />
      </button>
      <div className="grid transition-all duration-300" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-zinc-400">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const { siteText: t } = useApp();
  return (
    <section id="faq" className="relative border-t border-white/5 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t.faq_eyebrow || 'Časté dotazy'}</span>
          <h3 className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight text-white">{t.faq_title || 'Než se zeptáš'}</h3>
        </Reveal>

        <div className="mt-12 space-y-3">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 40}>
              <FaqItem item={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
