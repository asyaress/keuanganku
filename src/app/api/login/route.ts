import { NextResponse } from 'next/server';
import { createSessionValue, sessionCookieName } from '@/lib/auth';

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get('password') || '');

  if (!process.env.APP_PASSWORD) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const response = NextResponse.redirect(new URL('/dashboard', request.url));
  response.cookies.set(sessionCookieName, createSessionValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
