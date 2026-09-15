import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { WEEKDAY_KEYS, DEFAULT_WORKING_HOURS } from '../../constants/workingHours';

export default function WorkingHoursSummary({ hours = DEFAULT_WORKING_HOURS, compact = false }) {
  const { t } = useTranslation();
  const schedule = hours ?? DEFAULT_WORKING_HOURS;

  if (compact) {
    const openDays = WEEKDAY_KEYS.filter((key) => !schedule[key]?.closed);
    if (openDays.length === 0) {
      return (
        <p className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="size-3.5 shrink-0" />
          {t('customer.salonProfile.closed')}
        </p>
      );
    }

    const first = schedule[openDays[0]];
    const sameHours = openDays.every(
      (key) =>
        schedule[key]?.open === first?.open && schedule[key]?.close === first?.close,
    );

    if (sameHours && openDays.length >= 5) {
      return (
        <p className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <Clock className="size-3.5 shrink-0 text-brand-500" />
          {t('customer.salonProfile.hoursRange', { open: first.open, close: first.close })}
        </p>
      );
    }
  }

  return (
    <ul className="space-y-1">
      {WEEKDAY_KEYS.map((key) => {
        const day = schedule[key];
        const label = day?.closed
          ? t('customer.salonProfile.closed')
          : t('customer.salonProfile.hoursRange', {
              open: day?.open ?? '—',
              close: day?.close ?? '—',
            });

        return (
          <li
            key={key}
            className="flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300"
          >
            <span className="font-medium">{t(`customer.salonProfile.weekdays.${key}`)}</span>
            <span className={day?.closed ? 'text-slate-400' : ''}>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}
