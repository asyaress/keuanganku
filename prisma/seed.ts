import { PrismaClient, WalletType, CategoryType, AssetType, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.investmentSnapshot.deleteMany();
  await prisma.investmentAsset.deleteMany();
  await prisma.category.deleteMany();
  await prisma.wallet.deleteMany();

  const mainWallet = await prisma.wallet.create({ data: { name: 'Dompet Utama', type: WalletType.MAIN, openingSaldo: 5200000 } });
  const investmentWallet = await prisma.wallet.create({ data: { name: 'Dompet Investasi', type: WalletType.INVESTMENT, openingSaldo: 0 } });

  const [gaji, pemasukanLain, makan, kebutuhan, transfer, mendesak, tagihan, investasi] = await Promise.all([
    prisma.category.create({ data: { name: 'Gaji', type: CategoryType.INCOME } }),
    prisma.category.create({ data: { name: 'Pemasukan Lain', type: CategoryType.INCOME } }),
    prisma.category.create({ data: { name: 'Makan', type: CategoryType.EXPENSE } }),
    prisma.category.create({ data: { name: 'Kebutuhan', type: CategoryType.EXPENSE } }),
    prisma.category.create({ data: { name: 'Transfer', type: CategoryType.EXPENSE } }),
    prisma.category.create({ data: { name: 'Mendesak', type: CategoryType.EXPENSE } }),
    prisma.category.create({ data: { name: 'Tagihan', type: CategoryType.EXPENSE } }),
    prisma.category.create({ data: { name: 'Investasi', type: CategoryType.INVESTMENT } }),
  ]);

  const now = new Date();
  const months = [
    new Date(now.getFullYear(), now.getMonth() - 5, 3),
    new Date(now.getFullYear(), now.getMonth() - 4, 8),
    new Date(now.getFullYear(), now.getMonth() - 3, 12),
    new Date(now.getFullYear(), now.getMonth() - 2, 9),
    new Date(now.getFullYear(), now.getMonth() - 1, 10),
    new Date(now.getFullYear(), now.getMonth(), 6),
  ];

  const asset1 = await prisma.investmentAsset.create({
    data: {
      walletId: investmentWallet.id,
      assetType: AssetType.REKSADANA,
      subType: 'Pasar Uang',
      assetName: 'Reksadana Pasar Uang',
      totalInvested: 2600000,
      totalValue: 2685000,
      createdAt: months[4],
    },
  });
  const asset2 = await prisma.investmentAsset.create({
    data: {
      walletId: investmentWallet.id,
      assetType: AssetType.EMAS,
      assetName: 'Tabungan Emas',
      totalInvested: 1800000,
      totalValue: 1940000,
      createdAt: months[5],
    },
  });

  await prisma.transaction.createMany({
    data: [
      { walletId: mainWallet.id, categoryId: gaji.id, type: TransactionType.INCOME, amount: 6200000, note: 'Gaji bulanan', transactionDate: months[0] },
      { walletId: mainWallet.id, categoryId: kebutuhan.id, type: TransactionType.EXPENSE, amount: 1350000, note: 'Belanja bulanan', transactionDate: months[0] },
      { walletId: mainWallet.id, categoryId: gaji.id, type: TransactionType.INCOME, amount: 6200000, note: 'Gaji bulanan', transactionDate: months[1] },
      { walletId: mainWallet.id, categoryId: makan.id, type: TransactionType.EXPENSE, amount: 310000, note: 'Makan luar', transactionDate: months[1] },
      { walletId: mainWallet.id, categoryId: gaji.id, type: TransactionType.INCOME, amount: 6200000, note: 'Gaji bulanan', transactionDate: months[2] },
      { walletId: mainWallet.id, categoryId: tagihan.id, type: TransactionType.EXPENSE, amount: 720000, note: 'Tagihan rumah', transactionDate: months[2] },
      { walletId: mainWallet.id, categoryId: gaji.id, type: TransactionType.INCOME, amount: 6200000, note: 'Gaji bulanan', transactionDate: months[3] },
      { walletId: mainWallet.id, categoryId: mendesak.id, type: TransactionType.EXPENSE, amount: 480000, note: 'Kebutuhan mendadak', transactionDate: months[3] },
      { walletId: mainWallet.id, categoryId: gaji.id, type: TransactionType.INCOME, amount: 6500000, note: 'Gaji bulanan', transactionDate: months[4] },
      { walletId: mainWallet.id, categoryId: kebutuhan.id, type: TransactionType.EXPENSE, amount: 980000, note: 'Belanja rumah', transactionDate: months[4] },
      { walletId: mainWallet.id, categoryId: gaji.id, type: TransactionType.INCOME, amount: 6500000, note: 'Gaji bulanan', transactionDate: months[5] },
      { walletId: mainWallet.id, categoryId: makan.id, type: TransactionType.EXPENSE, amount: 165000, note: 'Makan keluarga', transactionDate: months[5] },
      { walletId: mainWallet.id, categoryId: transfer.id, type: TransactionType.EXPENSE, amount: 420000, note: 'Transfer keluarga', transactionDate: new Date(now.getFullYear(), now.getMonth(), 14) },
      { walletId: mainWallet.id, categoryId: pemasukanLain.id, type: TransactionType.INCOME, amount: 350000, note: 'Bonus kecil', transactionDate: new Date(now.getFullYear(), now.getMonth(), 16) },
      { walletId: mainWallet.id, categoryId: investasi.id, type: TransactionType.INVESTMENT_BUY, amount: 2600000, note: 'Beli Reksadana Pasar Uang', transactionDate: months[4], assetId: asset1.id },
      { walletId: mainWallet.id, categoryId: investasi.id, type: TransactionType.INVESTMENT_BUY, amount: 1800000, note: 'Beli Tabungan Emas', transactionDate: months[5], assetId: asset2.id },
    ],
  });

  await Promise.all([
    prisma.investmentSnapshot.create({
      data: { assetId: asset1.id, monthKey: dayKey(months[4]), value: 2685000 },
    }),
    prisma.investmentSnapshot.create({
      data: { assetId: asset2.id, monthKey: dayKey(months[5]), value: 1940000 },
    }),
  ]);
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
