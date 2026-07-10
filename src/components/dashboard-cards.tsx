'use client'; // Wajib ada karena kita menggunakan hooks React

import React, { useRef, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

type HeaderBlockProps = {
  monthLabel: string;
};

type HeroBalanceProps = {
  totalAssets: number;
  mainBalance: number;
  investmentValue: number;
};

type SummaryCardsProps = {
  monthIncome: number;
  monthExpense: number;
  monthInvestment: number;
};

// --- KOMPONEN CURRENCY TEXT YANG BARU ---
function CurrencyText({
  value,
  variant = 'card',
}: {
  value: number;
  variant?: 'hero' | 'card' | 'small';
}) {
  const text = formatCurrency(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const sizeClass =
    variant === 'hero'
      ? 'text-[clamp(1.7rem,6vw,3.25rem)]'
      : variant === 'small'
      ? 'text-[clamp(1rem,3.2vw,1.75rem)]'
      : 'text-[clamp(1.4rem,4.6vw,2.75rem)]';

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;

    if (!container || !textEl) return;

    const fitText = () => {
      // 1. Reset scale ke 1 untuk mengukur lebar asli teks
      textEl.style.transform = 'scale(1)';
      
      const containerWidth = container.clientWidth;
      const textWidth = textEl.scrollWidth;

      // 2. Jika lebar teks melebihi container, kita kecilkan dengan scale
      if (textWidth > containerWidth && containerWidth > 0) {
        // Sedikit dikurangi (dikali 0.98) agar tidak terlalu mepet dengan tepi
        const scale = (containerWidth / textWidth) * 0.98;
        textEl.style.transform = `scale(${scale})`;
      }
    };

    // Jalankan saat pertama render
    fitText();

    // Jalankan ulang jika layar/kartu berubah ukuran
    const observer = new ResizeObserver(() => {
      fitText();
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [text]); // Re-run effect ini kalau value (angka uang) berubah

  return (
    <div ref={containerRef} className="w-full min-w-0 overflow-hidden flex items-center">
      <div
        ref={textRef}
        // origin-left memastikan saat dikecilkan, teksnya tetap rata kiri
        // inline-block wajib agar kita bisa membaca scrollWidth yang akurat
        className={`inline-block origin-left whitespace-nowrap font-semibold leading-tight tracking-tight text-app-text ${sizeClass}`}
      >
        {text}
      </div>
    </div>
  );
}
// ----------------------------------------

export function HeaderBlock({ monthLabel }: HeaderBlockProps) {
  return (
    <section className="animate-fade-up rounded-[32px] bg-gradient-to-br from-[#18b7bd] via-[#38c7c6] to-[#7eddd5] px-5 pb-6 pt-5 text-white shadow-[0_20px_60px_rgba(34,197,194,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">
          Ringkasan
        </p>
        <img
          src="/logo.png"
          alt="Logo Dompetku"
          className="h-11 w-11 rounded-xl border border-white/30 bg-white/90 p-1.5 shadow-[0_8px_22px_rgba(8,44,48,0.18)]"
        />
      </div>
      <h1 className="mt-2 text-[30px] font-semibold tracking-tight">
        Keuangan Bulanan
      </h1>
      <p className="mt-1 text-sm text-white/85">{monthLabel}</p>
    </section>
  );
}

export function HeroBalance({
  totalAssets,
  mainBalance,
  investmentValue,
}: HeroBalanceProps) {
  return (
    <section className="grid gap-4">
      <div
        data-onboarding-id="onboard-total-assets"
        className="animate-fade-up rounded-[30px] border border-[#d9eceb] bg-white p-5 shadow-soft [animation-delay:80ms]"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-app-accentDark">
          Total Aset
        </p>

        <div className="mt-3 min-w-0">
          <CurrencyText value={totalAssets} variant="hero" />
        </div>

        <p className="mt-2 text-sm text-app-muted">
          Gabungan dompet utama dan seluruh investasi.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="animate-fade-up rounded-[28px] border border-[#d9eceb] bg-white p-5 shadow-soft [animation-delay:120ms]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-accentDark">
            Dompet Utama
          </p>

          <div className="mt-3 min-w-0">
            <CurrencyText value={mainBalance} variant="card" />
          </div>

          <p className="mt-2 text-sm leading-6 text-app-muted">
            Saldo aktif untuk pemasukan dan pengeluaran.
          </p>
        </div>

        <div className="animate-fade-up rounded-[28px] border border-[#d9eceb] bg-white p-5 shadow-soft [animation-delay:160ms]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-accentDark">
            Investasi
          </p>

          <div className="mt-3 min-w-0">
            <CurrencyText value={investmentValue} variant="card" />
          </div>

          <p className="mt-2 text-sm leading-6 text-app-muted">
            Akumulasi reksadana dan emas.
          </p>
        </div>
      </div>
    </section>
  );
}

export function SummaryCards({
  monthIncome,
  monthExpense,
  monthInvestment,
}: SummaryCardsProps) {
  const items = [
    {
      label: 'Pemasukan',
      value: monthIncome,
      tone: 'bg-[#effbfb]',
    },
    {
      label: 'Pengeluaran',
      value: monthExpense,
      tone: 'bg-[#fff7f2]',
    },
    {
      label: 'Investasi',
      value: monthInvestment,
      tone: 'bg-[#f7fbef]',
    },
  ];

  return (
    <section className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`animate-fade-up min-w-0 rounded-[24px] p-4 shadow-soft ${item.tone}`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-app-accentDark">
            {item.label}
          </p>

          <div className="mt-2 min-w-0">
            <CurrencyText value={item.value} variant="small" />
          </div>
        </div>
      ))}
    </section>
  );
}
