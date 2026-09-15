export function daysUntil(value) {
  if (!value) return null;
  let target;
  if (typeof value?.toDate === 'function') target = value.toDate();
  else if (value?.seconds) target = new Date(value.seconds * 1000);
  else target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;
  const ms = target.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function formatFirestoreDate(value) {
  if (!value) return '—';
  let date;
  if (typeof value?.toDate === 'function') date = value.toDate();
  else if (value?.seconds) date = new Date(value.seconds * 1000);
  else date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
