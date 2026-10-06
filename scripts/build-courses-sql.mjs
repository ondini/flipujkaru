// Vygeneruje supabase/courses_seed.sql z data/courses/courses.js.
// Použití: node scripts/build-courses-sql.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { COURSES } from '../data/courses/courses.js';

const WORDS_PER_MINUTE = 180;

// Řetězec jako SQL literál ($fk$…$fk$ — obsah nemusí escapovat apostrofy)
const lit = (s) => {
  if (String(s).includes('$fk$')) throw new Error('Obsah nesmí obsahovat $fk$');
  return `$fk$${s}$fk$`;
};

const blockText = (b) => [b.text, b.label, ...(b.items || []).flatMap((i) => (typeof i === 'string' ? i : [i.title, i.text])), ...(b.head || []), ...(b.rows || []).flat()]
  .filter(Boolean).join(' ');
const minutesOf = (content) => {
  const words = content.map(blockText).join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

const seen = new Set();
const out = [
  '-- ============================================================',
  '--  FlipujKáru — obsah kurzů Akademie (VYGENEROVÁNO, needitovat ručně)',
  '--  Zdroj: data/courses/courses.js → node scripts/build-courses-sql.mjs',
  '--  Nejdřív musí být puštěné supabase/courses.sql. Bezpečné pustit opakovaně.',
  '-- ============================================================',
  '',
  'begin;',
  '',
];

COURSES.forEach((course, ci) => {
  if (seen.has(course.id)) throw new Error(`Duplicitní ID kurzu: ${course.id}`);
  seen.add(course.id);
  const lessonIds = new Set();
  const lessons = course.lessons.map((l, li) => {
    if (lessonIds.has(l.id)) throw new Error(`Duplicitní ID lekce: ${course.id}/${l.id}`);
    lessonIds.add(l.id);
    return { ...l, sort: li + 1, minutes: minutesOf(l.content) };
  });
  const outline = lessons.map(({ id, title, minutes }) => ({ id, title, minutes }));

  out.push(`-- ${ci + 1}. ${course.title}`);
  out.push(
    'insert into public.courses (id, sort, title, subtitle, outline, updated_at) values',
    `  (${lit(course.id)}, ${ci + 1}, ${lit(course.title)}, ${lit(course.subtitle)}, ${lit(JSON.stringify(outline))}::jsonb, now())`,
    'on conflict (id) do update set sort = excluded.sort, title = excluded.title, subtitle = excluded.subtitle, outline = excluded.outline, updated_at = now();',
    '',
  );
  out.push(
    'insert into public.course_lessons (course_id, id, sort, title, minutes, content) values',
    lessons.map((l) => `  (${lit(course.id)}, ${lit(l.id)}, ${l.sort}, ${lit(l.title)}, ${l.minutes}, ${lit(JSON.stringify(l.content))}::jsonb)`).join(',\n'),
    'on conflict (course_id, id) do update set sort = excluded.sort, title = excluded.title, minutes = excluded.minutes, content = excluded.content;',
    '',
  );
  // Lekce, které ze zdroje zmizely, smaž (smaže i navázaný pokrok)
  out.push(
    `delete from public.course_lessons where course_id = ${lit(course.id)} and id not in (${[...lessonIds].map(lit).join(', ')});`,
    '',
  );
});

out.push(`delete from public.courses where id not in (${[...seen].map(lit).join(', ')});`, '', 'commit;', '');

const target = fileURLToPath(new URL('../supabase/courses_seed.sql', import.meta.url));
writeFileSync(target, out.join('\n'));
console.log(`Zapsáno ${target} (${COURSES.length} kurzů, ${COURSES.reduce((s, c) => s + c.lessons.length, 0)} lekcí)`);
