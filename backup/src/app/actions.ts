'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { AssetType, CategoryType, TransactionType, WalletType } from '@prisma/client';
import dayjs from 'dayjs';
import { prisma } from '@/lib/prisma';

function normalizePath(path: string) {
  return path.startsWith('/') ? path : '/dashboard';
}

async function refreshAll() {
  revalidatePath('/dashboard');
  revalidatePath('/catat');
  revalidatePath('/statistik');
  revalidatePath('/investasi');
}

export async function createTransaction(formData: FormData) {
  const entryType = String(formData.get('entryType') || 'expense');
  const amount = Number(formData.get('amount') || 0);
  const note = String(formData.get('note') || '');
  const transactionDateRaw = String(formData.get('transactionDate') || '');
  const categoryIdRaw = String(formData.get('categoryId') || '');
  const assetTypeRaw = String(formData.get('assetType') || '');
  const subType = String(formData.get('subType') || '');
  const assetName = String(formData.get('assetName') || '');

  if (!amount || amount <= 0) {
    redirect('/catat?error=nominal');
  }

  const transactionDate = transactionDateRaw ? new Date(transactionDateRaw) : new Date();
  const mainWallet = await prisma.wallet.findFirst({ where: { type: WalletType.MAIN } });
  const investmentWallet = await prisma.wallet.findFirst({ where: { type: WalletType.INVESTMENT } });

  if (!mainWallet) {
    redirect('/catat?error=wallet');
  }

  if (entryType === 'income') {
    await prisma.transaction.create({
      data: {
        walletId: mainWallet.id,
        categoryId: categoryIdRaw ? Number(categoryIdRaw) : null,
        type: TransactionType.INCOME,
        amount,
        note,
        transactionDate,
      },
    });
  }

  if (entryType === 'expense') {
    await prisma.transaction.create({
      data: {
        walletId: mainWallet.id,
        categoryId: categoryIdRaw ? Number(categoryIdRaw) : null,
        type: TransactionType.EXPENSE,
        amount,
        note,
        transactionDate,
      },
    });
  }

  if (entryType === 'investment') {
    if (!investmentWallet) {
      redirect('/catat?error=investment-wallet');
    }

    const category = await prisma.category.findFirst({ where: { type: CategoryType.INVESTMENT } });
    const safeAssetType = assetTypeRaw === 'EMAS' ? AssetType.EMAS : AssetType.REKSADANA;
    const asset = await prisma.investmentAsset.create({
      data: {
        walletId: investmentWallet.id,
        assetType: safeAssetType,
        subType: safeAssetType === AssetType.REKSADANA ? subType || null : null,
        assetName: assetName || (safeAssetType === AssetType.REKSADANA ? 'Reksadana' : 'Emas'),
        totalInvested: amount,
        totalValue: amount,
      },
    });

    await prisma.transaction.create({
      data: {
        walletId: mainWallet.id,
        categoryId: category?.id ?? null,
        type: TransactionType.INVESTMENT_BUY,
        amount,
        note: note || `Beli ${assetName || (safeAssetType === AssetType.REKSADANA ? 'Reksadana' : 'Emas')}`,
        transactionDate,
        assetId: asset.id,
      },
    });

    try {
      await prisma.investmentSnapshot.create({
        data: {
          assetId: asset.id,
          monthKey: dayjs(transactionDate).format('YYYY-MM'),
          value: amount,
        },
      });
    } catch {
      // Keep transaction flow working even if snapshot table is not migrated yet.
    }
  }

  await refreshAll();
  redirect('/catat?saved=1');
}

export async function voidTransaction(formData: FormData) {
  const transactionId = Number(formData.get('transactionId') || 0);
  const returnTo = normalizePath(String(formData.get('returnTo') || '/dashboard'));

  if (!transactionId) {
    redirect(`${returnTo}${returnTo.includes('?') ? '&' : '?'}error=void`);
  }

  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { asset: true },
  });

  if (!tx || tx.isVoided) {
    redirect(`${returnTo}${returnTo.includes('?') ? '&' : '?'}error=void`);
  }

  await prisma.$transaction(async (db: any) => {
    await db.transaction.update({
      where: { id: transactionId },
      data: { isVoided: true, voidedAt: new Date() },
    });

    if (tx.assetId) {
      await db.investmentAsset.update({
        where: { id: tx.assetId },
        data: { isVoided: true, voidedAt: new Date() },
      });
    }
  });

  await refreshAll();
  redirect(`${returnTo}${returnTo.includes('?') ? '&' : '?'}voided=1`);
}

