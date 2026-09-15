import { useTranslation } from 'react-i18next';
import { ShieldOff, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AccountDisabled() {
  const { t } = useTranslation();
  const { logout } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-4 py-12">
      <div className="text-center max-w-md">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/40">
          <ShieldOff className="size-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
          {t('pages.accountDisabled.title')}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-white">{t('pages.accountDisabled.description')}</p>
        <button type="button" onClick={() => logout()} className="btn-primary mt-6">
          <LogOut className="size-4" />
          {t('auth.logout')}
        </button>
      </div>
    </div>
  );
}
