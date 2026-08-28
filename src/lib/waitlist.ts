/**
 * Waitlist storage.
 *
 * Default: appends signups to a local JSONL file (good for dev and a single
 * Node server). Optionally forwards each signup to WAITLIST_WEBHOOK_URL so the
 * marketing/CRM tool of choice can be wired in without code changes.
 */
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export interface WaitlistEntry {
  email: string;
  consent: true;
  source: 'sydney-landing';
  submittedAt: string;
}

const STORE_FILE = resolve(process.env.WAITLIST_STORE_FILE || '.data/waitlist.jsonl');

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function isDuplicate(email: string): Promise<boolean> {
  let raw: string;
  try {
    raw = await readFile(STORE_FILE, 'utf8');
  } catch {
    return false;
  }
  const needle = normalizeEmail(email);
  return raw
    .split('\n')
    .filter(Boolean)
    .some((line) => {
      try {
        return normalizeEmail(JSON.parse(line).email) === needle;
      } catch {
        return false;
      }
    });
}

export async function saveEntry(entry: WaitlistEntry): Promise<void> {
  await mkdir(dirname(STORE_FILE), { recursive: true });
  await appendFile(STORE_FILE, JSON.stringify(entry) + '\n', 'utf8');

  const webhook = process.env.WAITLIST_WEBHOOK_URL;
  if (webhook) {
    // Forward to the configured endpoint; a webhook failure must not lose the
    // signup (it is already in the local store), so log and continue.
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!res.ok) {
        console.error(`waitlist webhook responded ${res.status}`);
      }
    } catch (err) {
      console.error('waitlist webhook failed', err);
    }
  }
}
