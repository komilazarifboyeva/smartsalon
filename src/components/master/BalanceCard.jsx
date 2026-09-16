import { PlusCircle } from 'lucide-react';
import { formatPrice } from '../../constants/servicePresets';
import { cn } from '../../utils/cn';

export default function BalanceCard({ t, balance, isNegative, onTopUp }) {
  return (
    <section className="card flex items-center justify-between gap-3 p-5">
      <p className="flex flex-wrap items-baseline gap-2">
        <span className="text-sm text-slate-500 dark:text-white">{t('master.balance.label')}:</span>
        <span
          className={cn(
            'text-lg font-extrabold',
            isNegative ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white',
          )}
        >
          {formatPrice(balance)}
        </span>
      </p>

      <button
        type="button"
        onClick={onTopUp}
        aria-label={t('master.balance.topUp')}
        className="shrink-0 rounded-full text-brand-500 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <PlusCircle className="size-7" />
      </button>
    </section>
  );
}
