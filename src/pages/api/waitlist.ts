import type { APIRoute } from 'astro';
import { isDuplicate, normalizeEmail, saveEntry } from '../../lib/waitlist';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Naive in-memory rate limit: max N submissions per IP per window. Good enough
// for a single-node deploy; swap for an edge/WAF rule if traffic demands it.
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; windowStart: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  if (hits.size > 10_000) hits.clear(); // cap memory
  return entry.count > RATE_LIMIT;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let ip = 'unknown';
  try {
    ip = clientAddress;
  } catch {
    /* clientAddress can throw when unavailable (e.g. prerender context) */
  }
  if (rateLimited(ip)) {
    return json({ error: 'rate_limited' }, 429);
  }

  let payload: { email?: unknown; consent?: unknown; website?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  // Honeypot filled => almost certainly a bot. Pretend success, save nothing.
  if (typeof payload.website === 'string' && payload.website.trim() !== '') {
    return json({ ok: true }, 201);
  }

  const email = typeof payload.email === 'string' ? normalizeEmail(payload.email) : '';
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ error: 'invalid_email' }, 400);
  }
  if (payload.consent !== true) {
    return json({ error: 'consent_required' }, 400);
  }

  if (await isDuplicate(email)) {
    return json({ error: 'duplicate' }, 409);
  }

  await saveEntry({
    email,
    consent: true,
    source: 'sydney-landing',
    submittedAt: new Date().toISOString(),
  });

  return json({ ok: true }, 201);
};
