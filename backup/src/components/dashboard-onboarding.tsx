'use client';

import { useEffect, useMemo, useState } from 'react';

type OnboardingStep = {
  targetId: string;
  title: string;
  description: string;
};

const ONBOARDING_DONE_KEY = 'dompetku_onboarding_v1_done';
const ONBOARDING_SKIP_AUTO_KEY = 'dompetku_onboarding_v1_skip_auto';

const STEPS: OnboardingStep[] = [
  {
    targetId: 'onboard-total-assets',
    title: 'Ini ringkasan aset Anda',
    description: 'Bagian ini menampilkan total aset gabungan. Cukup cek di sini untuk tahu posisi keuangan Anda hari ini.',
  },
  {
    targetId: 'onboard-nav-catat',
    title: 'Tekan Catat untuk input transaksi',
    description: 'Untuk pemasukan atau pengeluaran harian, mulai dari menu Catat agar data langsung masuk ke laporan.',
  },
  {
    targetId: 'onboard-nav-investasi',
    title: 'Pantau pertumbuhan di Investasi',
    description: 'Menu Investasi dipakai untuk melihat nilai terbaru aset dan pertumbuhan setiap bulannya.',
  },
  {
    targetId: 'onboard-nav-statistik',
    title: 'Lihat ringkasan di Statistik',
    description: 'Jika ingin lihat tren per bulan, buka Statistik. Cocok untuk evaluasi pengeluaran dan target tabungan.',
  },
];

function getTargetRect(targetId: string) {
  const element = document.querySelector(`[data-onboarding-id="${targetId}"]`) as HTMLElement | null;
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return {
    top: Math.max(rect.top - 8, 8),
    left: Math.max(rect.left - 8, 8),
    width: rect.width + 16,
    height: rect.height + 16,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function DashboardOnboarding() {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [skipAuto, setSkipAuto] = useState(false);
  const [targetRect, setTargetRect] = useState(null as {
    top: number;
    left: number;
    width: number;
    height: number;
  } | null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const step = STEPS[stepIndex];

  const refreshTarget = () => {
    if (!open) return;
    setViewport({ width: window.innerWidth, height: window.innerHeight });
    setTargetRect(getTargetRect(step.targetId));
  };

  useEffect(() => {
    try {
      const done = localStorage.getItem(ONBOARDING_DONE_KEY) === '1';
      const skip = localStorage.getItem(ONBOARDING_SKIP_AUTO_KEY) === '1';
      if (!done && !skip) {
        setOpen(true);
        setStepIndex(0);
      }
    } catch {
      // Ignore localStorage access errors.
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    refreshTarget();

    const listener = () => refreshTarget();
    window.addEventListener('resize', listener);
    window.addEventListener('scroll', listener, true);
    return () => {
      window.removeEventListener('resize', listener);
      window.removeEventListener('scroll', listener, true);
    };
  }, [open, stepIndex]);

  const tooltipStyle = useMemo(() => {
    const maxWidth = Math.min(360, Math.max(300, viewport.width - 24));
    const width = maxWidth;

    if (!targetRect) {
      return {
        width,
        left: clamp((viewport.width - width) / 2, 12, Math.max(12, viewport.width - width - 12)),
        top: clamp((viewport.height - 260) / 2, 14, Math.max(14, viewport.height - 280)),
      };
    }

    const left = clamp(targetRect.left + targetRect.width / 2 - width / 2, 12, Math.max(12, viewport.width - width - 12));
    const prefersBottom = targetRect.top < viewport.height * 0.55;
    const top = prefersBottom
      ? clamp(targetRect.top + targetRect.height + 12, 14, Math.max(14, viewport.height - 280))
      : clamp(targetRect.top - 238, 14, Math.max(14, viewport.height - 280));

    return { width, left, top };
  }, [targetRect, viewport.height, viewport.width]);

  const closeTutorial = (completed: boolean) => {
    setOpen(false);
    setStepIndex(0);
    try {
      if (completed) localStorage.setItem(ONBOARDING_DONE_KEY, '1');
      if (skipAuto) localStorage.setItem(ONBOARDING_SKIP_AUTO_KEY, '1');
    } catch {
      // Ignore localStorage access errors.
    }
  };

  const nextStep = () => {
    if (stepIndex >= STEPS.length - 1) {
      closeTutorial(true);
      return;
    }
    setStepIndex((prev: number) => prev + 1);
  };

  const openManual = () => {
    setOpen(true);
    setStepIndex(0);
    setSkipAuto(false);
  };

  return (
    <>
      <div className="animate-fade-up [animation-delay:35ms]">
        <button
          type="button"
          onClick={openManual}
          className="h-11 rounded-[16px] border border-[#bfdada] bg-[#eef8f8] px-4 text-sm font-semibold text-[#195f66] transition duration-300 hover:bg-[#e4f4f4]"
        >
          Lihat tutorial lagi
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[95]">
          {targetRect ? (
            <div
              className="pointer-events-none fixed rounded-[24px] border-2 border-[#83efe4]"
              style={{
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
                boxShadow: '0 0 0 9999px rgba(8, 29, 33, 0.62)',
              }}
            />
          ) : (
            <div className="pointer-events-none fixed inset-0 bg-[rgba(8,29,33,0.62)]" />
          )}

          <div
            className="fixed rounded-[24px] border border-[#d2e8e8] bg-white p-4 shadow-[0_18px_38px_rgba(9,37,42,0.25)]"
            style={{
              width: tooltipStyle.width,
              left: tooltipStyle.left,
              top: tooltipStyle.top,
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5b8187]">
              Panduan {stepIndex + 1}/{STEPS.length}
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-app-text">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#48656a]">{step.description}</p>

            <label className="mt-4 flex items-center gap-2 text-[13px] font-medium text-[#48656a]">
              <input
                type="checkbox"
                checked={skipAuto}
                onChange={(event) => setSkipAuto(event.target.checked)}
                className="h-4 w-4 rounded border border-[#a6c8c9] accent-[#22b8b7]"
              />
              Jangan tampilkan otomatis lagi
            </label>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => closeTutorial(false)}
                className="h-11 rounded-[14px] border border-[#d6e5e5] bg-white text-sm font-semibold text-[#48656a] transition duration-300 hover:bg-[#f6fbfb]"
              >
                Lewati
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="h-11 rounded-[14px] bg-app-accent text-sm font-semibold text-white shadow-card transition duration-300 active:scale-[0.99]"
              >
                {stepIndex === STEPS.length - 1 ? 'Selesai' : 'Lanjut'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
