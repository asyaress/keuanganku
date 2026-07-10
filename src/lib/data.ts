import { AssetType, CategoryType, TransactionType, WalletType } from '@prisma/client';
import dayjs from 'dayjs';
import { prisma } from './prisma';
import { serializeAsset, serializeCategory, serializeTransaction, serializeWallet } from './serializers';

type StatsMode = 'EXPENSE' | 'INCOME' | 'INVESTMENT';

export async function getDashboardData() {
  const wallets = await prisma.wallet.findMany({ orderBy: { id: 'asc' }, include: { transactions: { where: { isVoided: false } } } });
  const assets = await prisma.investmentAsset.findMany({ where: { isVoided: false }, orderBy: { id: 'asc' } });
  const now = dayjs();
  const monthStart = now.startOf('month').toDate();
  const sixMonthsStart = now.subtract(5, 'month').startOf('month').toDate();

  const monthTransactions = await prisma.transaction.findMany({
    where: { transactionDate: { gte: monthStart }, isVoided: false },
    include: { category: true, wallet: true },
    orderBy: { transactionDate: 'desc' },
  });
  const chartTransactions = await prisma.transaction.findMany({
    where: { transactionDate: { gte: sixMonthsStart }, isVoided: false },
    orderBy: { transactionDate: 'asc' },
    include: { category: true, wallet: true },
  });
  const lastTransactionsRaw = await prisma.transaction.findMany({
    where: { isVoided: false },
    include: { category: true, wallet: true },
    orderBy: { transactionDate: 'desc' },
    take: 5,
  });

  const mainWallet = wallets.find((item) => item.type === WalletType.MAIN);
  const mainBalance = calculateWalletBalance(mainWallet);
  const investmentValue = assets.reduce((sum, item) => sum + Number(item.totalValue), 0);
  const totalAssets = mainBalance + investmentValue;
  const monthIncome = monthTransactions.filter((item) => item.type === TransactionType.INCOME).reduce((sum, item) => sum + Number(item.amount), 0);
  const monthExpense = monthTransactions.filter((item) => item.type === TransactionType.EXPENSE).reduce((sum, item) => sum + Number(item.amount), 0);
  const monthInvestment = monthTransactions.filter((item) => item.type === TransactionType.INVESTMENT_BUY).reduce((sum, item) => sum + Number(item.amount), 0);

  const investmentByType = [AssetType.REKSADANA, AssetType.EMAS].map((type) => ({
    type,
    total: assets.filter((item) => item.assetType === type).reduce((sum, item) => sum + Number(item.totalValue), 0),
  }));

  const monthlyMap = new Map<string, { key: string; month: string; income: number; expense: number; investment: number }>();
  for (let i = 5; i >= 0; i -= 1) {
    const month = now.subtract(i, 'month');
    monthlyMap.set(month.format('YYYY-MM'), { key: month.format('YYYY-MM'), month: month.format('MMM'), income: 0, expense: 0, investment: 0 });
  }
  chartTransactions.forEach((item) => {
    const key = dayjs(item.transactionDate).format('YYYY-MM');
    const bucket = monthlyMap.get(key);
    if (!bucket) return;
    const amount = Number(item.amount);
    if (item.type === TransactionType.INCOME) bucket.income += amount;
    if (item.type === TransactionType.EXPENSE) bucket.expense += amount;
    if (item.type === TransactionType.INVESTMENT_BUY) bucket.investment += amount;
  });

  return {
    monthLabel: now.format('MMMM YYYY'),
    mainBalance,
    investmentValue,
    totalAssets,
    monthIncome,
    monthExpense,
    monthInvestment,
    investmentByType,
    monthlyChart: Array.from(monthlyMap.values()),
    lastTransactions: lastTransactionsRaw.map(serializeTransaction),
  };
}

