import { useEffect, useRef, useState } from 'react';
import {
  GraduationCap, Check, Lock, ChevronLeft, ChevronRight, ArrowLeft, Clock, Loader2, ListChecks,
  Lightbulb, AlertTriangle, Info, Users, Trophy, RotateCcw, BookOpen,
} from 'lucide-react';
import { useApp } from '../../AppContext.jsx';
import { coursesApi } from '../../lib/coursesApi.js';
import CourseRow from './CourseRow.jsx';

/** Mé materiály — kurzy Akademie s pokrokem uloženým per-uživatel. */
export default function Courses({ courseId, setCourseId }) {
  const { member, isAdmin, backToSite } = useApp();
  const hasAccess = Boolean(member) || isAdmin;
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState('');

  const load = () => coursesApi.list().then((c) => { setCourses(c); setError(''); }).catch(() => setError('Kurzy se nepodařilo načíst.'));
  useEffect(() => { load(); }, []);

  // Pokrok mění CourseView — promítneme ho rovnou do seznamu (bez refetch)
  const updateDone = (id, lessonId, done) => setCourses((list) => list.map((c) => {
    if (c.id !== id) return c;
    const next = new Set(c.done);
    if (done) next.add(lessonId); else next.delete(lessonId);
    return { ...c, done: next };
  }));

  const goPricing = () => { backToSite(); setTimeout(() => document.getElementById('cenik')?.scrollIntoView({ behavior: 'smooth' }), 100); };

  if (error) return <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</p>;
  if (!courses) return <div className="flex items-center gap-2 text-sm text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" /> Načítám kurzy…</div>;

  const open = courseId && hasAccess ? courses.find((c) => c.id === courseId) : null;
  if (open) return <CourseView key={open.id} course={open} onBack={() => setCourseId(null)} onDone={updateDone} />;

  const totalLessons = courses.reduce((s, c) => s + c.outline.length, 0);
  const totalDone = courses.reduce((s, c) => s + c.done.size, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white"><GraduationCap className="h-5 w-5 text-accent" /> Mé materiály</h1>
          <p className="mt-1 text-sm text-zinc-400">FlipujKáru Akademie — {courses.length} kurzů, {totalLessons} lekcí. Tvůj pokrok se ukládá k účtu.</p>
        </div>
        {hasAccess && totalLessons > 0 && (
          <span className="rounded-lg border border-white/10 bg-ink-850 px-3 py-1.5 text-xs font-medium text-zinc-300">
            Celkem hotovo <span className="font-bold text-accent">{totalDone}/{totalLessons}</span>
          </span>
        )}
      </div>

      {!hasAccess && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/25 bg-accent-soft p-5">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <div className="font-display font-bold text-white">Kurzy jsou součástí členství</div>
              <div className="text-sm text-zinc-400">Osnovu vidíš už teď — lekce se odemknou po aktivaci členství AKADEMIE.</div>
            </div>
          </div>
          <button onClick={goPricing} className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-ink-950 shadow-glow transition hover:brightness-110">Aktivovat členství</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {courses.map((c, i) => {
          const total = c.outline.length;
          const done = c.done.size;
          const minutes = c.outline.reduce((s, l) => s + (l.minutes || 0), 0);
          return (
            <div key={c.id} className="flex flex-col rounded-2xl border border-white/10 bg-ink-850 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Kurz {i + 1} z {courses.length}</div>
              <h3 className="mt-1 font-display text-lg font-bold text-white">{c.title}</h3>
              <p className="mt-1 text-sm text-zinc-400">{c.subtitle}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {total} lekcí</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~{minutes} min</span>
              </div>
              <div className="mt-4 flex-1">
                <CourseRow c={{ title: 'Pokrok', lessons: total, done }} />
              </div>
              {hasAccess ? (
                <button onClick={() => setCourseId(c.id)} className={`mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition ${done > 0 && done < total ? 'bg-accent text-ink-950 hover:brightness-110' : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'}`}>
                  {done === 0 ? 'Začít kurz' : done >= total ? 'Zopakovat' : 'Pokračovat'}
                </button>
              ) : (
                <button onClick={goPricing} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-ink-950 py-2.5 text-sm font-semibold text-zinc-400 transition hover:text-white">
                  <Lock className="h-4 w-4" /> Odemknout s členstvím
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Detail kurzu: osnova + čtečka lekcí ---------- */
function CourseView({ course, onBack, onDone }) {
  const [lessons, setLessons] = useState(null);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const topRef = useRef(null);
  const done = course.done;

  useEffect(() => {
    coursesApi.lessons(course.id)
      .then((list) => {
        if (list.length === 0) { setError('Obsah kurzu není dostupný. Zkontroluj, že máš aktivní členství.'); return; }
        setLessons(list);
        // Pokračuj první nedokončenou lekcí (u hotového kurzu od začátku)
        const firstOpen = list.findIndex((l) => !done.has(l.id));
        setIndex(firstOpen === -1 ? 0 : firstOpen);
      })
      .catch(() => setError('Lekce se nepodařilo načíst.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id]);

  const goTo = (i) => {
    setIndex(i);
    setTocOpen(false);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggle = async (lessonId, value) => {
    setSaving(true);
    onDone(course.id, lessonId, value); // optimisticky
    try {
      await coursesApi.setDone(course.id, lessonId, value);
      setError('');
      return true;
    } catch {
      onDone(course.id, lessonId, !value);
      setError('Pokrok se nepodařilo uložit. Zkus to prosím znovu.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const completeAndNext = async () => {
    const ok = done.has(lesson.id) || await toggle(lesson.id, true);
    if (ok && index < lessons.length - 1) goTo(index + 1);
  };

  if (!lessons) {
    return (
      <div className="space-y-4">
        <BackButton onBack={onBack} />
        {error
          ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</p>
          : <div className="flex items-center gap-2 text-sm text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" /> Načítám lekce…</div>}
      </div>
    );
  }

  const lesson = lessons[index];
  const isLast = index === lessons.length - 1;
  const lessonDone = done.has(lesson.id);
  const courseDone = lessons.every((l) => done.has(l.id));

  const toc = (
    <ol className="space-y-1">
      {lessons.map((l, i) => {
        const active = i === index;
        const isDone = done.has(l.id);
        return (
          <li key={l.id}>
            <button
              onClick={() => goTo(i)}
              className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition ${active ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
            >
              <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${isDone ? 'bg-accent text-ink-950' : active ? 'border border-accent text-accent' : 'border border-white/15 text-zinc-500'}`}>
                {isDone ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">{l.title}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div ref={topRef} className="scroll-mt-24 space-y-5">
      <BackButton onBack={onBack} />

      <div className="rounded-2xl border border-white/10 bg-ink-850 p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">FlipujKáru Akademie</div>
        <h1 className="mt-1 font-display text-2xl font-bold text-white">{course.title}</h1>
        <p className="mt-1 text-sm text-zinc-400">{course.subtitle}</p>
        <div className="mt-4"><CourseRow c={{ title: courseDone ? 'Kurz dokončen' : 'Tvůj pokrok', lessons: lessons.length, done: lessons.filter((l) => done.has(l.id)).length }} /></div>
      </div>

      {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Osnova — na mobilu sbalitelná */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-white/10 bg-ink-850 p-3">
            <button onClick={() => setTocOpen((o) => !o)} className="flex w-full items-center justify-between px-2 py-1 text-sm font-semibold text-white lg:pointer-events-none">
              <span className="inline-flex items-center gap-2"><ListChecks className="h-4 w-4 text-accent" /> Obsah kurzu</span>
              <ChevronRight className={`h-4 w-4 text-zinc-500 transition lg:hidden ${tocOpen ? 'rotate-90' : ''}`} />
            </button>
            <div className={`mt-2 ${tocOpen ? 'block' : 'hidden'} lg:block`}>{toc}</div>
          </div>
        </aside>

        {/* Lekce */}
        <article className="min-w-0 rounded-2xl border border-white/10 bg-ink-850 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
            <span className="font-semibold uppercase tracking-wide">Lekce {index + 1} z {lessons.length}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~{lesson.minutes} min</span>
            {lessonDone && <span className="inline-flex items-center gap-1 font-semibold text-accent"><Check className="h-3.5 w-3.5" /> Hotovo</span>}
          </div>
          <h2 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">{lesson.title}</h2>

          <div className="mt-5 space-y-4">
            {lesson.content.map((b, i) => <Block key={i} b={b} />)}
          </div>

          {isLast && courseDone && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4">
              <Trophy className="h-6 w-6 shrink-0 text-accent" />
              <div>
                <div className="font-display font-bold text-white">Kurz dokončen 🎉</div>
                <div className="text-sm text-zinc-400">Skvělá práce. Pokračuj dalším kurzem v Mých materiálech.</div>
              </div>
            </div>
          )}

          {/* Navigace */}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <button
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" /> Předchozí
            </button>
            <div className="flex flex-wrap items-center gap-3">
              {lessonDone && (
                <button onClick={() => toggle(lesson.id, false)} disabled={saving} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition hover:text-white disabled:opacity-50">
                  <RotateCcw className="h-3.5 w-3.5" /> Označit jako nedokončenou
                </button>
              )}
              {isLast && lessonDone ? (
                <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                  Zpět na kurzy
                </button>
              ) : (
                <button onClick={completeAndNext} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:brightness-110 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {isLast ? 'Dokončit kurz' : lessonDone ? 'Další lekce' : 'Hotovo, další lekce'}
                  {!isLast && <ChevronRight className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function BackButton({ onBack }) {
  return (
    <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition hover:text-white">
      <ArrowLeft className="h-4 w-4" /> Všechny kurzy
    </button>
  );
}

/* ---------- Bloky obsahu lekce (formát viz data/courses/courses.js) ---------- */
const CALLOUT = {
  info: { icon: Info, cls: 'border-accent/30 bg-accent-soft', label: 'text-accent' },
  tip: { icon: Lightbulb, cls: 'border-sky-400/25 bg-sky-400/10', label: 'text-sky-300' },
  warn: { icon: AlertTriangle, cls: 'border-amber-400/30 bg-amber-400/10', label: 'text-amber-300' },
};

function Block({ b }) {
  switch (b.t) {
    case 'p':
      return <p className="leading-relaxed text-zinc-300">{b.text}</p>;
    case 'h':
      return <h3 className="pt-2 font-display text-lg font-bold text-white">{b.text}</h3>;
    case 'list':
      return (
        <ul className="space-y-2.5">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-3 leading-relaxed text-zinc-300">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{it.title && <strong className="font-semibold text-white">{it.title}: </strong>}{it.text}</span>
            </li>
          ))}
        </ul>
      );
    case 'callout': {
      const s = CALLOUT[b.tone] || CALLOUT.info;
      return (
        <div className={`rounded-xl border p-4 ${s.cls}`}>
          <div className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${s.label}`}><s.icon className="h-4 w-4" /> {b.label}</div>
          <p className="mt-1.5 leading-relaxed text-white">{b.text}</p>
        </div>
      );
    }
    case 'table':
      return (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="bg-ink-950 text-left text-xs uppercase tracking-wide text-zinc-500">
                {b.head.map((c, i) => <th key={i} className="px-4 py-2.5 font-medium">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => {
                const total = String(r[0]).startsWith('=');
                return (
                  <tr key={i} className={`border-t border-white/5 ${total ? 'bg-white/[0.03]' : ''}`}>
                    {r.map((c, j) => <td key={j} className={`px-4 py-2.5 align-top ${j === 0 ? `font-medium ${total ? 'text-accent' : 'text-white'}` : 'text-zinc-400'}`}>{c}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    case 'takeaways':
      return (
        <div className="rounded-xl border border-accent/30 bg-accent-soft p-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-accent"><ListChecks className="h-4 w-4" /> Co si z kurzu odnést</div>
          <ul className="mt-3 space-y-2">
            {b.items.map((t, i) => (
              <li key={i} className="flex gap-2.5 leading-relaxed text-white"><Check className="mt-1 h-4 w-4 shrink-0 text-accent" /> {t}</li>
            ))}
          </ul>
        </div>
      );
    case 'next':
      return (
        <div className="rounded-xl border border-white/10 bg-ink-950 p-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-zinc-400"><Users className="h-4 w-4 text-accent" /> Další krok v komunitě</div>
          <p className="mt-1.5 leading-relaxed text-zinc-300">{b.text}</p>
        </div>
      );
    case 'note':
      return <p className="text-xs italic leading-relaxed text-zinc-500">{b.text}</p>;
    default:
      return null;
  }
}
