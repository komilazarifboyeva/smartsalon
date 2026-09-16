import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2 } from 'lucide-react';
import BalanceCard from '../../components/master/BalanceCard';
import MonthStatsCard from '../../components/master/MonthStatsCard';
import SmsCard from '../../components/master/SmsCard';
import TariffCard from '../../components/master/TariffCard';
import Modal from '../../components/common/Modal';
import ServicesManager from '../../components/services/ServicesManager';
import { ROUTES } from '../../constants/routes';
import { useMasterOverview } from '../../hooks/useMasterOverview';

export default function MasterDashboard() {
  const { t } = useTranslation();
  const { billing, stats, loading, error } = useMasterOverview();
  const [topUpOpen, setTopUpOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-5 sm:px-6 animate-fade-in">
      <TariffCard
        t={t}
        tariff={billing.tariff}
        nextPaymentAt={billing.nextPaymentAt}
        daysLeft={billing.daysLeft}
      />

      {billing.isBalanceNegative && (
        <p className="flex items-start gap-2 px-1 text-sm font-medium text-red-600 dark:text-red-400">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {t('master.balance.warning')}
        </p>
      )}

      <BalanceCard
        t={t}
        balance={billing.balance}
        isNegative={billing.isBalanceNegative}
        onTopUp={() => setTopUpOpen(true)}
      />

      <SmsCard t={t} count={billing.smsSentCount} to={ROUTES.MASTER.SMS} />

      <ServicesManager scope="master" layout="compact" titleKey="master.services.title" />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {t('master.stats.error')}
        </p>
      ) : loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-brand-500" />
        </div>
      ) : (
        <MonthStatsCard
          t={t}
          completedCount={stats.completedCount}
          cancelledCount={stats.cancelledCount}
          revenue={stats.revenue}
          detailsTo={ROUTES.MASTER.REPORTS}
        />
      )}

      <Modal
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        title={t('master.balance.topUp')}
        size="sm"
      >
        <p className="text-sm text-slate-600 dark:text-white">{t('master.balance.topUpInfo')}</p>
        <button type="button" onClick={() => setTopUpOpen(false)} className="btn-secondary mt-5 w-full">
          {t('common.close')}
        </button>
      </Modal>
    </div>
  );
}
