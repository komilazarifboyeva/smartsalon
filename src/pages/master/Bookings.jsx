import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, Inbox, Loader2 } from 'lucide-react';
import { BOOKING_STATUS } from '../../constants/bookingStatus';
import MasterBookingCard from '../../components/booking/MasterBookingCard';
import { useAuth } from '../../hooks/useAuth';
import {
  completeBooking,
  listMasterBookings,
  startBooking,
} from '../../services/bookingService';
import {
  dateInputToLocalDate,
  firestoreToDate,
  isSameCalendarDay,
  toDateInputValue,
} from '../../utils/datetime';

function sortByStartAsc(bookings) {
  return [...bookings].sort((a, b) => {
    const ta = firestoreToDate(a.startAt)?.getTime() ?? 0;
    const tb = firestoreToDate(b.startAt)?.getTime() ?? 0;
    return ta - tb;
  });
}

export default function MasterBookings() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const locale = i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'en' ? 'en-US' : 'uz-UZ';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));

  const selectedDay = useMemo(
    () => dateInputToLocalDate(selectedDate) ?? new Date(),
    [selectedDate],
  );

  const reload = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      setBookings(await listMasterBookings(user.uid));
    } catch {
      setError(t('bookings.errors.load'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleStart(booking) {
    setActingId(booking.id);
    setError(null);
    try {
      await startBooking(booking.id);
      await reload();
    } catch {
      setError(t('bookings.errors.action'));
    } finally {
      setActingId(null);
    }
  }

  async function handleComplete(booking) {
    setActingId(booking.id);
    setError(null);
    try {
      await completeBooking(booking.id);
      await reload();
    } catch {
      setError(t('bookings.errors.action'));
    } finally {
      setActingId(null);
    }
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const start = firestoreToDate(b.startAt);
      return start && isSameCalendarDay(start, selectedDay);
    });
  }, [bookings, selectedDay]);

  const active = sortByStartAsc(
    filteredBookings.filter(
      (b) => b.status === BOOKING_STATUS.PENDING || b.status === BOOKING_STATUS.IN_PROGRESS,
    ),
  );
  const history = sortByStartAsc(
    filteredBookings.filter(
      (b) => b.status === BOOKING_STATUS.COMPLETED || b.status === BOOKING_STATUS.CANCELLED,
    ),
  );

  const isToday = isSameCalendarDay(selectedDay, new Date());

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <CalendarCheck className="size-6 text-brand-500" />
          {t('nav.bookings')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white">{t('bookings.masterSubtitle')}</p>
      </div>

      <div className="card">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700 dark:text-white">{t('bookings.pickDate')}</span>
          <input
            type="date"
            className="input max-w-xs"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-brand-500" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Inbox className="size-10 text-slate-300 dark:text-white" />
          <p className="mt-4 text-sm text-slate-600 dark:text-white">{t('bookings.masterEmpty')}</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Inbox className="size-10 text-slate-300 dark:text-white" />
          <p className="mt-4 text-sm text-slate-600 dark:text-white">
            {isToday ? t('bookings.emptyToday') : t('bookings.emptyDay')}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-white">
                {t('bookings.active')}
              </h2>
              {active.map((booking) => (
                <MasterBookingCard
                  key={booking.id}
                  booking={booking}
                  t={t}
                  locale={locale}
                  actingId={actingId}
                  onStart={handleStart}
                  onComplete={handleComplete}
                />
              ))}
            </section>
          )}
          {history.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-white">
                {t('bookings.history')}
              </h2>
              {history.map((booking) => (
                <MasterBookingCard
                  key={booking.id}
                  booking={booking}
                  t={t}
                  locale={locale}
                  actingId={actingId}
                  onStart={handleStart}
                  onComplete={handleComplete}
                />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
