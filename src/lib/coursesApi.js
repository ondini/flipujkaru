import { supabase } from './supabase.js';

/* ============================================================
   Kurzy Akademie („Mé materiály") — Supabase (supabase/courses.sql).
   Osnovu kurzů vidí každý přihlášený, obsah lekcí jen členové
   (RLS has_course_access), pokrok je per-uživatel (course_progress).
============================================================ */

/** Kurzy s osnovou + množina dokončených lekcí přihlášeného uživatele. */
async function list() {
  const [courses, progress] = await Promise.all([
    supabase.from('courses').select('id, title, subtitle, outline').order('sort'),
    supabase.from('course_progress').select('course_id, lesson_id'),
  ]);
  if (courses.error) throw courses.error;
  if (progress.error) throw progress.error;
  return (courses.data || []).map((c) => ({
    ...c,
    done: new Set((progress.data || []).filter((p) => p.course_id === c.id).map((p) => p.lesson_id)),
  }));
}

/** Lekce kurzu včetně obsahu (prázdné pole = nečlen, RLS obsah nevydá). */
async function lessons(courseId) {
  const { data, error } = await supabase
    .from('course_lessons')
    .select('id, title, minutes, content')
    .eq('course_id', courseId)
    .order('sort');
  if (error) throw error;
  return data || [];
}

/** Označí lekci jako dokončenou / nedokončenou. */
async function setDone(courseId, lessonId, done) {
  const { error } = done
    ? await supabase.from('course_progress').upsert({ course_id: courseId, lesson_id: lessonId }, { onConflict: 'user_id,course_id,lesson_id', ignoreDuplicates: true })
    : await supabase.from('course_progress').delete().eq('course_id', courseId).eq('lesson_id', lessonId);
  if (error) throw error;
}

export const coursesApi = { list, lessons, setDone };
