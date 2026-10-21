import { createClient } from '@supabase/supabase-js';
import { json } from '../_utils.js';

/**
 * Cloudflare Pages Function: Telegram bot sem nahlásí, že člen vstoupil do skupiny.
 * Volá ho jen bot — ověření sdíleným tajemstvím v hlavičce X-Telegram-Link-Secret
 * (env TELEGRAM_LINK_SECRET). Tělo: { session_id, telegram_user_id, telegram_username? }.
 * Zápis je idempotentní (upsert), opakované volání nevadí.
 */

/** Porovnání tajemství v konstantním čase (bez úniku délky shody přes timing). */
function safeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function onRequestPost({ request, env }) {
  if (!safeEqual(request.headers.get('x-telegram-link-secret') || '', env.TELEGRAM_LINK_SECRET || '')) {
    return json({ error: 'Neautorizováno.' }, 401);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Neplatné JSON tělo.' }, 400); }
  const { session_id: sessionId, telegram_user_id: tgUserId, telegram_username: tgUsername } = body || {};

  if (typeof sessionId !== 'string' || !/^cs_(live|test)_[A-Za-z0-9]+$/.test(sessionId)) {
    return json({ error: 'Neplatné session_id.' }, 400);
  }
  if (!Number.isSafeInteger(Number(tgUserId)) || Number(tgUserId) <= 0) {
    return json({ error: 'Neplatné telegram_user_id.' }, 400);
  }

  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await admin.from('telegram_links').upsert({
    session_id: sessionId,
    telegram_user_id: Number(tgUserId),
    telegram_username: typeof tgUsername === 'string' ? tgUsername.replace(/^@/, '').slice(0, 64) || null : null,
    linked_at: new Date().toISOString(),
  });
  if (error) {
    console.error('telegram-linked error:', error);
    return json({ error: 'Zápis selhal.' }, 500);
  }
  return json({ ok: true });
}
