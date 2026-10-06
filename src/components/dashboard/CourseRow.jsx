import { Check } from 'lucide-react';

/** Řádek s progress barem (používá i Přehled). */
export default function CourseRow({ c }) {
  const pct = c.lessons ? Math.round((c.done / c.lessons) * 100) : 0;
  const done = c.lessons > 0 && c.done >= c.lessons;
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-white">
          {done && <Check className="h-4 w-4 shrink-0 text-accent" />} <span className="truncate">{c.title}</span>
        </span>
        <span className="shrink-0 text-xs text-zinc-500">{c.done}/{c.lessons}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-700">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
