'use client';

import { useMemo, useState } from 'react';
import { createTransaction, updateTransaction } from '@/app/actions';
import { investmentTypeOptions, reksadanaOptions } from '@/lib/constants';
import { RupiahInput } from '@/components/rupiah-input';
import { Card, PrimaryButton, Select, TextArea } from '@/components/ui';
import { cn } from '@/lib/utils';

type WalletItem = { id: number; name: string; type: string; openingSaldo: number; createdAt: string; updatedAt: string };
type CategoryItem = { id: number; name: string; type: string; createdAt: string; updatedAt: string };

type EditTransaction = {
  id: number;
  type: 'INCOME' | 'EXPENSE' | 'INVESTMENT_BUY' | 'TRANSFER';
  amount: number;
  note: string;
  transactionDate: string;
  categoryId: number | null;
  asset?: {
    id: number;
    assetType: 'REKSADANA' | 'EMAS';
    subType?: string;
    assetName: string;
  } | null;
};

function mapTxTypeToEntryType(txType?: EditTransaction['type']) {
  if (txType === 'INCOME') return 'income';
  if (txType === 'INVESTMENT_BUY') return 'investment';
  return 'expense';
}

function toDateInputValue(value?: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function TransactionForm({
  wallets,
  categories,
  editTransaction,
  returnTo,
}: {
  wallets: WalletItem[];
  categories: CategoryItem[];
  editTransaction?: EditTransaction | null;
  returnTo?: string;
}) {
  const isEditing = Boolean(editTransaction);
  const initialEntryType = mapTxTypeToEntryType(editTransaction?.type);
  const initialAssetType = editTransaction?.asset?.assetType === 'EMAS' ? 'EMAS' : 'REKSADANA';
  const initialAmount = editTransaction?.amount ?? 0;

  const [entryType, setEntryType] = useState(initialEntryType as 'income' | 'expense' | 'investment');
  const [assetType, setAssetType] = useState(initialAssetType as 'REKSADANA' | 'EMAS');
  const [amount, setAmount] = useState(initialAmount);

  const filteredCategories = useMemo(() => {
    if (entryType === 'income') return categories.filter((item) => item.type === 'INCOME');
    if (entryType === 'expense') return categories.filter((item) => item.type === 'EXPENSE');
    return categories.filter((item) => item.type === 'INVESTMENT');
  }, [categories, entryType]);

  const modeItems = [
    { key: 'expense', label: 'Pengeluaran' },
    { key: 'income', label: 'Pemasukan' },
    { key: 'investment', label: 'Investasi' },
  ] as const;

  const initialCategoryId = editTransaction?.categoryId ?? null;
  const formAction = isEditing ? updateTransaction : createTransaction;
  const effectiveReturnTo = returnTo || '/dashboard';
  const dateValue = toDateInputValue(editTransaction?.transactionDate);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="entryType" value={entryType} />
      <input type="hidden" name="walletId" value={wallets[0]?.id ?? ''} />
      {isEditing ? <input type="hidden" name="transactionId" value={editTransaction?.id ?? ''} /> : null}
      {isEditing ? <input type="hidden" name="returnTo" value={effectiveReturnTo} /> : null}

      {isEditing ? (
        <Card className="animate-fade-up border border-[#d8e8e8] bg-[#f6fbfb] p-4">
          <p className="text-sm font-semibold text-app-text">Mode edit transaksi</p>
          <p className="mt-1 text-sm leading-6 text-app-muted">Ubah nominal, kategori, tanggal, atau catatan. Jenis transaksi tetap mengikuti data awal.</p>
        </Card>
      ) : null}

      <div className="grid grid-cols-3 gap-2 rounded-[22px] bg-[#ecf7f7] p-1.5 animate-fade-up">
        {modeItems.map((item) => (
          <button
            key={item.key}
            type="button"
            disabled={isEditing}
            onClick={() => setEntryType(item.key)}
            className={cn(
              'min-h-12 rounded-[17px] px-2 py-3 text-center text-sm font-semibold leading-tight transition duration-300',
              entryType === item.key ? 'bg-app-gradient text-white shadow-card' : 'text-app-muted',
              isEditing ? 'cursor-not-allowed opacity-70' : ''
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-up [animation-delay:100ms]">
        <RupiahInput onValueChange={setAmount} initialValue={initialAmount} key={`amount-${editTransaction?.id ?? 'new'}`} />
      </div>

      <Card className="animate-fade-up space-y-4 [animation-delay:160ms]">
        {entryType !== 'investment' ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-app-text">Kategori</p>
              <span className="text-xs font-medium text-app-muted">{filteredCategories.length} pilihan</span>
            </div>
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {filteredCategories.map((category: CategoryItem) => (
                  <label key={category.id} className="cursor-pointer">
                    <input type="radio" name="categoryId" value={category.id} className="peer sr-only" required defaultChecked={initialCategoryId === category.id} />
                    <span className="flex min-h-14 items-center justify-center rounded-[18px] border border-app-line bg-[#fbfefe] px-3 py-3 text-center text-sm font-semibold leading-tight text-app-text transition duration-300 peer-checked:border-transparent peer-checked:bg-app-gradient peer-checked:text-white">{category.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="rounded-[18px] border border-[#ffd7d1] bg-[#fff8f5] px-4 py-3 text-sm font-medium text-[#b95c50]">
                Kategori untuk jenis transaksi ini belum tersedia.
              </div>
            )}
          </>
        ) : isEditing ? (
          <div className="rounded-[20px] border border-[#d9eceb] bg-[#f9fdfd] px-4 py-3">
            <p className="text-sm font-semibold text-app-text">Aset investasi</p>
            <p className="mt-1 text-sm text-app-muted">{editTransaction?.asset?.assetName || '-'} ({editTransaction?.asset?.assetType === 'EMAS' ? 'Emas' : 'Reksadana'})</p>
            <p className="mt-1 text-xs text-app-muted">Nama aset tidak diubah dari menu edit transaksi.</p>
          </div>
        ) : (
          <>
            <Select label="Jenis investasi" name="assetType" value={assetType} onChange={(e) => setAssetType(e.target.value as 'REKSADANA' | 'EMAS')} required>
              {investmentTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
            {assetType === 'REKSADANA' ? <Select label="Subjenis" name="subType"><option value="">Pilih bila perlu</option>{reksadanaOptions.map((option) => <option key={option} value={option}>{option}</option>)}</Select> : <input type="hidden" name="subType" value="" />}
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-app-text">Nama produk / aset</span>
              <input name="assetName" placeholder={assetType === 'REKSADANA' ? 'Contoh: Reksadana Pasar Uang' : 'Contoh: Tabungan Emas'} required className="h-[52px] w-full rounded-[20px] border border-app-line bg-white px-4 text-base transition duration-300 placeholder:text-[#809498] focus:border-app-accent focus:shadow-[0_0_0_4px_rgba(32,200,199,0.14)]" />
            </label>
          </>
        )}

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-app-text">Tanggal</span>
          <input name="transactionDate" type="date" required className="h-[52px] w-full rounded-[20px] border border-app-line bg-white px-4 text-base transition duration-300 focus:border-app-accent focus:shadow-[0_0_0_4px_rgba(32,200,199,0.14)]" defaultValue={dateValue} />
          <p className="text-xs leading-5 text-app-muted">Gunakan tanggal transaksi sebenarnya agar laporan bulanan akurat.</p>
        </label>

        <TextArea label="Catatan" name="note" placeholder={amount > 0 ? `Catatan untuk ${entryType === 'investment' ? 'investasi' : 'transaksi'} ini` : 'Catatan singkat'} defaultValue={editTransaction?.note || ''} />
      </Card>

      <PrimaryButton className="animate-fade-up [animation-delay:220ms]">{isEditing ? 'Simpan perubahan' : 'Simpan transaksi'}</PrimaryButton>
    </form>
  );
}
