import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import CustomerSalonList from '../../components/customer/CustomerSalonList';

export default function CustomerDashboard() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Home className="size-6 text-brand-500" />
          {t('nav.home')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white">{t('customer.salons.subtitle')}</p>
      </div>

      <CustomerSalonList />
    </div>
  );
}
