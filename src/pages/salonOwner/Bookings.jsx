import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, Inbox, Loader2 } from 'lucide-react';
import SalonOwnerBookingCard from '../../components/booking/SalonOwnerBookingCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { BOOKING_STATUS } from '../../constants/bookingStatus';
import { useAuth } from '../../hooks/useAuth';
import {
  cancelBooking,
  listSalonBookings,
} from '../../services/bookingService';

function sortByStartDesc(bookings) {
  return [...bookings].sort((a, b) => {
    const ta = a.startAt?.seconds ?? 0;
    const tb = b.startAt?.seconds ?? 0;
    return tb - ta;
  });
}

export default function SalonOwnerBookings() {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const locale = i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'en' ? 'en-US' : 'uz-UZ';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const salonId = profile?.salonId;

  const reload = useCallback(async () => {
    if (!salonId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setBookings(sortByStartDesc(await listSalonBookings(salonId)));
    } catch {
      setError(t('bookings.errors.load'));
    } finally {
      setLoading(false);
    }
  }, [salonId, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function confirmCancel() {
    if (!cancelTarget) return;
    setActingId(cancelTarget.id);
    setError(null);
    try {
      await cancelBooking(cancelTarget.id);
      setCancelTarget(null);
      await reload();
    } catch {
      setError(t('bookings.errors.cancel'));
    } finally {
      setActingId(null);
    }
  }

  const active = useMemo(
    () => bookings.filter(
      (b) => b.status !== BOOKING_STATUS.CANCELLED && b.status !== BOOKING_STATUS.COMPLETED,
    ),
    [bookings],
  );
  const history = useMemo(
    () => bookings.filter(
      (b) => b.status === BOOKING_STATUS.CANCELLED || b.status === BOOKING_STATUS.COMPLETED,
    ),
    [bookings],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <CalendarCheck className="size-6 text-brand-500" />
          {t('nav.bookings')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white">{t('bookings.ownerSubtitle')}</p>
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
          <p className="mt-4 text-sm text-slate-600 dark:text-white">{t('bookings.ownerEmpty')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-white">
                {t('bookings.active')}
              </h2>
              {active.map((booking) => (
                <SalonOwnerBookingCard
                  key={booking.id}
                  booking={booking}
                  t={t}
                  locale={locale}
                  actingId={actingId}
                  onCancel={setCancelTarget}
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
                <SalonOwnerBookingCard
                  key={booking.id}
                  booking={booking}
                  t={t}
                  locale={locale}
                  actingId={actingId}
                />
              ))}
            </section>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title={t('bookings.cancelTitle')}
        message={t('bookings.cancelConfirm', { service: cancelTarget?.serviceName ?? '' })}
        confirmLabel={t('bookings.cancel')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmCancel}
        onClose={() => setCancelTarget(null)}
        loading={actingId === cancelTarget?.id}
      />
    </div>
  );
}
