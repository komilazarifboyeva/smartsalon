import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Ban,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  ShieldOff,
  XCircle,
} from 'lucide-react';
import {
  listSalonOwnersWithSalons,
  setSalonOwnerDisabled,
} from '../../services/adminService';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { daysUntil, formatFirestoreDate } from '../../utils/trial';
import { cn } from '../../utils/cn';

function ownerDisplayName(owner) {
  const full = [owner.firstName, owner.lastName].filter(Boolean).join(' ');
  return full || owner.email || '—';
}

function TrialStatusBadge({ status, t }) {
  const map = {
    trial: {
      icon: Clock,
      label: t('salonOwner.trial.trialActive'),
      cls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
    },
    pending_approval: {
      icon: Clock,
      label: t('salonOwner.trial.pendingApproval'),
      cls: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
    },
    approved: {
      icon: CheckCircle2,
      label: t('salonOwner.trial.approved'),
      cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
    },
    rejected: {
      icon: XCircle,
      label: t('salonOwner.trial.rejected'),
      cls: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400',
    },
  };
  const cfg = map[status] ?? map.trial;
  const Icon = cfg.icon;

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', cfg.cls)}>
      <Icon className="size-3.5" />
      {cfg.label}
    </span>
  );
}

function DaysLeftCell({ salon, t }) {
  const status = salon?.approvalStatus ?? 'trial';
  const daysLeft = salon?.trialEndsAt ? daysUntil(salon.trialEndsAt) : null;

  if (status !== 'trial') {
    return <span className="text-slate-400 dark:text-white">—</span>;
  }

  if (daysLeft === null) {
    return <span className="text-slate-400 dark:text-white">—</span>;
  }

  if (daysLeft === 0) {
    return (
      <span className="text-xs font-medium text-red-600 dark:text-red-400">
        {t('salonOwner.trial.expired')}
      </span>
    );
  }

  return (
    <span className="text-sm font-semibold text-slate-900 dark:text-white">
      {t('salonOwner.trial.daysLeft', { count: daysLeft })}
    </span>
  );
}

function BlockButton({ owner, onToggle, busyId }) {
  const { t } = useTranslation();
  const isBlocked = Boolean(owner.isDisabled);
  const isBusy = busyId === owner.uid;

  return (
    <button
      type="button"
      disabled={isBusy}
      onClick={() => onToggle(owner)}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium disabled:opacity-50',
        isBlocked
          ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          : 'bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40',
      )}
    >
      {isBusy ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : isBlocked ? (
        <CheckCircle2 className="size-3.5" />
      ) : (
        <Ban className="size-3.5" />
      )}
      {isBlocked ? t('bigAdmin.owners.unblock') : t('bigAdmin.owners.block')}
    </button>
  );
}

