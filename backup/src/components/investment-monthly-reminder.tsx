'use client';

import { useEffect, useMemo, useState } from 'react';
import { updateInvestmentMonthlyValues } from '@/app/actions';
import { formatCurrency } from '@/lib/utils';

type ReminderAsset = {
  id: number;
  assetName: string;
  assetType: string;
  totalValue: number;
};

function toDigits(value: string) {
  return value.replace(/[^\d]/g, '');
}

function formatDigits(value: string) {
  if (!value) return '';
  return new Intl.NumberFormat('id-ID').format(Number(value));
}

export function InvestmentMonthlyReminder({ assets, monthKey }: { assets: ReminderAsset[]; monthKey: string }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(() => {
    const entries = assets.map((item) => [item.id, String(Math.max(0, Math.round(item.totalValue)))]);
    return Object.fromEntries(entries) as Record<number, string>;
  });

  const doneStorageKey = useMemo(() => `investment-reminder-done-${monthKey}`, [monthKey]);

  useEffect(() => {
    if (!assets.length) return;
    const now = new Date();
    const day = now.getDate();
    if (day > 7) return;

    try {
      if (localStorage.getItem(doneStorageKey) === '1') return;
    } catch {
      // Ignore localStorage access errors.
    }

    setOpen(true);
  }, [assets.length, doneStorageKey]);

  if (!open || assets.length === 0) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#1f3438]/35 px-4">
      <div className="w-full max-w-md rounded-[28px] border border-app-line/80 bg-white p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Reminder awal bulan</p>
        <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-app-text">Update nilai investasi</h2>
        <p className="mt-2 text-sm text-app-muted">Isi nominal terbaru tiap aset untuk hitung pertumbuhan bulan ini.</p>

        <form
          action={updateInvestmentMonthlyValues}
          className="mt-4 space-y-3"
          onSubmit={() => {
            try {
              localStorage.setItem(doneStorageKey, '1');
            } catch {
              // Ignore localStorage access errors.
            }
          }}
        >
          <input type="hidden" name="monthKey" value={monthKey} />

          {assets.map((asset) => (
            <div key={asset.id} className="rounded-[20px] border border-app-line bg-[#f9fdfd] px-3 py-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-app-text">{asset.assetName}</p>
                <span className="text-[11px] font-medium uppercase tracking-wide text-app-muted">
                  {asset.assetType === 'REKSADANA' ? 'Reksadana' : 'Emas'}
                </span>
              </div>

              <p className="mb-2 text-xs text-app-muted">Saat ini: {formatCurrency(asset.totalValue)}</p>
              <input type="hidden" name="assetId" value={asset.id} />
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-app-muted">Nominal terbaru</span>
                <input
                  name={`value_${asset.id}`}
                  inputMode="numeric"
                  value={formatDigits(values[asset.id] || '')}
                  onChange={(event) => {
                    const digits = toDigits(event.target.value);
                    setValues((prev: Record<number, string>) => ({ ...prev, [asset.id]: digits }));
                  }}
                  className="h-11 w-full rounded-[16px] border border-app-line bg-white px-3 text-sm text-app-text transition duration-300 focus:border-app-accent focus:shadow-[0_0_0_4px_rgba(32,200,199,0.12)]"
                  placeholder="Contoh: 2.650.000"
                  required
                />
              </label>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-11 rounded-[16px] border border-app-line bg-white text-sm font-semibold text-app-text transition duration-300 hover:bg-[#f8fbfb]"
            >
              Nanti
            </button>
            <button
              type="submit"
              className="h-11 rounded-[16px] bg-app-accent text-sm font-semibold text-white shadow-card transition duration-300 active:scale-[0.99]"
            >
              Simpan bulan ini
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
