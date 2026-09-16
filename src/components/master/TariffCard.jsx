import { BadgeCheck, CalendarClock } from 'lucide-react';
import { formatDayMonth } from '../../utils/monthName';

function paymentMessage(t, daysLeft) {
  if (daysLeft == null) return null;
  if (daysLeft > 0) return t('master.tariff.daysLeft', { count: daysLeft });
  if (daysLeft === 0) return t('master.tariff.dueToday');
  return t('master.tariff.overdue', { count: Math.abs(daysLeft) });
}

export default function TariffCard({ t, tariff, nextPaymentAt, daysLeft }) {
  const message = paymentMessage(t, daysLeft);
  const isOverdue = daysLeft != null && daysLeft < 0;

  return (
    <section className="card space-y-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-500 dark:text-white">{t('master.tariff.title')}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
          <BadgeCheck className="size-3.5" />
          {t(`master.tariff.plans.${tariff}`, { defaultValue: tariff })}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-white">
          <CalendarClock className="size-4 text-slate-400 dark:text-white" />
          {t('master.tariff.paymentDate')}
        </span>
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          {formatDayMonth(t, nextPaymentAt)}
        </span>
      </div>

      {message && (
        <p
          className={
            isOverdue
              ? 'border-t border-slate-100 pt-3 text-sm font-medium text-red-600 dark:border-slate-800 dark:text-red-400'
              : 'border-t border-slate-100 pt-3 text-sm text-slate-600 dark:border-slate-800 dark:text-white'
          }
        >
          {message}
        </p>
      )}
    </section>
  );
}
