export function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dateInputToLocalDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if ([y, m, d].some((n) => Number.isNaN(n))) return null;
  return new Date(y, m - 1, d);
}

export function toTimeInputValue(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = timeStr.split(':').map(Number);
  if ([y, m, d, h, min].some((n) => Number.isNaN(n))) return null;
  return new Date(y, m - 1, d, h, min, 0, 0);
}

export function firestoreToDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
}

export function isSameCalendarDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  );
}

export function isBookingToday(booking) {
  const start = firestoreToDate(booking?.startAt);
  if (!start) return false;
  return isSameCalendarDay(start, new Date());
}

export function endOfLocalDay(dateStr) {
  const d = dateInputToLocalDate(dateStr);
  if (!d) return null;
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function isDateInInclusiveRange(date, rangeStart, rangeEnd) {
  if (!date || !rangeStart || !rangeEnd) return false;
  const ms = date.getTime();
  return ms >= rangeStart.getTime() && ms <= rangeEnd.getTime();
}
