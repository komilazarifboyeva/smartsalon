import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

export default function BookingFilterBar({ value, onChange }) {
  const { t } = useTranslation();

  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
      <button
        type="button"
        onClick={() => onChange('today')}
        className={cn(
          'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
          value === 'today'
            ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-900 dark:text-white',
        )}
      >
        {t('bookings.filterToday')}
      </button>
      <button
        type="button"
        onClick={() => onChange('all')}
        className={cn(
          'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
          value === 'all'
            ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-900 dark:text-white',
        )}
      >
        {t('bookings.filterAll')}
      </button>
    </div>
  );
}
