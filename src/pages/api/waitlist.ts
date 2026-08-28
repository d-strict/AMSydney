import type { APIRoute } from 'astro';
import { isDuplicate, normalizeEmail, saveEntry } from '../../lib/waitlist';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let payload: { email?: unknown; consent?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
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
