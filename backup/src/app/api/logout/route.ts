import { NextResponse } from 'next/server';
import { sessionCookieName } from '@/lib/auth';

function getBaseUrl(request: Request) {
  const fallback = new URL(request.url).origin;
  const raw = process.env.APP_URL?.trim();
  if (raw) return raw.replace(/\/+$/, '');
  return fallback;
}

export async function POST(request: Request) {
  const baseUrl = getBaseUrl(request);
  const response = NextResponse.redirect(new URL('/login', baseUrl));
  response.cookies.set(sessionCookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
