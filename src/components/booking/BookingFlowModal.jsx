import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import { formatPrice } from '../../constants/servicePresets';
import { createBooking, listBookingsForSalonDay } from '../../services/bookingService';
import { generateTimeSlots, formatSlotDate, formatSlotTime } from '../../utils/availability';

function masterDisplayName(master) {
  if (!master) return null;
  const full = [master.firstName, master.lastName].filter(Boolean).join(' ');
  return full || master.username || '—';
}

function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateInput(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function BookingFlowModal({
  open,
  onClose,
  salon,
  workingHours,
  allBookableServices,
  initialTarget,
  customer,
  onSuccess,
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'en' ? 'en-US' : 'uz-UZ';

  const [step, setStep] = useState('service');
  const [target, setTarget] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [dayBookings, setDayBookings] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const minDate = useMemo(() => toDateInputValue(new Date()), []);
  const maxDate = useMemo(() => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    return toDateInputValue(future);
  }, []);

  useEffect(() => {
    if (!open) return;
    setStep(initialTarget?.service ? 'date' : 'service');
    setTarget(initialTarget?.service ? initialTarget : null);
    setSelectedDate('');
    setSelectedSlot(null);
    setDayBookings([]);
    setError(null);
  }, [open, initialTarget]);

  const loadSlots = useCallback(async () => {
    if (!salon?.id || !selectedDate || !target?.service) return;

    setLoadingSlots(true);
    setError(null);
    try {
      const date = parseDateInput(selectedDate);
      const bookings = await listBookingsForSalonDay(salon.id, date);
      setDayBookings(bookings);
    } catch {
      setError(t('bookings.errors.loadSlots'));
    } finally {
      setLoadingSlots(false);
    }
  }, [salon, selectedDate, target, t]);

  useEffect(() => {
    if (step === 'time' && selectedDate) {
      loadSlots();
    }
  }, [step, selectedDate, loadSlots]);

  const slots = useMemo(() => {
    if (!selectedDate || !target?.service || !workingHours) return [];
    const date = parseDateInput(selectedDate);
    return generateTimeSlots({
      date,
      workingHours,
      durationMinutes: target.service.durationMinutes,
      existingBookings: dayBookings,
      masterId: target.master?.uid ?? null,
    });
  }, [selectedDate, target, workingHours, dayBookings]);

  async function handleSubmit() {
    if (!target?.service || !selectedSlot || !customer?.uid || !salon?.id) return;

    setSubmitting(true);
    setError(null);
    try {
      const booking = await createBooking({
        salonId: salon.id,
        salonName: salon.name ?? salon.ownerUsername ?? null,
        customerId: customer.uid,
        customerName: [customer.firstName, customer.lastName].filter(Boolean).join(' ') || null,
        customerPhone: customer.phone ?? null,
        masterId: target.master?.uid ?? null,
        masterName: target.master ? masterDisplayName(target.master) : null,
        serviceId: target.service.id,
        serviceName: target.service.name,
        servicePrice: target.service.price,
        durationMinutes: target.service.durationMinutes,
        startAt: selectedSlot.start,
      });
      onSuccess?.(booking);
      onClose();
    } catch {
      setError(t('bookings.errors.create'));
    } finally {
      setSubmitting(false);
    }
  }

  const salonLabel = salon?.name?.trim() || (salon?.ownerUsername ? `@${salon.ownerUsername}` : 'Salon');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('bookings.flow.title')}
      subtitle={salonLabel}
      size="md"
    >
      <div className="space-y-4">
        {step === 'service' && (
          <>
            <p className="text-sm text-slate-600 dark:text-white">{t('customer.salonProfile.bookSelectService')}</p>
            <ul className="max-h-52 space-y-1 overflow-y-auto">
              {allBookableServices.map(({ master, service, label }) => (
                <li key={`${service.id}-${master?.uid ?? 'salon'}`}>
                  <button
                    type="button"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-brand-950/40"
                    onClick={() => {
                      setTarget({ master, service });
                      setStep('date');
                    }}
                  >
                    <span className="font-medium text-slate-900 dark:text-white">{label}</span>
                    <span className="ml-2 text-brand-600">{formatPrice(service.price)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {step !== 'service' && target?.service && (
          <div className="rounded-xl bg-brand-50 px-3 py-2 text-sm dark:bg-brand-950/40">
            <p className="font-semibold text-slate-900 dark:text-white">{target.service.name}</p>
            {target.master && (
              <p className="text-xs text-slate-600 dark:text-white">
                {t('customer.salonProfile.withMaster', { name: masterDisplayName(target.master) })}
              </p>
            )}
            <p className="font-bold text-brand-600">{formatPrice(target.service.price)}</p>
          </div>
        )}

        {step === 'date' && (
          <>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700 dark:text-white">{t('bookings.flow.pickDate')}</span>
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-slate-700"
              />
            </label>
            <div className="flex justify-between gap-2">
              <button type="button" className="btn-secondary text-xs" onClick={() => setStep('service')}>
                <ChevronLeft className="size-4" />
                {t('common.back')}
              </button>
              <button
                type="button"
                className="btn-primary text-xs"
                disabled={!selectedDate}
                onClick={() => setStep('time')}
              >
                {t('common.next')}
                <ChevronRight className="size-4" />
              </button>
            </div>
          </>
        )}

        {step === 'time' && (
          <>
            {selectedDate && (
              <p className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-white">
                <Calendar className="size-4" />
                {formatSlotDate(parseDateInput(selectedDate), locale)}
              </p>
            )}
            {loadingSlots ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-6 animate-spin text-brand-500" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-white">{t('bookings.flow.noSlots')}</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => {
                  const key = slot.start.toISOString();
                  const active = selectedSlot?.start?.getTime() === slot.start.getTime();
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-lg border px-2 py-2 text-xs font-medium ${
                        active
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:border-brand-300'
                      }`}
                    >
                      {formatSlotTime(slot.start, locale)}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between gap-2">
              <button type="button" className="btn-secondary text-xs" onClick={() => setStep('date')}>
                <ChevronLeft className="size-4" />
                {t('common.back')}
              </button>
              <button
                type="button"
                className="btn-primary text-xs"
                disabled={!selectedSlot}
                onClick={() => setStep('confirm')}
              >
                {t('common.next')}
                <ChevronRight className="size-4" />
              </button>
            </div>
          </>
        )}

        {step === 'confirm' && selectedSlot && (
          <>
            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
              <p className="inline-flex items-center gap-1.5 font-medium text-slate-800 dark:text-white">
                <Calendar className="size-4 text-brand-500" />
                {formatSlotDate(selectedSlot.start, locale)}
              </p>
              <p className="inline-flex items-center gap-1.5 text-slate-700 dark:text-white">
                <Clock className="size-4 text-brand-500" />
                {formatSlotTime(selectedSlot.start, locale)}
                {' — '}
                {formatSlotTime(selectedSlot.end, locale)}
              </p>
            </div>
            <div className="flex justify-between gap-2">
              <button type="button" className="btn-secondary text-xs" onClick={() => setStep('time')}>
                <ChevronLeft className="size-4" />
                {t('common.back')}
              </button>
              <button
                type="button"
                className="btn-primary text-xs inline-flex items-center gap-1.5"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {t('bookings.flow.confirm')}
              </button>
            </div>
          </>
        )}

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
