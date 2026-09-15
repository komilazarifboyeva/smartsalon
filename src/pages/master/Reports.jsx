import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Clock, Inbox, Loader2, Users, Wallet } from 'lucide-react';
import MasterBookingCard from '../../components/booking/MasterBookingCard';
import { BOOKING_STATUS } from '../../constants/bookingStatus';
import { formatPrice } from '../../constants/servicePresets';
import { useAuth } from '../../hooks/useAuth';
import { listMasterBookings } from '../../services/bookingService';
import {
  dateInputToLocalDate,
  endOfLocalDay,
  firestoreToDate,
  isDateInInclusiveRange,
  toDateInputValue,
} from '../../utils/datetime';

function monthStartDateInput() {
  const now = new Date();
  return toDateInputValue(new Date(now.getFullYear(), now.getMonth(), 1));
}

function filterCompletedInRange(bookings, rangeStart, rangeEnd) {
  return bookings
    .filter((b) => {
      if (b.status !== BOOKING_STATUS.COMPLETED) return false;
      const start = firestoreToDate(b.startAt);
      return start && isDateInInclusiveRange(start, rangeStart, rangeEnd);
    })
    .sort((a, b) => {
      const ta = firestoreToDate(a.startAt)?.getTime() ?? 0;
      const tb = firestoreToDate(b.startAt)?.getTime() ?? 0;
      return ta - tb;
    });
}

function computeReportStats(completedBookings) {
  const totalMinutes = completedBookings.reduce(
    (sum, b) => sum + (Number(b.durationMinutes) || 0),
    0,
  );
  const totalPrice = completedBookings.reduce(
    (sum, b) => sum + (Number(b.servicePrice) || 0),
    0,
  );

  return {
    clientCount: completedBookings.length,
    workHours: Math.round((totalMinutes / 60) * 10) / 10,
    totalPrice,
  };
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="card flex items-start gap-4">
      <div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-950/40">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-white">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export default function MasterReports() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const locale = i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'en' ? 'en-US' : 'uz-UZ';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState(monthStartDateInput);
  const [toDate, setToDate] = useState(() => toDateInputValue(new Date()));

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

  const rangeInvalid = fromDate && toDate && fromDate > toDate;

  const completedInRange = useMemo(() => {
    if (!fromDate || !toDate || rangeInvalid) return [];

    const rangeStart = dateInputToLocalDate(fromDate);
    const rangeEnd = endOfLocalDay(toDate);
    if (!rangeStart || !rangeEnd) return [];

    return filterCompletedInRange(bookings, rangeStart, rangeEnd);
  }, [bookings, fromDate, toDate, rangeInvalid]);

  const stats = useMemo(() => {
    if (rangeInvalid || !fromDate || !toDate) return null;
    return computeReportStats(completedInRange);
  }, [completedInRange, fromDate, toDate, rangeInvalid]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <BarChart3 className="size-6 text-brand-500" />
          {t('nav.report')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white">{t('report.subtitle')}</p>
      </div>

      <div className="card flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700 dark:text-white">{t('report.fromDate')}</span>
          <input
            type="date"
            className="input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700 dark:text-white">{t('report.toDate')}</span>
          <input
            type="date"
            className="input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>
      </div>

      {rangeInvalid && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
          {t('report.invalidRange')}
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-brand-500" />
        </div>
      ) : stats && !rangeInvalid ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={Users}
              label={t('report.clientCount')}
              value={stats.clientCount}
            />
            <StatCard
              icon={Clock}
              label={t('report.workHours')}
              value={t('report.hoursValue', { hours: stats.workHours })}
            />
            <StatCard
              icon={Wallet}
              label={t('report.totalPrice')}
              value={formatPrice(stats.totalPrice)}
            />
          </div>

          {completedInRange.length === 0 ? (
            <div className="card flex flex-col items-center py-16 text-center">
              <Inbox className="size-10 text-slate-300 dark:text-white" />
              <p className="mt-4 text-sm text-slate-600 dark:text-white">{t('report.empty')}</p>
            </div>
          ) : (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-white">
                {t('report.completedSection')}
              </h2>
              {completedInRange.map((booking) => (
                <MasterBookingCard
                  key={booking.id}
                  booking={booking}
                  t={t}
                  locale={locale}
                />
              ))}
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}
