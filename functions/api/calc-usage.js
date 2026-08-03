import { json } from '../_utils.js';

const FREE_LIMIT = 3;

/** Nevratný hash IP (IP + tajná sůl) — do KV neukládáme IP v čitelné podobě. */
async function hashIp(ip, salt) {
  const data = new TextEncoder().encode(`${ip}:${salt}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function readCount(env, request) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const key = `calc:${await hashIp(ip, env.CALC_IP_SALT)}`;
  const count = parseInt((await env.CALC_USAGE.get(key)) || '0', 10) || 0;
  return { key, count };
}

/**
 * Cloudflare Pages Function: limit 3 použití kalkulačky zdarma na veřejném webu
 * (napořád, bez resetu — bere IP, ne prohlížeč, aby smazání localStorage nestačilo).
 * Placení členové mají neomezenou kalkulačku v administraci — tam se tento limit nepoužívá.
 */
export async function onRequestGet({ request, env }) {
  const { count } = await readCount(env, request);
  return json({ count, remaining: Math.max(0, FREE_LIMIT - count), limit: FREE_LIMIT });
}

export async function onRequestPost({ request, env }) {
  const { key, count } = await readCount(env, request);
  if (count >= FREE_LIMIT) {
    return json({ ok: false, count, remaining: 0, limit: FREE_LIMIT });
  }
  const next = count + 1;
  await env.CALC_USAGE.put(key, String(next));
  return json({ ok: true, count: next, remaining: FREE_LIMIT - next, limit: FREE_LIMIT });
}
