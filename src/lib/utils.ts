export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(value: number | string) {
  const amount = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatRupiahInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('id-ID').format(Number(digits));
}

export function monthLabel(date: Date | string) {
  const value = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(value);
}

export function shortDate(date: Date | string) {
  const value = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(value);
}

export function formatPercent(value: number, precision = 2) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const sign = safeValue > 0 ? '+' : safeValue < 0 ? '-' : '';
  return `${sign}${Math.abs(safeValue).toFixed(precision)}%`;
}
