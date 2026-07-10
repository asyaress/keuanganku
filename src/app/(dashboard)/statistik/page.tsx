import { StatisticsPanel } from '@/components/statistics-panel';
import { getStatisticsDataByMonth } from '@/lib/data';
import { cn } from '@/lib/utils';

type Mode = 'EXPENSE' | 'INCOME' | 'INVESTMENT';

export default async function StatistikPage({ searchParams }: { searchParams?: Promise<{ mode?: Mode; month?: string; voided?: string; edited?: string }> }) {
  const params = (await searchParams) || {};
  const mode = (params.mode || 'EXPENSE') as Mode;
  const data = await getStatisticsDataByMonth(mode, params.month);
  const returnTo = `/statistik?mode=${mode}&month=${data.selectedMonth}`;

  const modes = [
    { label: 'Keluar', value: 'EXPENSE' },
    { label: 'Masuk', value: 'INCOME' },
    { label: 'Investasi', value: 'INVESTMENT' },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="animate-fade-up">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Analisa</p>
        <h1 className="mt-2 text-[30px] font-semibold tracking-tight text-app-text">Statistik bulanan</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 animate-fade-up [animation-delay:90ms]">
        {modes.map((item) => (
          <a key={item.value} href={`/statistik?mode=${item.value}&month=${data.selectedMonth}`} className={cn('rounded-[20px] px-4 py-2.5 text-sm font-semibold transition duration-300', mode === item.value ? 'bg-app-gradient text-white shadow-card' : 'bg-white text-app-muted shadow-soft')}>
            {item.label}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 animate-fade-up [animation-delay:120ms]">
        {data.monthOptions.map((option) => (
          <a key={option.key} href={`/statistik?mode=${mode}&month=${option.key}`} className={cn('rounded-[22px] px-4 py-3 text-sm font-medium transition duration-300', data.selectedMonth === option.key ? 'bg-[#eafafa] text-app-accentDark' : 'bg-white text-app-muted shadow-soft')}>
            {option.label}
          </a>
        ))}
      </div>

      {params.voided === '1' ? <div className="rounded-[24px] border-0 bg-[#fff5f2] px-4 py-3 text-sm font-medium text-[#d1695b] animate-fade-up [animation-delay:150ms]">Transaksi berhasil di-void.</div> : null}
      {params.edited === '1' ? <div className="rounded-[24px] border-0 bg-[#effbfb] px-4 py-3 text-sm font-medium text-app-accentDark animate-fade-up [animation-delay:150ms]">Perubahan transaksi berhasil disimpan.</div> : null}

      <div className="animate-fade-up [animation-delay:180ms]">
        <StatisticsPanel
          trend={data.trend}
          breakdown={data.breakdown}
          total={data.total}
          title={mode === 'EXPENSE' ? 'Pengeluaran' : mode === 'INCOME' ? 'Pemasukan' : 'Investasi'}
          transactions={data.transactions}
          returnTo={returnTo}
        />
      </div>
    </div>
  );
}
