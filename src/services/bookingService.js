import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { BOOKING_STATUS } from '../constants/bookingStatus';

const BOOKINGS_COLLECTION = 'bookings';

export function bookingsRef() {
  return collection(db, BOOKINGS_COLLECTION);
}

export function bookingRef(bookingId) {
  return doc(db, BOOKINGS_COLLECTION, bookingId);
}

function mapBookingDocs(snap) {
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

function bookingStartMs(booking) {
  const value = booking.startAt;
  if (!value) return 0;
  if (typeof value.toDate === 'function') return value.toDate().getTime();
  return new Date(value).getTime();
}

function sortByStartDesc(bookings) {
  return [...bookings].sort((a, b) => bookingStartMs(b) - bookingStartMs(a));
}

async function runBookingQuery(withOrderBy, fallbackQuery) {
  try {
    const snap = await getDocs(withOrderBy);
    return mapBookingDocs(snap);
  } catch (err) {
    if (err?.code !== 'failed-precondition') throw err;
    const snap = await getDocs(fallbackQuery);
    return sortByStartDesc(mapBookingDocs(snap));
  }
}

function dayRange(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start: Timestamp.fromDate(start), end: Timestamp.fromDate(end) };
}

export async function listBookingsForSalonDay(salonId, date) {
  if (!salonId || !date) return [];

  const { start, end } = dayRange(date);
  const withOrder = query(
    bookingsRef(),
    where('salonId', '==', salonId),
    where('startAt', '>=', start),
    where('startAt', '<=', end),
  );

  try {
    const snap = await getDocs(withOrder);
    return mapBookingDocs(snap);
  } catch (err) {
    if (err?.code !== 'failed-precondition') throw err;
    const snap = await getDocs(query(bookingsRef(), where('salonId', '==', salonId)));
    const dayStart = start.toDate().getTime();
    const dayEnd = end.toDate().getTime();
    return mapBookingDocs(snap).filter((booking) => {
      const ms = bookingStartMs(booking);
      return ms >= dayStart && ms <= dayEnd;
    });
  }
}

export async function createBooking({
  salonId,
  salonName,
  customerId,
  customerName,
  customerPhone,
  masterId,
  masterName,
  serviceId,
  serviceName,
  servicePrice,
  durationMinutes,
  startAt,
}) {
  if (!salonId || !customerId || !serviceId || !startAt || !durationMinutes) {
    throw new Error('INVALID_BOOKING');
  }

  const startDate = startAt instanceof Date ? startAt : new Date(startAt);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);

  const payload = {
    salonId,
    salonName: salonName ?? null,
    customerId,
    customerName: customerName ?? null,
    customerPhone: customerPhone ?? null,
    masterId: masterId ?? null,
    masterName: masterName ?? null,
    serviceId,
    serviceName,
    servicePrice: Number(servicePrice),
    durationMinutes: Number(durationMinutes),
    startAt: Timestamp.fromDate(startDate),
    endAt: Timestamp.fromDate(endDate),
    status: BOOKING_STATUS.PENDING,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(bookingsRef(), payload);
  return { id: ref.id, ...payload };
}

export async function listCustomerBookings(customerId) {
  if (!customerId) return [];

  return runBookingQuery(
    query(
      bookingsRef(),
      where('customerId', '==', customerId),
      orderBy('startAt', 'desc'),
    ),
    query(bookingsRef(), where('customerId', '==', customerId)),
  );
}

export async function listMasterBookings(masterId) {
  if (!masterId) return [];

  return runBookingQuery(
    query(
      bookingsRef(),
      where('masterId', '==', masterId),
      orderBy('startAt', 'desc'),
    ),
    query(bookingsRef(), where('masterId', '==', masterId)),
  );
}

export async function listSalonBookings(salonId) {
  if (!salonId) return [];

  return runBookingQuery(
    query(
      bookingsRef(),
      where('salonId', '==', salonId),
      orderBy('startAt', 'desc'),
    ),
    query(bookingsRef(), where('salonId', '==', salonId)),
  );
}

export async function updateBookingDateTime(bookingId, { startAt, durationMinutes }) {
  const startDate = startAt instanceof Date ? startAt : new Date(startAt);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);

  await updateDoc(bookingRef(bookingId), {
    startAt: Timestamp.fromDate(startDate),
    endAt: Timestamp.fromDate(endDate),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBooking(bookingId) {
  await deleteDoc(bookingRef(bookingId));
}

export async function startBooking(bookingId) {
  await updateDoc(bookingRef(bookingId), {
    status: BOOKING_STATUS.IN_PROGRESS,
    startedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function completeBooking(bookingId) {
  await updateDoc(bookingRef(bookingId), {
    status: BOOKING_STATUS.COMPLETED,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function cancelBooking(bookingId) {
  await updateDoc(bookingRef(bookingId), {
    status: BOOKING_STATUS.CANCELLED,
    updatedAt: serverTimestamp(),
  });
}

export async function confirmBooking(bookingId) {
  await updateDoc(bookingRef(bookingId), {
    status: BOOKING_STATUS.CONFIRMED,
    updatedAt: serverTimestamp(),
  });
}

export function getBookingErrorKey(err) {
  const code = err?.code ?? '';
  if (code === 'permission-denied') return 'permission';
  if (code === 'failed-precondition') return 'index';
  return 'load';
}
