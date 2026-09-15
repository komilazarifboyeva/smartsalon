import { useTranslation } from 'react-i18next';
import { WEEKDAY_KEYS } from '../../constants/workingHours';

function TimeInput({ value, onChange, disabled }) {
  return (
    <input
      type="time"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
    />
  );
}

export default function WorkingHoursEditor({ value, onChange }) {
  const { t } = useTranslation();

  const updateDay = (dayKey, patch) => {
    onChange({
      ...value,
      [dayKey]: { ...value[dayKey], ...patch },
    });
  };

  return (
    <div className="space-y-2">
      {WEEKDAY_KEYS.map((dayKey) => {
        const day = value?.[dayKey] ?? { closed: true, open: '09:00', close: '20:00' };
        return (
          <div
            key={dayKey}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/60"
          >
            <span className="w-28 text-sm font-medium text-slate-700 dark:text-white">
              {t(`customer.salonProfile.weekdays.${dayKey}`)}
            </span>
            <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-white">
              <input
                type="checkbox"
                checked={!day.closed}
                onChange={(e) =>
                  updateDay(dayKey, {
                    closed: !e.target.checked,
                    open: day.open ?? '09:00',
                    close: day.close ?? '20:00',
                  })
                }
                className="size-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
              />
              {t('salonOwner.settings.open')}
            </label>
            <TimeInput
              value={day.open}
              disabled={day.closed}
              onChange={(open) => updateDay(dayKey, { open })}
            />
            <span className="text-slate-400 dark:text-white">—</span>
            <TimeInput
              value={day.close}
              disabled={day.closed}
              onChange={(close) => updateDay(dayKey, { close })}
            />
          </div>
        );
      })}
    </div>
  );
}
