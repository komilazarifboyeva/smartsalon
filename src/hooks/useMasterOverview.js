import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { BOOKING_STATUS } from '../constants/bookingStatus';
import { hasMasterBillingFields, normalizeMasterBilling } from '../constants/masterBilling';
import { listMasterBookings } from '../services/bookingService';
import { ensureMasterBillingFields } from '../services/masterService';
import { firestoreToDate } from '../utils/datetime';

function isSameMonth(date, reference) {
  return (
    date.getFullYear() === reference.getFullYear()
    && date.getMonth() === reference.getMonth()
  );
}

function computeMonthStats(bookings, now) {
  return bookings.reduce(
    (acc, booking) => {
      const start = firestoreToDate(booking.startAt);
      if (!start || !isSameMonth(start, now)) return acc;

      if (booking.status === BOOKING_STATUS.COMPLETED) {
        acc.completedCount += 1;
        acc.revenue += Number(booking.servicePrice) || 0;
      } else if (booking.status === BOOKING_STATUS.CANCELLED) {
        acc.cancelledCount += 1;
      }
      return acc;
    },
    { completedCount: 0, cancelledCount: 0, revenue: 0 },
  );
}

/**
 * Master Asosiy sahifasi uchun ma'lumotlar:
 * tarif/balans/SMS — users/{uid} hujjatidan, oylik statistika — bookings'dan.
 */
export function useMasterOverview() {
  const { user, profile, refreshProfile } = useAuth();
  const uid = user?.uid;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const billingInitialized = useRef(false);

  const reload = useCallback(async () => {
    if (!uid) return;

    setLoading(true);
    setError(null);
    try {
      setBookings(await listMasterBookings(uid));
    } catch {
      setError('load');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!uid || billingInitialized.current || hasMasterBillingFields(profile)) return;

    billingInitialized.current = true;
    ensureMasterBillingFields(uid, profile)
      .then((defaults) => {
        if (defaults) refreshProfile();
      })
      .catch(() => {
        /* billing initsializatsiyasi muvaffaqiyatsiz — sahifa default qiymatlar bilan ishlaydi */
      });
  }, [uid, profile, refreshProfile]);

  const billing = useMemo(() => normalizeMasterBilling(profile), [profile]);
  const stats = useMemo(() => computeMonthStats(bookings, new Date()), [bookings]);

  return { billing, stats, loading, error, reload };
}