export async function updateTransaction(formData: FormData) {
  const transactionId = Number(formData.get('transactionId') || 0);
  const returnTo = normalizePath(String(formData.get('returnTo') || '/dashboard'));
  const amount = Number(formData.get('amount') || 0);
  const note = String(formData.get('note') || '');
  const transactionDateRaw = String(formData.get('transactionDate') || '');
  const categoryIdRaw = String(formData.get('categoryId') || '');

  if (!transactionId) {
    redirect('/catat?error=edit');
  }

  if (!amount || amount <= 0) {
    redirect(`/catat?editId=${transactionId}&error=nominal`);
  }

  const transactionDate = transactionDateRaw ? new Date(transactionDateRaw) : new Date();

  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { asset: true },
  });

  if (!tx || tx.isVoided) {
    redirect('/catat?error=edit');
  }

  await prisma.$transaction(async (db: any) => {
    if (tx.type === TransactionType.INVESTMENT_BUY) {
      const investmentCategory = await db.category.findFirst({ where: { type: CategoryType.INVESTMENT } });
      const delta = amount - Number(tx.amount);

      await db.transaction.update({
        where: { id: tx.id },
        data: {
          amount,
          note,
          transactionDate,
          categoryId: categoryIdRaw ? Number(categoryIdRaw) : (investmentCategory?.id ?? tx.categoryId ?? null),
        },
      });

      if (tx.assetId) {
        const asset = await db.investmentAsset.findUnique({ where: { id: tx.assetId } });
        if (asset && !asset.isVoided) {
          const nextTotalInvested = Math.max(0, Number(asset.totalInvested) + delta);
          const nextTotalValue = Math.max(0, Number(asset.totalValue) + delta);
          await db.investmentAsset.update({
            where: { id: tx.assetId },
            data: {
              totalInvested: nextTotalInvested,
              totalValue: nextTotalValue,
            },
          });
        }
      }

      return;
    }

    await db.transaction.update({
      where: { id: tx.id },
      data: {
        amount,
        note,
        transactionDate,
        categoryId: categoryIdRaw ? Number(categoryIdRaw) : null,
      },
    });
  });

  await refreshAll();
  redirect(`${returnTo}${returnTo.includes('?') ? '&' : '?'}edited=1`);
}

export async function updateInvestmentMonthlyValues(formData: FormData) {
  const rawAssetIds = formData.getAll('assetId');
  const requestedAssetIds = rawAssetIds
    .map((item) => Number(item))
    .filter((item, index, arr) => Number.isInteger(item) && item > 0 && arr.indexOf(item) === index);

  if (!requestedAssetIds.length) {
    redirect('/investasi?error=asset');
  }

  const monthKeyRaw = String(formData.get('monthKey') || '').trim();
  const monthKey = /^\d{4}-\d{2}$/.test(monthKeyRaw) ? monthKeyRaw : dayjs().format('YYYY-MM');

  const activeAssets = await prisma.investmentAsset.findMany({
    where: { id: { in: requestedAssetIds }, isVoided: false },
    select: { id: true },
  });
  const activeAssetIds = new Set(activeAssets.map((item: { id: number }) => item.id));

  if (!activeAssetIds.size) {
    redirect('/investasi?error=asset');
  }

  await prisma.$transaction(async (db: any) => {
    for (const assetId of requestedAssetIds) {
      if (!activeAssetIds.has(assetId)) continue;

      const valueRaw = String(formData.get(`value_${assetId}`) || '');
      const digitsOnly = valueRaw.replace(/[^\d]/g, '');

      if (!digitsOnly) continue;
      const value = Number(digitsOnly);
      if (!Number.isFinite(value) || value < 0) continue;

      await db.investmentAsset.update({
        where: { id: assetId },
        data: { totalValue: value },
      });

      try {
        await db.investmentSnapshot.upsert({
          where: { assetId_monthKey: { assetId, monthKey } },
          update: { value },
          create: { assetId, monthKey, value },
        });
      } catch {
        // Keep value update working even if snapshot table is not migrated yet.
      }
    }
  });

  await refreshAll();
  redirect('/investasi?updated=1');
}
