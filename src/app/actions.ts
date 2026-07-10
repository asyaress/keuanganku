'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { AssetType, CategoryType, Prisma, TransactionType, WalletType } from '@prisma/client';
import dayjs from 'dayjs';
import { prisma } from '@/lib/prisma';

const maxAmount = 9_999_999_999_999;

function normalizePath(path: string) {
  return path.startsWith('/') && !path.startsWith('//') ? path : '/dashboard';
}

function appendQuery(path: string, params: Record<string, string | number>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => searchParams.set(key, String(value)));
  return `${path}${path.includes('?') ? '&' : '?'}${searchParams.toString()}`;
}

function parseMoney(value: FormDataEntryValue | null) {
  const digits = String(value || '').replace(/[^\d]/g, '');
  if (!digits) return 0;
  const amount = Number(digits);
  return Number.isFinite(amount) ? amount : 0;
}

function parseId(value: FormDataEntryValue | null) {
  const id = Number(value || 0);
  return Number.isInteger(id) && id > 0 ? id : 0;
}

function parseTransactionDate(value: FormDataEntryValue | null) {
  const raw = String(value || '').trim();
  if (!raw) return new Date();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;

  const [year, month, day] = raw.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;

  return date;
}

function cleanText(value: FormDataEntryValue | null, fallback = '') {
  const text = String(value || '').trim();
  return (text || fallback).slice(0, 180);
}

async function refreshAll() {
  revalidatePath('/dashboard');
  revalidatePath('/catat');
  revalidatePath('/statistik');
  revalidatePath('/investasi');
}

async function findCategoryId(categoryId: number, type: CategoryType) {
  if (!categoryId) return null;
  const category = await prisma.category.findFirst({
    where: { id: categoryId, type },
    select: { id: true },
  });
  return category?.id ?? null;
}

export async function createTransaction(formData: FormData) {
  const entryType = String(formData.get('entryType') || 'expense');
  const amount = parseMoney(formData.get('amount'));
  const note = cleanText(formData.get('note'));
  const transactionDate = parseTransactionDate(formData.get('transactionDate'));
  const categoryId = parseId(formData.get('categoryId'));
  const assetTypeRaw = String(formData.get('assetType') || '');
  const subType = cleanText(formData.get('subType'));
  const assetName = cleanText(formData.get('assetName'), assetTypeRaw === 'EMAS' ? 'Emas' : 'Reksadana');

  if (!amount || amount <= 0 || amount > maxAmount) {
    redirect('/catat?error=nominal');
  }

  if (!transactionDate) {
    redirect('/catat?error=tanggal');
  }

  const mainWallet = await prisma.wallet.findFirst({ where: { type: WalletType.MAIN } });
  const investmentWallet = await prisma.wallet.findFirst({ where: { type: WalletType.INVESTMENT } });

  if (!mainWallet) {
    redirect('/catat?error=wallet');
  }

  if (entryType === 'income') {
    const safeCategoryId = await findCategoryId(categoryId, CategoryType.INCOME);
    if (!safeCategoryId) redirect('/catat?error=kategori');

    await prisma.transaction.create({
      data: {
        walletId: mainWallet.id,
        categoryId: safeCategoryId,
        type: TransactionType.INCOME,
        amount,
        note,
        transactionDate,
      },
    });

    await refreshAll();
    redirect('/catat?saved=1');
  }

  if (entryType === 'expense') {
    const safeCategoryId = await findCategoryId(categoryId, CategoryType.EXPENSE);
    if (!safeCategoryId) redirect('/catat?error=kategori');

    await prisma.transaction.create({
      data: {
        walletId: mainWallet.id,
        categoryId: safeCategoryId,
        type: TransactionType.EXPENSE,
        amount,
        note,
        transactionDate,
      },
    });

    await refreshAll();
    redirect('/catat?saved=1');
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
        assetName,
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
        note: note || `Beli ${assetName}`,
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

    await refreshAll();
    redirect('/catat?saved=1');
  }

  redirect('/catat?error=jenis');
}

export async function voidTransaction(formData: FormData) {
  const transactionId = parseId(formData.get('transactionId'));
  const returnTo = normalizePath(String(formData.get('returnTo') || '/dashboard'));

  if (!transactionId) {
    redirect(appendQuery(returnTo, { error: 'void' }));
  }

  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { asset: true },
  });

  if (!tx || tx.isVoided) {
    redirect(appendQuery(returnTo, { error: 'void' }));
  }

  await prisma.$transaction(async (db: Prisma.TransactionClient) => {
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
  redirect(appendQuery(returnTo, { voided: 1 }));
}

export async function updateTransaction(formData: FormData) {
  const transactionId = parseId(formData.get('transactionId'));
  const returnTo = normalizePath(String(formData.get('returnTo') || '/dashboard'));
  const amount = parseMoney(formData.get('amount'));
  const note = cleanText(formData.get('note'));
  const transactionDate = parseTransactionDate(formData.get('transactionDate'));
  const categoryId = parseId(formData.get('categoryId'));

  if (!transactionId) {
    redirect('/catat?error=edit');
  }

  if (!amount || amount <= 0 || amount > maxAmount) {
    redirect(appendQuery('/catat', { editId: transactionId, returnTo, error: 'nominal' }));
  }

  if (!transactionDate) {
    redirect(appendQuery('/catat', { editId: transactionId, returnTo, error: 'tanggal' }));
  }

  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { asset: true },
  });

  if (!tx || tx.isVoided) {
    redirect('/catat?error=edit');
  }

  await prisma.$transaction(async (db: Prisma.TransactionClient) => {
    if (tx.type === TransactionType.INVESTMENT_BUY) {
      const investmentCategory = await db.category.findFirst({ where: { type: CategoryType.INVESTMENT } });
      const delta = amount - Number(tx.amount);

      await db.transaction.update({
        where: { id: tx.id },
        data: {
          amount,
          note,
          transactionDate,
          categoryId: investmentCategory?.id ?? tx.categoryId ?? null,
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

          try {
            await db.investmentSnapshot.upsert({
              where: { assetId_monthKey: { assetId: tx.assetId, monthKey: dayjs(transactionDate).format('YYYY-MM') } },
              update: { value: nextTotalValue },
              create: { assetId: tx.assetId, monthKey: dayjs(transactionDate).format('YYYY-MM'), value: nextTotalValue },
            });
          } catch {
            // Keep edit flow working even if snapshot table is not migrated yet.
          }
        }
      }

      return;
    }

    const expectedCategoryType = tx.type === TransactionType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE;
    const safeCategory = categoryId
      ? await db.category.findFirst({ where: { id: categoryId, type: expectedCategoryType }, select: { id: true } })
      : null;

    if (!safeCategory) {
      redirect(appendQuery('/catat', { editId: transactionId, returnTo, error: 'kategori' }));
    }

    await db.transaction.update({
      where: { id: tx.id },
      data: {
        amount,
        note,
        transactionDate,
        categoryId: safeCategory.id,
      },
    });
  });

  await refreshAll();
  redirect(appendQuery(returnTo, { edited: 1 }));
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

  await prisma.$transaction(async (db: Prisma.TransactionClient) => {
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
