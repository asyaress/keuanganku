import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'dompetku_session';

function getSecret() {
  return process.env.SESSION_SECRET || 'dev-secret-change-me';
}

function sign(value: string) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
}

export function createSessionValue() {
  const payload = `personal-user:${Date.now()}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function isValidSession(value?: string) {
  if (!value) return false;
  const parts = value.split('.');
  if (parts.length < 2) return false;
  const signature = parts.pop()!;
  const payload = parts.join('.');
  return sign(payload) === signature;
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  return isValidSession(session);
}

export const sessionCookieName = COOKIE_NAME;
