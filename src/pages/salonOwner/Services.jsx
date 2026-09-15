import { useTranslation } from 'react-i18next';
import ServicesManager from '../../components/services/ServicesManager';
import MasterServicesOverview from '../../components/services/MasterServicesOverview';

export default function SalonServices() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-5xl space-y-10 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('nav.services')}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white">{t('services.salonPageSubtitle')}</p>
      </div>
      <ServicesManager scope="salon" />
      <MasterServicesOverview />
    </div>
  );
}
