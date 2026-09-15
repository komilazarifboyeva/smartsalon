import { useTranslation } from 'react-i18next';
import { Construction } from 'lucide-react';

export default function ComingSoon({ titleKey }) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl">
      <div className="card text-center py-12">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-950/40">
          <Construction className="size-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          {titleKey ? t(titleKey) : t('pages.dashboard.comingSoon')}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-white">{t('pages.dashboard.comingSoon')}</p>
      </div>
    </div>
  );
}