export default function SalonOwners() {
  const { t } = useTranslation();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockingId, setBlockingId] = useState(null);
  const [blockConfirm, setBlockConfirm] = useState(null);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOwners(await listSalonOwnersWithSalons());
    } catch (err) {
      setError(err?.message ?? 'generic');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  function requestToggleBlock(owner) {
    setBlockConfirm({ owner, next: !owner.isDisabled });
  }

  async function confirmToggleBlock() {
    if (!blockConfirm) return;
    const { owner, next } = blockConfirm;
    setBlockingId(owner.uid);
    try {
      await setSalonOwnerDisabled(owner.uid, next);
      setBlockConfirm(null);
      await reload();
    } catch (err) {
      setError(err?.message ?? 'generic');
    } finally {
      setBlockingId(null);
    }
  }

  const blockKey = blockConfirm?.next ? 'blockConfirm' : 'unblockConfirm';
  const blockName = blockConfirm?.owner ? ownerDisplayName(blockConfirm.owner) : '';

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('bigAdmin.owners.title')}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white">{t('bigAdmin.owners.subtitle')}</p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {t('bigAdmin.owners.errors.generic')}
        </p>
      )}

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-brand-500" />
          </div>
        ) : owners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-white">
              <Inbox className="size-8" />
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-white">{t('bigAdmin.owners.empty')}</p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-950 dark:text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">{t('bigAdmin.owners.tableName')}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t('bigAdmin.owners.tableUsername')}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t('bigAdmin.owners.tablePhone')}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t('bigAdmin.owners.tableEmail')}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t('bigAdmin.owners.tableRegistered')}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t('bigAdmin.owners.tableTrialStatus')}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t('bigAdmin.owners.tableDaysLeft')}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t('bigAdmin.owners.tableAccount')}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t('bigAdmin.owners.tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {owners.map((owner) => {
                    const isBlocked = Boolean(owner.isDisabled);
                    const approvalStatus = owner.salon?.approvalStatus ?? 'trial';

                    return (
                      <tr key={owner.uid ?? owner.id} className={cn('hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950', isBlocked && 'bg-red-50 dark:bg-red-950/40/30')}>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{ownerDisplayName(owner)}</td>
                        <td className="px-4 py-3 font-mono text-slate-700 dark:text-white">@{owner.username ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-white">{owner.phone ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-white">{owner.email ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-white">{formatFirestoreDate(owner.createdAt)}</td>
                        <td className="px-4 py-3">
                          <TrialStatusBadge status={approvalStatus} t={t} />
                        </td>
                        <td className="px-4 py-3">
                          <DaysLeftCell salon={owner.salon} t={t} />
                        </td>
                        <td className="px-4 py-3">
                          {isBlocked ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
                              <ShieldOff className="size-3.5" />
                              {t('bigAdmin.owners.statusBlocked')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                              <CheckCircle2 className="size-3.5" />
                              {t('bigAdmin.owners.statusActive')}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <BlockButton owner={owner} onToggle={requestToggleBlock} busyId={blockingId} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 lg:hidden">
              {owners.map((owner) => {
                const isBlocked = Boolean(owner.isDisabled);
                const approvalStatus = owner.salon?.approvalStatus ?? 'trial';

                return (
                  <article key={owner.uid ?? owner.id} className={cn('p-4 space-y-3', isBlocked && 'bg-red-50 dark:bg-red-950/40/30')}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 truncate dark:text-white">{ownerDisplayName(owner)}</h3>
                        <p className="text-xs font-mono text-slate-500 dark:text-white">@{owner.username ?? '—'}</p>
                      </div>
                      {isBlocked ? (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
                          <ShieldOff className="size-3.5" />
                          {t('bigAdmin.owners.statusBlocked')}
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <CheckCircle2 className="size-3.5" />
                          {t('bigAdmin.owners.statusActive')}
                        </span>
                      )}
                    </div>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <dt className="text-slate-500 dark:text-white">{t('bigAdmin.owners.tablePhone')}</dt>
                        <dd className="font-medium text-slate-800 dark:text-white">{owner.phone ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500 dark:text-white">{t('bigAdmin.owners.tableRegistered')}</dt>
                        <dd className="font-medium text-slate-800 dark:text-white">{formatFirestoreDate(owner.createdAt)}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-slate-500 dark:text-white">{t('bigAdmin.owners.tableEmail')}</dt>
                        <dd className="font-medium text-slate-800 break-all dark:text-white">{owner.email ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500 dark:text-white">{t('bigAdmin.owners.tableTrialStatus')}</dt>
                        <dd className="mt-0.5">
                          <TrialStatusBadge status={approvalStatus} t={t} />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500 dark:text-white">{t('bigAdmin.owners.tableDaysLeft')}</dt>
                        <dd className="mt-0.5">
                          <DaysLeftCell salon={owner.salon} t={t} />
                        </dd>
                      </div>
                    </dl>

                    <BlockButton owner={owner} onToggle={requestToggleBlock} busyId={blockingId} />
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(blockConfirm)}
        onClose={() => !blockingId && setBlockConfirm(null)}
        onConfirm={confirmToggleBlock}
        title={blockConfirm?.next ? t('bigAdmin.owners.block') : t('bigAdmin.owners.unblock')}
        subtitle={blockName || undefined}
        message={t(`bigAdmin.owners.${blockKey}`, { name: blockName })}
        confirmLabel={blockConfirm?.next ? t('bigAdmin.owners.block') : t('bigAdmin.owners.unblock')}
        cancelLabel={t('common.cancel')}
        variant={blockConfirm?.next ? 'block' : 'unblock'}
        loading={Boolean(blockingId)}
      />
    </div>
  );
}
