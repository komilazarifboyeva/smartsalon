export const PRICE_PRESETS = [50_000, 100_000, 150_000, 200_000];

export const DURATION_PRESETS = [
  { key: '20', minutes: 20 },
  { key: '30', minutes: 30 },
  { key: '40', minutes: 40 },
  { key: '60', minutes: 60 },
  { key: '120', minutes: 120 },
  { key: '120plus', minutes: 150 },
];

export function formatPrice(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  // uz-UZ Intl formati minglarni vergul bilan ajratadi, bizga bo'sh joy kerak.
  const grouped = Math.abs(Math.round(Number(amount)))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const sign = Number(amount) < 0 ? '-' : '';
  return `${sign}${grouped} so'm`;
}

export function getDurationPreset(presetKey) {
  return DURATION_PRESETS.find((item) => item.key === presetKey) ?? null;
}