export async function getTransactionFormData(editId?: number) {
  const wallets = await prisma.wallet.findMany({ orderBy: { id: 'asc' } });
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const editTransactionRaw = editId && Number.isInteger(editId) && editId > 0
    ? await prisma.transaction.findUnique({
      where: { id: editId },
      include: { category: true, wallet: true, asset: true },
    })
    : null;

  const editTransaction = editTransactionRaw && !editTransactionRaw.isVoided
    ? serializeTransaction(editTransactionRaw)
    : null;

  return {
    wallets: wallets.map(serializeWallet),
    categories: categories.map(serializeCategory),
    editTransaction,
  };
}

export async function getInvestmentData() {
  const assets = (await prisma.investmentAsset.findMany({ where: { isVoided: false }, orderBy: { createdAt: 'desc' } })).map(serializeAsset);
  const now = dayjs();
  const currentMonthKey = now.format('YYYY-MM');
  const previousMonthKey = now.subtract(1, 'month').format('YYYY-MM');

  let snapshots: Array<{ assetId: number; monthKey: string; value: unknown }> = [];
  if (assets.length) {
    try {
      snapshots = await prisma.investmentSnapshot.findMany({
        where: {
          assetId: { in: assets.map((item) => item.id) },
          monthKey: { in: [previousMonthKey, currentMonthKey] },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } catch {
      snapshots = [];
    }
  }

  const snapshotMap = new Map<string, number>();
  snapshots.forEach((item) => {
    const key = `${item.assetId}:${item.monthKey}`;
    if (!snapshotMap.has(key)) snapshotMap.set(key, Number(item.value));
  });

  const assetsWithGrowth = assets.map((item) => {
    const growthAmount = item.totalValue - item.totalInvested;
    const growthPercent = item.totalInvested > 0 ? (growthAmount / item.totalInvested) * 100 : 0;
    const previousValue = snapshotMap.get(`${item.id}:${previousMonthKey}`) ?? null;
    const currentValueFromSnapshot = snapshotMap.get(`${item.id}:${currentMonthKey}`) ?? item.totalValue;
    const monthGrowthAmount = previousValue == null ? null : currentValueFromSnapshot - previousValue;
    const monthGrowthPercent = previousValue && previousValue > 0 && monthGrowthAmount != null
      ? (monthGrowthAmount / previousValue) * 100
      : null;

    return {
      ...item,
      growthAmount,
      growthPercent,
      monthGrowthAmount,
      monthGrowthPercent,
    };
  });

  const totals = [AssetType.REKSADANA, AssetType.EMAS].map((type) => ({
    type,
    invested: assetsWithGrowth.filter((item) => item.assetType === type).reduce((sum, item) => sum + item.totalInvested, 0),
    value: assetsWithGrowth.filter((item) => item.assetType === type).reduce((sum, item) => sum + item.totalValue, 0),
    growthAmount: assetsWithGrowth.filter((item) => item.assetType === type).reduce((sum, item) => sum + item.growthAmount, 0),
  }));

  const totalsWithPercent = totals.map((item) => ({
    ...item,
    growthPercent: item.invested > 0 ? (item.growthAmount / item.invested) * 100 : 0,
  }));

  const totalInvested = totalsWithPercent.reduce((sum, item) => sum + item.invested, 0);
  const totalValue = totalsWithPercent.reduce((sum, item) => sum + item.value, 0);
  const totalGrowthAmount = totalValue - totalInvested;
  const totalGrowthPercent = totalInvested > 0 ? (totalGrowthAmount / totalInvested) * 100 : 0;

  const timelineMap = new Map<string, { month: string; reksadana: number; emas: number }>();
  for (let i = 5; i >= 0; i -= 1) {
    const month = now.subtract(i, 'month');
    timelineMap.set(month.format('YYYY-MM'), { month: month.format('MMM'), reksadana: 0, emas: 0 });
  }
  const assetTransactions = await prisma.transaction.findMany({
    where: { type: TransactionType.INVESTMENT_BUY, isVoided: false },
    include: { asset: true },
    orderBy: { transactionDate: 'asc' },
  });
  assetTransactions.forEach((item) => {
    const key = dayjs(item.transactionDate).format('YYYY-MM');
    const bucket = timelineMap.get(key);
    if (!bucket || !item.asset || item.asset.isVoided) return;
    if (item.asset.assetType === AssetType.REKSADANA) bucket.reksadana += Number(item.amount);
    if (item.asset.assetType === AssetType.EMAS) bucket.emas += Number(item.amount);
  });
  return {
    assets: assetsWithGrowth,
    totals: totalsWithPercent,
    timeline: Array.from(timelineMap.values()),
    summary: {
      totalInvested,
      totalValue,
      totalGrowthAmount,
      totalGrowthPercent,
    },
    reminderMonthKey: currentMonthKey,
  };
}

export async function getStatisticsDataByMonth(mode: StatsMode = 'EXPENSE', monthKey?: string) {
  const now = dayjs();
  const start = now.subtract(5, 'month').startOf('month').toDate();
  const items = await prisma.transaction.findMany({
    where: { transactionDate: { gte: start }, isVoided: false },
    include: { category: true, wallet: true, asset: true },
    orderBy: { transactionDate: 'asc' },
  });

  const monthOptions = Array.from({ length: 6 }).map((_, index) => {
    const month = now.subtract(index, 'month');
    return { key: month.format('YYYY-MM'), label: month.format('MMMM YYYY') };
  });

  const selectedMonth = monthOptions.some((item) => item.key === monthKey) ? monthKey! : monthOptions[0].key;
  return buildStatisticsPayload(items.map(serializeTransaction), mode, selectedMonth, monthOptions);
}

function buildStatisticsPayload(items: ReturnType<typeof serializeTransaction>[], mode: StatsMode, selectedMonth: string, monthOptions: Array<{ key: string; label: string }>) {
  const monthlyMap = new Map<string, { month: string; amount: number }>();
  monthOptions.slice().reverse().forEach((option) => {
    monthlyMap.set(option.key, { month: dayjs(option.key + '-01').format('MMM'), amount: 0 });
  });

  const filteredByMode = items.filter((item) => {
    if (mode === 'INCOME') return item.type === TransactionType.INCOME;
    if (mode === 'INVESTMENT') return item.type === TransactionType.INVESTMENT_BUY;
    return item.type === TransactionType.EXPENSE;
  });

  filteredByMode.forEach((item) => {
    const key = dayjs(item.transactionDate).format('YYYY-MM');
    const bucket = monthlyMap.get(key);
    if (bucket) bucket.amount += item.amount;
  });

  const monthItems = filteredByMode.filter((item) => dayjs(item.transactionDate).format('YYYY-MM') === selectedMonth);
  const breakdownMap = new Map<string, number>();
  monthItems.forEach((item) => {
    const label = mode === 'INVESTMENT' ? item.note || item.category?.name || 'Investasi' : item.category?.name || 'Tanpa kategori';
    breakdownMap.set(label, (breakdownMap.get(label) || 0) + item.amount);
  });

  const breakdown = Array.from(breakdownMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const total = breakdown.reduce((sum, item) => sum + item.value, 0);

  return {
    mode,
    selectedMonth,
    monthOptions,
    trend: Array.from(monthlyMap.values()),
    breakdown,
    total,
    transactions: monthItems.slice().reverse(),
  };
}

export function calculateWalletBalance(wallet?: { openingSaldo: unknown; transactions: Array<{ type: TransactionType; amount: unknown }> }) {
  if (!wallet) return 0;
  const opening = Number(wallet.openingSaldo);
  const mutation = wallet.transactions.reduce((sum, tx) => {
    const amount = Number(tx.amount);
    if (tx.type === TransactionType.INCOME) return sum + amount;
    return sum - amount;
  }, 0);
  return opening + mutation;
}

export function mapCategoryType(kind: string) {
  if (kind === 'income') return CategoryType.INCOME;
  if (kind === 'expense') return CategoryType.EXPENSE;
  return CategoryType.INVESTMENT;
}
