import { InvestmentTimeline } from '@/components/investment-timeline';
import { InvestmentMonthlyReminder } from '@/components/investment-monthly-reminder';
import { Card, GradientCard } from '@/components/ui';
import { getInvestmentData } from '@/lib/data';
import { formatCurrency, formatPercent, monthLabel } from '@/lib/utils';

type SearchParams = {
  updated?: string;
};

type InvestasiPageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function InvestasiPage({ searchParams }: InvestasiPageProps) {
  const { assets, totals, timeline, summary, reminderMonthKey } = await getInvestmentData();
  const params = (await searchParams) || {};

  return (
    <div className="space-y-4">
      <InvestmentMonthlyReminder
        monthKey={reminderMonthKey}
        assets={assets.map((asset: any) => ({
          id: asset.id,
          assetName: asset.assetName,
          assetType: asset.assetType,
          totalValue: asset.totalValue,
        }))}
      />

      <div className="animate-fade-up">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Aset</p>
        <h1 className="mt-2 text-[30px] font-semibold tracking-tight text-app-text">Investasi</h1>
      </div>

      {params.updated === '1' ? (
        <Card className="animate-fade-up border-0 bg-[#eef9f8] p-4 text-sm font-medium text-[#177a79]">
          Nilai investasi bulan ini berhasil diperbarui.
        </Card>
      ) : null}

      <GradientCard className="animate-float-in">
        <p className="text-sm text-white/78">Total investasi</p>
        <h2 className="mt-2 text-[34px] font-semibold tracking-tight">{formatCurrency(summary.totalValue)}</h2>
        <p className="mt-2 text-sm text-white/80">
          Growth total {summary.totalGrowthAmount >= 0 ? '+' : '-'}
          {formatCurrency(Math.abs(summary.totalGrowthAmount))} ({formatPercent(summary.totalGrowthPercent)})
        </p>
      </GradientCard>

      <div className="grid grid-cols-2 gap-3">
        {totals.map((item, index) => (
          <Card key={item.type} className={`animate-fade-up ${index === 0 ? '[animation-delay:110ms]' : '[animation-delay:160ms]'}`}>
            <p className="text-sm font-medium text-app-text">{item.type === 'REKSADANA' ? 'Reksadana' : 'Emas'}</p>
            <p className="mt-2 text-lg font-semibold text-app-text">{formatCurrency(item.value)}</p>
            <p className="mt-1 text-xs text-app-muted">Modal {formatCurrency(item.invested)}</p>
            <p className={`mt-1 text-xs font-semibold ${item.growthAmount >= 0 ? 'text-[#177a79]' : 'text-[#d1695b]'}`}>
              {item.growthAmount >= 0 ? 'Naik' : 'Turun'} {formatCurrency(Math.abs(item.growthAmount))} ({formatPercent(item.growthPercent)})
            </p>
          </Card>
        ))}
      </div>

      <div className="animate-fade-up [animation-delay:220ms]"><InvestmentTimeline data={timeline} /></div>

      <Card className="animate-fade-up [animation-delay:280ms]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-app-text">Daftar aset</h2>
          <span className="text-sm text-app-muted">{assets.length} aset</span>
        </div>
        <div className="space-y-3">
          {assets.map((asset: any) => (
            <div key={asset.id} className="rounded-[24px] bg-[#f9fdfd] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-app-text">{asset.assetName}</p>
                  <p className="mt-1 text-xs text-app-muted">
                    {asset.assetType === 'REKSADANA' ? 'Reksadana' : 'Emas'}
                    {asset.subType ? ` - ${asset.subType}` : ''}
                    {' - '}
                    {monthLabel(asset.createdAt)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-app-text">{formatCurrency(asset.totalValue)}</p>
              </div>
              <p className={`mt-2 text-xs font-semibold ${asset.growthAmount >= 0 ? 'text-[#177a79]' : 'text-[#d1695b]'}`}>
                Total {asset.growthAmount >= 0 ? '+' : '-'}
                {formatCurrency(Math.abs(asset.growthAmount))} ({formatPercent(asset.growthPercent)})
              </p>
              <p className={`mt-1 text-xs ${asset.monthGrowthAmount == null ? 'text-app-muted' : asset.monthGrowthAmount >= 0 ? 'text-[#177a79]' : 'text-[#d1695b]'}`}>
                {asset.monthGrowthAmount == null
                  ? 'Growth bulanan belum tersedia (butuh data bulan lalu).'
                  : `Bulan ini ${asset.monthGrowthAmount >= 0 ? '+' : '-'}${formatCurrency(Math.abs(asset.monthGrowthAmount))} (${formatPercent(asset.monthGrowthPercent ?? 0)})`}
              </p>
            </div>
          ))}
          {assets.length === 0 ? <p className="text-sm text-app-muted">Belum ada aset investasi.</p> : null}
        </div>
      </Card>
    </div>
  );
}
