import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Phone,
  Play,
  Scissors,
  User,
} from 'lucide-react';
import { BOOKING_STATUS } from '../../constants/bookingStatus';
import { formatPrice } from '../../constants/servicePresets';
import { formatSlotDate, formatSlotTime } from '../../utils/availability';
import { firestoreToDate } from '../../utils/datetime';
import { PHONE_DISPLAY_PREFIX } from '../../utils/phone';

function formatDisplayPhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length >= 12 && digits.startsWith('998')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`.trim();
  }
  return phone.startsWith('+') ? phone : `${PHONE_DISPLAY_PREFIX}${phone}`;
}

function statusClass(status) {
  if (status === BOOKING_STATUS.COMPLETED) return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  if (status === BOOKING_STATUS.IN_PROGRESS) return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
  if (status === BOOKING_STATUS.CANCELLED) return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-white border-slate-200 dark:border-slate-700';
  return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
}

export default function MasterBookingCard({
  booking,
  t,
  locale,
  onStart,
  onComplete,
  actingId,
}) {
  const start = firestoreToDate(booking.startAt);
  const end = firestoreToDate(booking.endAt);
  const phoneDisplay = formatDisplayPhone(booking.customerPhone);
  const isPending = booking.status === BOOKING_STATUS.PENDING;
  const isInProgress = booking.status === BOOKING_STATUS.IN_PROGRESS;
  const busy = actingId === booking.id;

  return (
    <article className="card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">{booking.serviceName}</h3>
          <p className="text-sm text-slate-600 dark:text-white">{booking.salonName}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass(booking.status)}`}>
          {t(`bookings.status.${booking.status}`, { defaultValue: booking.status })}
        </span>
      </div>

      <div className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-4 space-y-2 dark:border-brand-900/50 dark:from-slate-950/80 dark:to-slate-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white">
          {t('bookings.customerInfo')}
        </p>
        <p className="inline-flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <User className="size-4 text-brand-500" />
          {booking.customerName ?? t('bookings.customerFallback')}
        </p>
        <p className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-white">
          <Phone className="size-4 text-brand-500" />
          {phoneDisplay ? (
            <a href={`tel:${phoneDisplay.replace(/\s/g, '')}`} className="hover:text-brand-600">
              {phoneDisplay}
            </a>
          ) : (
            <span className="text-slate-400 dark:text-white">{t('customer.salonProfile.noPhone')}</span>
          )}
        </p>
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

      <p className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
        <Scissors className="size-4" />
        {formatPrice(booking.servicePrice)}
      </p>

      {(isPending || isInProgress) && (onStart || onComplete) && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {isPending && onStart && (
            <button
              type="button"
              className="btn-primary text-xs inline-flex items-center gap-1.5"
              disabled={busy}
              onClick={() => onStart(booking)}
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
              {t('bookings.start')}
            </button>
          )}
          {isInProgress && onComplete && (
            <button
              type="button"
              className="btn-primary text-xs inline-flex items-center gap-1.5"
              disabled={busy}
              onClick={() => onComplete(booking)}
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              {t('bookings.finish')}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
