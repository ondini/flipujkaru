import { ArrowLeft } from 'lucide-react';
import { LogoMark } from './Logo.jsx';

/** Jeden blok obsahu — odstavec, odrážky, číslovaný seznam nebo tabulka. */
function Block({ block }) {
  if (block.p) return <p className="leading-relaxed text-zinc-400">{block.p}</p>;
  if (block.ul) {
    return (
      <ul className="list-disc space-y-1.5 pl-5 text-zinc-400">
        {block.ul.map((li, i) => <li key={i} className="leading-relaxed">{li}</li>)}
      </ul>
    );
  }
  if (block.ol) {
    return (
      <ol className="list-decimal space-y-1.5 pl-5 text-zinc-400">
        {block.ol.map((li, i) => <li key={i} className="leading-relaxed">{li}</li>)}
      </ol>
    );
  }
  if (block.table) {
    return (
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-ink-850">
              {block.table.headers.map((h) => (
                <th key={h} className="border-b border-white/10 px-4 py-2.5 font-semibold text-white">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.table.rows.map((row, i) => (
              <tr key={i} className={i > 0 ? 'border-t border-white/5' : ''}>
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2.5 align-top text-zinc-400">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
}

/** Právní stránka (obchodní podmínky / cookies / GDPR) — vlastní URL, odkaz z patičky. */
export default function LegalPage({ page }) {
  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-ink-850"><LogoMark className="h-6 w-6" /></span>
            <span className="font-display text-lg font-bold text-white">Flipuj<span className="text-accent">Káru</span></span>
          </a>
          <a href="/" className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Zpět na web
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white">{page.title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{page.updated}</p>

        <div className="mt-10 space-y-10">
          {page.sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-lg font-bold text-accent">{s.title}</h2>
              <div className="mt-3 space-y-3 text-sm">
                {s.blocks.map((b, i) => <Block key={i} block={b} />)}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 border-t border-white/5 pt-6 text-xs text-zinc-500">{page.footer}</div>
      </main>
    </div>
  );
}
