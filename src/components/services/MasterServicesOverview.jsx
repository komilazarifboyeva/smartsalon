import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Inbox, Loader2, Scissors, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { formatPrice } from '../../constants/servicePresets';
import { listMasterServiceGroups } from '../../services/serviceService';

function masterDisplayName(master) {
  const full = [master.firstName, master.lastName].filter(Boolean).join(' ');
  return full || master.username || '—';
}

function ServiceCardView({ service, t }) {
  const durationKey = service.durationPreset ?? String(service.durationMinutes);
  const durationLabel = t(`services.durationPresets.${durationKey}`, {
    defaultValue: `${service.durationMinutes} min`,
  });

  return (
    <article className="card flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/40">
          <Scissors className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900 truncate dark:text-white">{service.name}</h3>
          <p className="mt-1 text-lg font-extrabold text-brand-600">{formatPrice(service.price)}</p>
        </div>
      </div>
      <p className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-white">
        <Clock className="size-4 shrink-0 text-slate-400 dark:text-white" />
        {durationLabel}
      </p>
    </article>
  );
}

function MasterGroupCard({ group, t }) {
  const { master, services } = group;
  const displayName = masterDisplayName(master);
  const initial = (master.firstName?.[0] ?? master.username?.[0] ?? '?').toUpperCase();

  return (
    <section className="card space-y-4">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 font-bold text-lg dark:bg-brand-950/40">
          {initial}
        </span>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 truncate dark:text-white">{displayName}</h3>
          <p className="text-xs font-mono text-slate-500 truncate dark:text-white">@{master.username ?? '—'}</p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-white">
          {t('services.masterServiceCount', { count: services.length })}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCardView key={service.id} service={service} t={t} />
        ))}
      </div>
    </section>
  );
}

export default function MasterServicesOverview() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const salonId = profile?.salonId;

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!salonId) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setGroups(await listMasterServiceGroups(salonId));
    } catch (err) {
      setError(err?.message ?? 'generic');
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <User className="size-5 text-brand-500" />
          {t('services.masterServicesTitle')}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-white">{t('services.masterServicesSubtitle')}</p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {t('services.errors.generic')}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-brand-500" />
        </div>
      ) : groups.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-white">
            <Inbox className="size-7" />
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-white">{t('services.noMasterServices')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <MasterGroupCard key={group.master.uid} group={group} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
