import { createClient } from '@supabase/supabase-js';
import { json } from '../_utils.js';

/**
 * Cloudflare Pages Function: přihlášení k odběru novinek (sekce Kontakt).
 * Zapisuje do newsletter_subscribers přes service role — z prohlížeče to nejde.
 * Ochrana proti spamu: honeypot „website" + max. 10 přihlášení / IP / 24 h
 * (KV CALC_USAGE, IP jen jako solený hash). Odpověď neprozradí, jestli
 * e-mail už v seznamu byl.
 */
const DAILY_LIMIT = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function hashIp(ip, salt) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${ip}:${salt}`));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Formulář se nepodařilo přečíst. Zkus to prosím znovu.' }, 400);
  }

  // Robot vyplnil skryté pole → tvaříme se, že vše prošlo.
  if (String(body?.website || '').trim()) return json({ ok: true });

  const email = String(body?.email || '').trim().toLowerCase();
  if (email.length > 200 || !EMAIL_RE.test(email)) {
    return json({ error: 'Zadej prosím platný e-mail.', field: 'email' }, 400);
  }

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const rlKey = `newsletter:${await hashIp(ip, env.CALC_IP_SALT || 'salt')}`;
  const used = parseInt((await env.CALC_USAGE?.get(rlKey)) || '0', 10) || 0;
  if (used >= DAILY_LIMIT) {
    return json({ error: 'Z tohoto připojení už dnes přišlo hodně přihlášení. Zkus to prosím zítra.' }, 429);
  }

  try {
    const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await admin
      .from('newsletter_subscribers')
      .upsert({ email, source: 'web' }, { onConflict: 'email', ignoreDuplicates: true });
    if (error) throw error;
    await env.CALC_USAGE?.put(rlKey, String(used + 1), { expirationTtl: 24 * 3600 });
    return json({ ok: true });
  } catch (err) {
    console.error('newsletter error:', err);
    return json({ error: 'Přihlášení se teď nepovedlo, zkus to prosím za chvíli.' }, 500);
  }
}
