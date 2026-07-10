import { NextResponse } from 'next/server';
import { createSessionValue, sessionCookieName } from '@/lib/auth';

function getBaseUrl(request: Request) {
  const fallback = new URL(request.url).origin;
  const raw = process.env.APP_URL?.trim();
  if (raw) return raw.replace(/\/+$/, '');
  return fallback;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get('password') || '');
  const baseUrl = getBaseUrl(request);

  if (!process.env.APP_PASSWORD) {
    return NextResponse.redirect(new URL('/login', baseUrl));
  }

  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.redirect(new URL('/login', baseUrl));
  }

  const response = NextResponse.redirect(new URL('/dashboard', baseUrl));
  response.cookies.set(sessionCookieName, createSessionValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
