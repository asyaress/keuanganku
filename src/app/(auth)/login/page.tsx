import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { AppShell, Card, Input, PrimaryButton } from '@/components/ui';

export default async function LoginPage() {
  const loggedIn = await isAuthenticated();
  if (loggedIn) redirect('/dashboard');

  return (
    <AppShell>
      <div className="flex min-h-[88vh] flex-col justify-center">
        <div className="mb-7 animate-fade-up">
          <div className="inline-flex rounded-full bg-[#e7fbfb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-app-accentDark">Dompetku</div>
          <h1 className="mt-4 text-[34px] font-semibold tracking-tight text-app-text">Keuangan pribadi yang rapi.</h1>
          <p className="mt-3 text-sm leading-6 text-app-muted">Tampilan ala iPhone, cepat dicatat, dan tetap nyaman untuk melihat investasi.</p>
        </div>

        <Card className="animate-float-in">
          <form action="/api/login" method="post" className="space-y-4">
            <Input label="Password aplikasi" name="password" type="password" placeholder="Masukkan password" required />
            <PrimaryButton>Masuk</PrimaryButton>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
