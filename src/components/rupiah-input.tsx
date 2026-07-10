'use client';

import { useMemo, useState } from 'react';
import { Delete } from 'lucide-react';
import { formatRupiahInput } from '@/lib/utils';

type RupiahInputProps = {
  name?: string;
  initialValue?: number;
  onValueChange?: (value: number) => void;
};

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'delete'] as const;
const maxDigits = 13;

export function RupiahInput({ name = 'amount', initialValue = 0, onValueChange }: RupiahInputProps) {
  const [rawValue, setRawValue] = useState(initialValue > 0 ? String(Math.round(initialValue)) : '');
  const displayValue = useMemo(() => (rawValue ? formatRupiahInput(rawValue) : '0'), [rawValue]);

  function updateValue(next: string) {
    const digits = next.replace(/[^\d]/g, '').slice(0, maxDigits);
    const normalized = digits.replace(/^0+(?=\d)/, '');
    setRawValue(normalized);
    onValueChange?.(normalized ? Number(normalized) : 0);
  }

  function handlePress(key: string) {
    if (key === 'delete') {
      updateValue(rawValue.slice(0, -1));
      return;
    }

    updateValue(`${rawValue}${key}`);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] bg-app-gradient p-4 text-white shadow-card">
        <label htmlFor={`${name}-visible`} className="text-sm font-medium text-white/80">
          Nominal
        </label>
        <div className="mt-2 flex min-h-[58px] items-center gap-2 rounded-[18px] bg-white/14 px-4">
          <span className="text-base font-semibold text-white/80">Rp</span>
          <input
            id={`${name}-visible`}
            inputMode="numeric"
            value={rawValue ? displayValue : ''}
            onChange={(event) => updateValue(event.target.value)}
            placeholder="0"
            className="min-w-0 flex-1 bg-transparent text-[32px] font-semibold leading-none text-white placeholder:text-white/55"
            aria-label="Nominal rupiah"
          />
        </div>
        <p className="mt-2 text-xs leading-5 text-white/72">Ketik nominal atau gunakan keypad di bawah.</p>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handlePress(key)}
            className="flex h-14 items-center justify-center rounded-[18px] bg-white text-xl font-semibold text-app-text shadow-soft transition duration-200 active:scale-[0.98]"
            aria-label={key === 'delete' ? 'Hapus satu angka' : `Tambah ${key}`}
          >
            {key === 'delete' ? <Delete className="h-5 w-5" /> : key}
          </button>
        ))}
      </div>

      <input type="hidden" name={name} value={rawValue} />
    </div>
  );
}
