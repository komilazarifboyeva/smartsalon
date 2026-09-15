import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Loader2, Scissors } from 'lucide-react';
import { formatPrice } from '../../constants/servicePresets';
import { createBooking, getBookingErrorKey } from '../../services/bookingService';
import { combineDateAndTime, toDateInputValue } from '../../utils/datetime';

function ServicePickCard({ service, selected, onSelect, t }) {
  const durationKey = service.durationPreset ?? String(service.durationMinutes);
  const durationLabel = t(`services.durationPresets.${durationKey}`, {
    defaultValue: `${service.durationMinutes} min`,
  });

  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      className={`w-full rounded-xl border p-3 text-left transition-colors ${
        selected
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 ring-1 ring-brand-400'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40">
          <Scissors className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-white">{service.name}</p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-white">
            <Clock className="size-3.5" />
            {durationLabel}
          </p>
          <p className="mt-1 font-bold text-brand-600">{formatPrice(service.price)}</p>
        </div>
      </div>
    </button>
  );
}

export default function InlineBookingPanel({
  salon,
  services,
  master,
  customer,
  onSuccess,
}) {
  const { t } = useTranslation();

  const singleService = services.length === 1 ? services[0].service : null;
  const [selectedService, setSelectedService] = useState(null);
  const activeService = selectedService ?? singleService;
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const minDate = useMemo(() => toDateInputValue(new Date()), []);
  const maxDate = useMemo(() => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    return toDateInputValue(future);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!activeService || !selectedDate || !selectedTime || !customer?.uid || !salon?.id) return;

    const startAt = combineDateAndTime(selectedDate, selectedTime);
    if (!startAt || startAt.getTime() <= Date.now()) {
      setError(t('bookings.errors.pastTime'));
      return;
    }

    const entry = services.find((s) => s.service.id === activeService.id);
    const bookingMaster = entry?.master ?? master ?? null;

    setSubmitting(true);
    setError(null);
    try {
      await createBooking({
        salonId: salon.id,
        salonName: salon.name ?? salon.ownerUsername ?? null,
        customerId: customer.uid,
        customerName: [customer.firstName, customer.lastName].filter(Boolean).join(' ') || null,
        customerPhone: customer.phone ?? null,
        masterId: bookingMaster?.uid ?? null,
        masterName: bookingMaster
          ? [bookingMaster.firstName, bookingMaster.lastName].filter(Boolean).join(' ')
            || bookingMaster.username
          : null,
        serviceId: activeService.id,
        serviceName: activeService.name,
        servicePrice: activeService.price,
        durationMinutes: activeService.durationMinutes,
        startAt,
      });
      onSuccess?.();
    } catch (err) {
      const key = getBookingErrorKey(err);
      setError(t(`bookings.errors.${key === 'load' ? 'create' : key}`));
    } finally {
      setSubmitting(false);
    }
  }

  if (services.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
        {t('customer.salonProfile.noServices')}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 border-2 border-brand-100 dark:border-brand-900/50">
      <h3 className="font-bold text-slate-900 dark:text-white">{t('bookings.flow.title')}</h3>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700 dark:text-white">{t('bookings.flow.pickService')}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map(({ service }) => (
            <ServicePickCard
              key={service.id}
              service={service}
              selected={activeService?.id === service.id}
              onSelect={setSelectedService}
              t={t}
            />
          ))}
        </div>
      </div>

      {activeService && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700 dark:text-white">{t('bookings.flow.pickDate')}</span>
            <input
              type="date"
              min={minDate}
              max={maxDate}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-slate-700"
              required
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700 dark:text-white">{t('bookings.flow.pickTime')}</span>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-slate-700"
              required
            />
          </label>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn-primary inline-flex w-full items-center justify-center gap-2"
        disabled={!activeService || !selectedDate || !selectedTime || submitting}
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Calendar className="size-4" />
        )}
        {t('bookings.flow.confirm')}
      </button>
    </form>
  );
}
