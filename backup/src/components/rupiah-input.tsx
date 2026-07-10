'use client';

import { useMemo, useState } from 'react';
import { formatRupiahInput } from '@/lib/utils';

type RupiahInputProps = {
  name?: string;
  initialValue?: number;
  onValueChange?: (value: number) => void;
};

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', '⌫'];

export function RupiahInput({ name = 'amount', initialValue = 0, onValueChange }: RupiahInputProps) {
  const [rawValue, setRawValue] = useState(initialValue > 0 ? String(initialValue) : '');
  const displayValue = useMemo(() => (rawValue ? formatRupiahInput(rawValue) : '0'), [rawValue]);

  function updateValue(next: string) {
    const normalized = next.replace(/^0+(?=\d)/, '');
    setRawValue(normalized);
    onValueChange?.(normalized ? Number(normalized) : 0);
  }

  function handlePress(key: string) {
    if (key === '⌫') {
      updateValue(rawValue.slice(0, -1));
      return;
    }
    updateValue(`${rawValue}${key}`);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[30px] bg-app-gradient p-5 text-white shadow-card">
        <p className="text-sm text-white/78">Nominal</p>
        <div className="mt-2 flex items-end gap-2">
          <span className="pb-1 text-base font-medium text-white/78">Rp</span>
          <h3 className="text-[38px] font-semibold tracking-tight">{displayValue}</h3>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {keys.map((key) => (
          <button key={key} type="button" onClick={() => handlePress(key)} className="rounded-[24px] bg-white px-4 py-5 text-xl font-semibold text-app-text shadow-soft transition duration-200 active:scale-[0.98]">
            {key}
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={rawValue} />
    </div>
  );
}
