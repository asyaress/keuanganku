import type React from 'react';
import { redirect } from 'next/navigation';
import { AppShell, BottomNav } from '@/components/ui';
import { isAuthenticated } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const loggedIn = await isAuthenticated();
  if (!loggedIn) redirect('/login');

  return (
    <AppShell>
      {children}
      <BottomNav />
    </AppShell>
  );
}
