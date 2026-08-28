import { readFile, mkdir, appendFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
export { renderers } from '../../renderers.mjs';

const DEFAULT_STORE = process.env.VERCEL ? "/tmp/waitlist.jsonl" : ".data/waitlist.jsonl";
const STORE_FILE = resolve(process.env.WAITLIST_STORE_FILE || DEFAULT_STORE);
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
async function isDuplicate(email) {
  let raw;
  try {
    raw = await readFile(STORE_FILE, "utf8");
  } catch {
    return false;
  }
  const needle = normalizeEmail(email);
  return raw.split("\n").filter(Boolean).some((line) => {
    try {
      return normalizeEmail(JSON.parse(line).email) === needle;
    } catch {
      return false;
    }
  });
}
async function saveEntry(entry) {
  await mkdir(dirname(STORE_FILE), { recursive: true });
  await appendFile(STORE_FILE, JSON.stringify(entry) + "\n", "utf8");
  const webhook = process.env.WAITLIST_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });
      if (!res.ok) {
        console.error(`waitlist webhook responded ${res.status}`);
      }
    } catch (err) {
      console.error("waitlist webhook failed", err);
    }
  }
}

const prerender = false;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 6e4;
const hits = /* @__PURE__ */ new Map();
function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  if (hits.size > 1e4) hits.clear();
  return entry.count > RATE_LIMIT;
}
function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const POST = async ({ request, clientAddress }) => {
  let ip = "unknown";
  try {
    ip = clientAddress;
  } catch {
  }
  if (rateLimited(ip)) {
    return json({ error: "rate_limited" }, 429);
  }
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  if (typeof payload.website === "string" && payload.website.trim() !== "") {
    return json({ ok: true }, 201);
  }
  const email = typeof payload.email === "string" ? normalizeEmail(payload.email) : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ error: "invalid_email" }, 400);
  }
  if (payload.consent !== true) {
    return json({ error: "consent_required" }, 400);
  }
  if (await isDuplicate(email)) {
    return json({ error: "duplicate" }, 409);
  }
  await saveEntry({
    email,
    consent: true,
    source: "sydney-landing",
    submittedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  return json({ ok: true }, 201);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
