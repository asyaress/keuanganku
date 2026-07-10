'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { formatCurrency } from '@/lib/utils';

type ChartPoint = { key?: string; month: string; income: number; expense: number; investment: number };

export function DashboardChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="animate-fade-up rounded-[30px] bg-white p-5 shadow-soft [animation-delay:340ms]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-app-text">Statistik bulanan</h2>
        <p className="mt-1 text-sm text-app-muted">Masuk, keluar, dan investasi dalam 6 bulan.</p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 0, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2cb38a" stopOpacity={0.28} /><stop offset="100%" stopColor="#2cb38a" stopOpacity={0.02} /></linearGradient>
              <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff8e7d" stopOpacity={0.24} /><stop offset="100%" stopColor="#ff8e7d" stopOpacity={0.02} /></linearGradient>
              <linearGradient id="investmentFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#20c8c7" stopOpacity={0.26} /><stop offset="100%" stopColor="#20c8c7" stopOpacity={0.03} /></linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#edf6f6" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6a7a7d', fontSize: 12 }} />
            <Tooltip cursor={{ stroke: '#a1dedd', strokeDasharray: '5 5' }} contentStyle={{ borderRadius: 18, border: '1px solid #d9eeee', boxShadow: '0 18px 40px rgba(9, 35, 43, 0.10)' }} formatter={(value: number, name: string) => [formatCurrency(value), name === 'income' ? 'Masuk' : name === 'expense' ? 'Keluar' : 'Investasi']} />
            <Area type="monotone" dataKey="income" stroke="#2cb38a" strokeWidth={2.5} fill="url(#incomeFill)" />
            <Area type="monotone" dataKey="expense" stroke="#ff8e7d" strokeWidth={2.5} fill="url(#expenseFill)" />
            <Area type="monotone" dataKey="investment" stroke="#20c8c7" strokeWidth={2.5} fill="url(#investmentFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
