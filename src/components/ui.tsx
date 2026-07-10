'use client';

import type React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartColumnBig, CircleDollarSign, House, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto min-h-screen max-w-md bg-transparent px-4 pb-32 pt-5">{children}</div>;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('rounded-[30px] border border-app-line/90 bg-app-card p-5 shadow-soft transition duration-300', className)}>{children}</div>;
}

export function GradientCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('rounded-[34px] bg-app-gradient p-5 text-white shadow-card', className)}>{children}</div>;
}

export function PrimaryButton({ children, className, type = 'submit' }: { children: React.ReactNode; className?: string; type?: 'submit' | 'button' }) {
  return <button type={type} className={cn('h-14 w-full rounded-[20px] bg-app-accent text-base font-semibold text-white shadow-card transition duration-300 active:scale-[0.99]', className)}>{children}</button>;
}

export function Input({ label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return <label className="block space-y-2"><span className="text-sm font-semibold text-app-text">{label}</span><input {...props} className={cn('h-[52px] w-full rounded-[20px] border border-app-line bg-white px-4 text-base transition duration-300 placeholder:text-[#809498] focus:border-app-accent focus:shadow-[0_0_0_4px_rgba(32,200,199,0.14)]', className)} /></label>;
}

export function Select({ label, children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode; className?: string }) {
  return <label className="block space-y-2"><span className="text-sm font-semibold text-app-text">{label}</span><select {...props} className={cn('h-[52px] w-full rounded-[20px] border border-app-line bg-white px-4 text-base transition duration-300 focus:border-app-accent focus:shadow-[0_0_0_4px_rgba(32,200,199,0.14)]', className)}>{children}</select></label>;
}

export function TextArea({ label, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; className?: string }) {
  return <label className="block space-y-2"><span className="text-sm font-semibold text-app-text">{label}</span><textarea {...props} className={cn('min-h-24 w-full rounded-[20px] border border-app-line bg-white px-4 py-3 text-base transition duration-300 placeholder:text-[#809498] focus:border-app-accent focus:shadow-[0_0_0_4px_rgba(32,200,199,0.14)]', className)} /></label>;
}

export function BottomNav() {
  const pathname = usePathname();
  const items = [
    { href: '/dashboard', label: 'Beranda', icon: House },
    { href: '/catat', label: 'Catat', icon: CircleDollarSign },
    { href: '/statistik', label: 'Statistik', icon: ChartColumnBig },
    { href: '/investasi', label: 'Investasi', icon: Landmark },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-[30px] bg-white/94 p-2.5 shadow-soft backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          const onboardingId =
            item.href === '/catat'
              ? 'onboard-nav-catat'
              : item.href === '/statistik'
              ? 'onboard-nav-statistik'
              : item.href === '/investasi'
              ? 'onboard-nav-investasi'
              : undefined;

          return (
            <Link
              key={item.href}
              href={item.href}
              data-onboarding-id={onboardingId}
              className={cn('flex flex-col items-center justify-center rounded-[22px] px-2 py-3 text-xs font-semibold transition duration-300', active ? 'bg-app-accent text-white shadow-card' : 'text-app-muted hover:bg-app-accentSoft')}
            >
              <Icon className="mb-1 h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
