'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { formatCurrency } from '@/lib/utils';

type Point = { month: string; reksadana: number; emas: number };

export function InvestmentTimeline({ data }: { data: Point[] }) {
  return (
    <div className="rounded-[30px] bg-white p-5 shadow-soft">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-app-text">Pergerakan investasi</h2>
        <p className="mt-1 text-sm text-app-muted">Catatan pembelian dalam 6 bulan.</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 0, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="rekFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#20c8c7" stopOpacity={0.28} /><stop offset="100%" stopColor="#20c8c7" stopOpacity={0.02} /></linearGradient>
              <linearGradient id="emasFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f1b84b" stopOpacity={0.26} /><stop offset="100%" stopColor="#f1b84b" stopOpacity={0.02} /></linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#edf6f6" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6a7a7d', fontSize: 12 }} />
            <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name === 'reksadana' ? 'Reksadana' : 'Emas']} contentStyle={{ borderRadius: 18, border: '1px solid #d9eeee' }} />
            <Area type="monotone" dataKey="reksadana" stroke="#20c8c7" strokeWidth={2.5} fill="url(#rekFill)" />
            <Area type="monotone" dataKey="emas" stroke="#f1b84b" strokeWidth={2.5} fill="url(#emasFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
