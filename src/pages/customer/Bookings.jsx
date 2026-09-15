import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Calendar,
  Clock,
  Inbox,
  Loader2,
  Pencil,
  Scissors,
  Trash2,
  User,
} from 'lucide-react';
import BookingEditModal from '../../components/booking/BookingEditModal';
import BookingFilterBar from '../../components/booking/BookingFilterBar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { BOOKING_STATUS } from '../../constants/bookingStatus';
import { formatPrice } from '../../constants/servicePresets';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import {
  deleteBooking,
  getBookingErrorKey,
  listCustomerBookings,
  updateBookingDateTime,
} from '../../services/bookingService';
import { formatSlotDate, formatSlotTime } from '../../utils/availability';
import { firestoreToDate, isBookingToday } from '../../utils/datetime';

function statusClass(status) {
  if (status === BOOKING_STATUS.COMPLETED) return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  if (status === BOOKING_STATUS.IN_PROGRESS) return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
  if (status === BOOKING_STATUS.CANCELLED) return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-white border-slate-200 dark:border-slate-700';
  return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
}

function canEditBooking(booking) {
  return booking.status === BOOKING_STATUS.PENDING;
}

function BookingCard({
  booking,
  t,
  locale,
  onEdit,
  onDelete,
  acting,
}) {
  const start = firestoreToDate(booking.startAt);
  const end = firestoreToDate(booking.endAt);
  const editable = canEditBooking(booking);

  return (
    <article className="card space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">{booking.salonName ?? 'Salon'}</h3>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-white">{booking.serviceName}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass(booking.status)}`}>
          {t(`bookings.status.${booking.status}`, { defaultValue: booking.status })}
        </span>
      </div>

      {start && (
        <div className="space-y-1 text-sm text-slate-600 dark:text-white">
          <p className="inline-flex items-center gap-1.5">
            <Calendar className="size-4 text-brand-500" />
            {formatSlotDate(start, locale)}
          </p>
          <p className="inline-flex items-center gap-1.5">
            <Clock className="size-4 text-brand-500" />
            {formatSlotTime(start, locale)}
            {end ? ` — ${formatSlotTime(end, locale)}` : ''}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-white">
        {booking.masterName && (
          <span className="inline-flex items-center gap-1">
            <User className="size-4" />
            {booking.masterName}
          </span>
        )}
        <span className="inline-flex items-center gap-1 font-semibold text-brand-600">
          <Scissors className="size-4" />
          {formatPrice(booking.servicePrice)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        {editable && (
          <>
            <button
              type="button"
              className="btn-secondary text-xs inline-flex items-center gap-1.5"
              disabled={acting}
              onClick={() => onEdit(booking)}
            >
              <Pencil className="size-3.5" />
              {t('common.edit')}
            </button>
            <button
              type="button"
              className="btn-secondary text-xs inline-flex items-center gap-1.5 text-red-600 hover:border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950/40"
              disabled={acting}
              onClick={() => onDelete(booking)}
            >
              <Trash2 className="size-3.5" />
              {t('common.delete')}
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export default function CustomerBookings() {
  const { t, i18n } = useTranslation();
  const { user, isBootstrapped } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const locale = i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'en' ? 'en-US' : 'uz-UZ';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [acting, setActing] = useState(false);
  const [flash, setFlash] = useState(location.state?.bookingCreated ?? false);
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (location.state?.bookingCreated) {
      setFlash(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const reload = useCallback(async () => {
    if (!isBootstrapped) return;

    if (!user?.uid) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setBookings(await listCustomerBookings(user.uid));
    } catch (err) {
      const key = getBookingErrorKey(err);
      setError(t(`bookings.errors.${key}`));
    } finally {
      setLoading(false);
    }
  }, [user, isBootstrapped, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleSaveEdit({ startAt, durationMinutes }) {
    if (!editTarget) return;
    setActing(true);
    setError(null);
    try {
      await updateBookingDateTime(editTarget.id, { startAt, durationMinutes });
      setEditTarget(null);
      await reload();
    } catch {
      setError(t('bookings.errors.update'));
    } finally {
      setActing(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setActing(true);
    setError(null);
    try {
      await deleteBooking(deleteTarget.id);
      setDeleteTarget(null);
      await reload();
    } catch {
      setError(t('bookings.errors.delete'));
    } finally {
      setActing(false);
    }
  }

  const filteredBookings = useMemo(() => {
    if (dateFilter === 'today') {
      return bookings.filter(isBookingToday);
    }
    return bookings;
  }, [bookings, dateFilter]);

  const active = filteredBookings.filter(
    (b) => b.status !== BOOKING_STATUS.CANCELLED && b.status !== BOOKING_STATUS.COMPLETED,
  );
  const history = filteredBookings.filter(
    (b) => b.status === BOOKING_STATUS.CANCELLED || b.status === BOOKING_STATUS.COMPLETED,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <CalendarCheck className="size-6 text-brand-500" />
          {t('nav.bookings')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white">{t('bookings.customerSubtitle')}</p>
      </div>

      {flash && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
          {t('bookings.createSuccess')}
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      {!loading && bookings.length > 0 && (
        <BookingFilterBar value={dateFilter} onChange={setDateFilter} />
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-brand-500" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Inbox className="size-10 text-slate-300 dark:text-white" />
          <p className="mt-4 text-sm text-slate-600 dark:text-white">{t('bookings.empty')}</p>
          <Link to={ROUTES.ME.DASHBOARD} className="btn-primary mt-4 text-sm">
            {t('bookings.browseSalons')}
          </Link>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Inbox className="size-10 text-slate-300 dark:text-white" />
          <p className="mt-4 text-sm text-slate-600 dark:text-white">{t('bookings.emptyToday')}</p>
          <button
            type="button"
            className="btn-secondary mt-4 text-sm"
            onClick={() => setDateFilter('all')}
          >
            {t('bookings.filterAll')}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-white">
                {t('bookings.upcoming')}
              </h2>
              {active.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  t={t}
                  locale={locale}
                  acting={acting}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </section>
          )}
          {history.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-white">
                {t('bookings.past')}
              </h2>
              {history.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  t={t}
                  locale={locale}
                  acting={acting}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </section>
          )}
          {active.length === 0 && history.length === 0 && (
            <section className="space-y-3">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  t={t}
                  locale={locale}
                  acting={acting}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </section>
          )}
        </div>
      )}

      <BookingEditModal
        open={Boolean(editTarget)}
        booking={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSaveEdit}
        saving={acting}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('bookings.deleteTitle')}
        message={t('bookings.deleteConfirm', { service: deleteTarget?.serviceName ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
        loading={acting}
      />
    </div>
  );
}
