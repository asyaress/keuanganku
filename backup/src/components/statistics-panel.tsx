'use client';

import Link from 'next/link';
import { voidTransaction } from '@/app/actions';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { formatCurrency, shortDate } from '@/lib/utils';

type TrendPoint = { month: string; amount: number };
type BreakdownItem = { name: string; value: number };
type TxItem = { id: number; amount: number; note?: string | null; transactionDate?: string | Date | null; category?: { name?: string | null } | null };

const COLORS = ['#20c8c7', '#6cddd9', '#ff8e7d', '#f1b84b', '#2cb38a', '#95d6c5'];

export function StatisticsPanel({ trend, breakdown, total, title, transactions, returnTo }: { trend: TrendPoint[]; breakdown: BreakdownItem[]; total: number; title: string; transactions: TxItem[]; returnTo: string }) {
  const editTarget = `/catat?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <div className="space-y-4">
      <div className="rounded-[30px] bg-white p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-accentDark">{title}</p>
        <h2 className="mt-2 text-[32px] font-semibold tracking-tight text-app-text">{formatCurrency(total)}</h2>
        <div className="mt-5 h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
              <defs><linearGradient id="statFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#20c8c7" stopOpacity={0.30} /><stop offset="100%" stopColor="#20c8c7" stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="#edf6f6" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6a7a7d', fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Total']} contentStyle={{ borderRadius: 18, border: '1px solid #d9eeee' }} />
              <Area type="monotone" dataKey="amount" stroke="#20c8c7" strokeWidth={3} fill="url(#statFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-end justify-between"><h3 className="text-lg font-semibold tracking-tight text-app-text">Kategori</h3><span className="text-sm text-app-muted">{breakdown.length} item</span></div>
        {breakdown.length > 0 ? <>
          <div className="mx-auto h-56 w-full max-w-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={56} outerRadius={84} paddingAngle={2}>
                  {breakdown.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Nominal']} contentStyle={{ borderRadius: 18, border: '1px solid #d9eeee' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {breakdown.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between rounded-[20px] bg-[#f9fdfd] px-4 py-3">
                <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span className="text-sm font-medium text-app-text">{item.name}</span></div>
                <span className="text-sm font-semibold text-app-text">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </> : <p className="text-sm text-app-muted">Belum ada data di bulan ini.</p>}
      </div>

      <div className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-end justify-between"><h3 className="text-lg font-semibold tracking-tight text-app-text">Transaksi bulan ini</h3><span className="text-sm text-app-muted">{transactions.length} transaksi</span></div>
        <div className="space-y-3">
          {transactions.length > 0 ? transactions.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-[22px] bg-[#f9fdfd] px-4 py-3">
              <div><p className="text-sm font-medium text-app-text">{item.category?.name || item.note || 'Transaksi'}</p><p className="mt-1 text-xs text-app-muted">{shortDate(item.transactionDate || new Date())}</p></div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-app-text">{formatCurrency(item.amount)}</span>
                <Link href={`${editTarget}&editId=${item.id}`} className="rounded-full border border-[#d9eceb] bg-white px-3 py-1.5 text-[11px] font-semibold text-app-accentDark transition hover:bg-[#f2fbfb]">
                  Edit
                </Link>
                <form action={voidTransaction}>
                  <input type="hidden" name="transactionId" value={item.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <button className="rounded-full border border-[#ffd7d1] bg-[#fff5f2] px-3 py-1.5 text-[11px] font-semibold text-[#d1695b] transition hover:bg-[#ffece6]">Void</button>
                </form>
              </div>
            </div>
          )) : <p className="text-sm text-app-muted">Belum ada transaksi untuk bulan ini.</p>}
        </div>
      </div>
    </div>
  );
}
