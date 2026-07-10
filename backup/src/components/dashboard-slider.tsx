'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

type DashboardSliderProps = {
  monthIncome: number;
  monthExpense: number;
  investmentValue: number;
};

type SlideItem = {
  title: string;
  value: string;
  note: string;
};

export function DashboardSlider({
  monthIncome,
  monthExpense,
  investmentValue,
}: DashboardSliderProps) {
  const slides: SlideItem[] = useMemo(
    () => [
      {
        title: 'Pemasukan',
        value: formatCurrency(monthIncome),
        note: 'Sudah tercatat di bulan berjalan.',
      },
      {
        title: 'Pengeluaran',
        value: formatCurrency(monthExpense),
        note: 'Pantau uang keluar tanpa ribet.',
      },
      {
        title: 'Investasi',
        value: formatCurrency(investmentValue),
        note: 'Reksadana dan emas lebih rapi.',
      },
    ],
    [monthIncome, monthExpense, investmentValue]
  );

  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((prev: number) => (prev + 1) % slides.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="animate-fade-up rounded-[30px] bg-app-soft p-[1px] [animation-delay:260ms]">
      <div className="rounded-[29px] bg-white px-5 py-5 shadow-soft">
        <div className="overflow-hidden rounded-[22px]">
          <div
            className="flex w-full transition-transform duration-700 ease-out will-change-transform"
            style={{ transform: `translate3d(-${active * 100}%, 0, 0)` }}
          >
            {slides.map((slide: SlideItem) => (
              <div key={slide.title} className="w-full min-w-full shrink-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-accentDark">
                  {slide.title}
                </p>

                <h3 className="mt-2 text-[30px] font-semibold tracking-tight text-app-text">
                  {slide.value}
                </h3>

                <p className="mt-1 text-sm leading-6 text-app-muted">
                  {slide.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {slides.map((slide: SlideItem, index: number) => (
            <button
              key={slide.title}
              type="button"
              aria-label={slide.title}
              onClick={() => setActive(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                active === index ? 'w-7 bg-app-accent' : 'w-2.5 bg-[#d7e8e7]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}