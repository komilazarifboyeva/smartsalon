/**
 * Chrome'da `uz-UZ` uchun oy nomlari yo'q (Intl "M09" qaytaradi),
 * shuning uchun oy nomlarini tarjima fayllaridan olamiz.
 */
export function getMonthName(t, date = new Date()) {
  return t(`common.months.${date.getMonth() + 1}`);
}

export function formatDayMonth(t, date) {
  if (!date) return '—';
  const month = getMonthName(t, date);
  return t('common.dayMonth', {
    day: date.getDate(),
    month,
    monthLower: month.toLocaleLowerCase(),
  });
}
