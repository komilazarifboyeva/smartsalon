import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function SmsCard({ t, count, to }) {
  return (
    <Link
      to={to}
      className="card flex items-center justify-between gap-3 p-5 transition-colors hover:border-brand-200 dark:hover:border-brand-900/60"
    >
      <p className="flex flex-wrap items-baseline gap-2">
        <span className="text-sm text-slate-500 dark:text-white">{t('master.sms.label')}:</span>
        <span className="text-sm font-bold text-slate-900 dark:text-white">{count}</span>
      </p>
      <ChevronRight className="size-5 shrink-0 text-slate-400 dark:text-white" />
    </Link>
  );
}
