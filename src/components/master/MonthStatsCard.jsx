import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { formatPrice } from '../../constants/servicePresets';
import { getMonthName } from '../../utils/monthName';

export default function MonthStatsCard({ t, completedCount, cancelledCount, revenue, detailsTo }) {
  const monthName = getMonthName(t);

  return (
    <section className="card space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          {t('master.stats.currentMonth', { month: monthName })}
        </h2>
        <span className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(revenue)}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-white">{t('master.stats.completed')}</p>
          <p className="mt-1 inline-flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <CheckCircle2 className="size-4 text-emerald-500" />
            {t('master.stats.count', { count: completedCount })}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-white">{t('master.stats.cancelled')}</p>
          <p className="mt-1 inline-flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400">
            <XCircle className="size-4" />
            {t('master.stats.count', { count: cancelledCount })}
          </p>
        </div>
      </div>

      <Link to={detailsTo} className="btn-primary w-full">
        {t('master.stats.details')}
      </Link>
    </section>
  );
}
