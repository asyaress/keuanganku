import Link from 'next/link';
import { voidTransaction } from '@/app/actions';
import { DashboardChart } from '@/components/dashboard-chart';
import { DashboardOnboarding } from '@/components/dashboard-onboarding';
import { DashboardSlider } from '@/components/dashboard-slider';
import {
  HeaderBlock,
  HeroBalance,
  SummaryCards,
} from '@/components/dashboard-cards';
import { Card } from '@/components/ui';
import { getDashboardData } from '@/lib/data';
import { formatCurrency, shortDate } from '@/lib/utils';

type SearchParams = {
  voided?: string;
  edited?: string;
};

type InvestmentTypeSummary = {
  type: string;
  total: number;
};

type LastTransactionItem = {
  id: number | string;
  type: string;
  amount: number;
  note?: string | null;
  transactionDate: string | Date;
  category?: {
    name?: string | null;
  } | null;
};

type DashboardPageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const data = await getDashboardData();
  const params = (await searchParams) || {};

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DashboardOnboarding />
      </div>

      <HeaderBlock monthLabel={data.monthLabel} />

      <HeroBalance
        totalAssets={data.totalAssets}
        mainBalance={data.mainBalance}
        investmentValue={data.investmentValue}
      />

      <SummaryCards
        monthIncome={data.monthIncome}
        monthExpense={data.monthExpense}
        monthInvestment={data.monthInvestment}
      />

      <DashboardSlider
        monthIncome={data.monthIncome}
        monthExpense={data.monthExpense}
        investmentValue={data.investmentValue}
      />

      <DashboardChart data={data.monthlyChart} />

      {params.voided === '1' ? (
        <Card className="animate-fade-up border-0 bg-[#fff5f2] p-4 text-sm font-medium text-[#d1695b] [animation-delay:360ms]">
          Transaksi berhasil di-void.
        </Card>
      ) : null}
      {params.edited === '1' ? (
        <Card className="animate-fade-up border-0 bg-[#effbfb] p-4 text-sm font-medium text-app-accentDark [animation-delay:360ms]">
          Perubahan transaksi berhasil disimpan.
        </Card>
      ) : null}

      <Card className="animate-fade-up [animation-delay:420ms]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-app-text">
            Investasi
          </h2>
          <Link
            href="/investasi"
            className="text-sm font-semibold text-app-accentDark"
          >
            Lihat semua
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {data.investmentByType.map(
            (item: InvestmentTypeSummary, index: number) => (
              <div
                key={item.type}
                className={`rounded-[26px] px-4 py-4 ${
                  index === 0 ? 'bg-[#effbfb]' : 'bg-[#fff8e8]'
                }`}
              >
                <span className="text-sm font-medium text-app-text">
                  {item.type === 'REKSADANA' ? 'Reksadana' : 'Emas'}
                </span>
                <p className="mt-3 text-lg font-semibold text-app-text">
                  {formatCurrency(item.total)}
                </p>
              </div>
            )
          )}
        </div>
      </Card>

      <Card className="animate-fade-up [animation-delay:480ms]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-app-text">
            Terbaru
          </h2>
          <Link
            href="/statistik"
            className="text-sm font-semibold text-app-accentDark"
          >
            Statistik
          </Link>
        </div>

        <div className="space-y-3">
          {data.lastTransactions.map((item: LastTransactionItem) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-[24px] bg-[#f9fdfd] px-4 py-4"
            >
              <div>
                <p className="text-sm font-medium text-app-text">
                  {item.category?.name || item.note || item.type}
                </p>
                <p className="mt-1 text-xs text-app-muted">
                  {shortDate(item.transactionDate)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-app-text">
                  {formatCurrency(item.amount)}
                </p>

                <Link
                  href={`/catat?editId=${item.id}&returnTo=${encodeURIComponent('/dashboard')}`}
                  className="rounded-full border border-[#d9eceb] bg-white px-3 py-1.5 text-[11px] font-semibold text-app-accentDark transition hover:bg-[#f2fbfb]"
                >
                  Edit
                </Link>

                <form action={voidTransaction}>
                  <input type="hidden" name="transactionId" value={item.id} />
                  <input type="hidden" name="returnTo" value="/dashboard" />
                  <button className="rounded-full border border-[#ffd7d1] bg-[#fff5f2] px-3 py-1.5 text-[11px] font-semibold text-[#d1695b] transition hover:bg-[#ffece6]">
                    Void
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
