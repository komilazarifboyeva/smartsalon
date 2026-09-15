import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import { combineDateAndTime, firestoreToDate, toDateInputValue, toTimeInputValue } from '../../utils/datetime';

function BookingEditForm({ booking, onClose, onSave, saving }) {
  const { t } = useTranslation();
  const start = firestoreToDate(booking.startAt);
  const [date, setDate] = useState(() => (start ? toDateInputValue(start) : ''));
  const [time, setTime] = useState(() => (start ? toTimeInputValue(start) : ''));
  const [error, setError] = useState(null);

  const minDate = useMemo(() => toDateInputValue(new Date()), []);
  const maxDate = useMemo(() => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    return toDateInputValue(future);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const startAt = combineDateAndTime(date, time);
    if (!startAt || startAt.getTime() <= Date.now()) {
      setError(t('bookings.errors.pastTime'));
      return;
    }
    onSave({ startAt, durationMinutes: booking.durationMinutes });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700 dark:text-white">{t('bookings.flow.pickDate')}</span>
          <input
            type="date"
            min={minDate}
            max={maxDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-slate-700"
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700 dark:text-white">{t('bookings.flow.pickTime')}</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-slate-700"
            required
          />
        </label>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {t('common.save')}
        </button>
      </div>
    </form>
  );
}

export default function BookingEditModal({ open, booking, onClose, onSave, saving }) {
  const { t } = useTranslation();
  const formKey = booking ? `${booking.id}-${booking.startAt?.seconds ?? booking.startAt}` : 'empty';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('bookings.editTitle')}
      subtitle={booking?.serviceName}
      size="md"
      hideClose={saving}
    >
      {booking && (
        <BookingEditForm
          key={formKey}
          booking={booking}
          onClose={onClose}
          onSave={onSave}
          saving={saving}
        />
      )}
    </Modal>
  );
}
