import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-4 py-12">
      <div className="text-center max-w-md">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-950/40">
          <Compass className="size-8" />
        </div>
        <p className="mt-4 text-xs font-bold tracking-widest uppercase text-brand-500">404</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t('pages.notFound.title')}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-white">{t('pages.notFound.description')}</p>
        <Link to={ROUTES.HOME} className="btn-primary mt-6">
          {t('pages.notFound.goHome')}
        </Link>
      </div>
    </div>
  );
}
