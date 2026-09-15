import { WEEKDAY_KEYS } from '../constants/workingHours';
import { ACTIVE_BOOKING_STATUSES } from '../constants/bookingStatus';

const JS_DAY_TO_KEY = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function weekdayKeyFromDate(date) {
  return JS_DAY_TO_KEY[date.getDay()];
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

function isActiveBooking(booking) {
  return ACTIVE_BOOKING_STATUSES.includes(booking.status);
}

function bookingConflicts(booking, slotStart, slotEnd, masterId) {
  if (!isActiveBooking(booking)) return false;

  const bookingStart = toDate(booking.startAt);
  const bookingEnd = toDate(booking.endAt);
  if (!bookingStart || !bookingEnd) return false;
  if (!overlaps(slotStart, slotEnd, bookingStart, bookingEnd)) return false;

  const bookingMasterId = booking.masterId ?? null;
  const targetMasterId = masterId ?? null;

  if (targetMasterId) {
    return bookingMasterId === targetMasterId;
  }

  return bookingMasterId === null;
}

export function generateTimeSlots({
  date,
  workingHours,
  durationMinutes,
  existingBookings = [],
  masterId = null,
  slotStepMinutes = 15,
}) {
  if (!date || !workingHours || !durationMinutes) return [];

  const weekdayKey = weekdayKeyFromDate(date);
  if (!WEEKDAY_KEYS.includes(weekdayKey)) return [];

  const day = workingHours[weekdayKey];
  if (!day || day.closed) return [];

  const openMinutes = parseTimeToMinutes(day.open);
  const closeMinutes = parseTimeToMinutes(day.close);
  if (openMinutes == null || closeMinutes == null || openMinutes >= closeMinutes) return [];

  const now = new Date();
  const slots = [];

  for (let startMin = openMinutes; startMin + durationMinutes <= closeMinutes; startMin += slotStepMinutes) {
    const slotStart = new Date(date);
    slotStart.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0);

    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60_000);

    if (slotStart <= now) continue;

    const conflict = existingBookings.some((booking) =>
      bookingConflicts(booking, slotStart, slotEnd, masterId),
    );

    if (!conflict) {
      slots.push({ start: slotStart, end: slotEnd });
    }
  }

  return slots;
}

export function formatSlotTime(date, locale = 'uz-UZ') {
  return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

export function formatSlotDate(date, locale = 'uz-UZ') {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
