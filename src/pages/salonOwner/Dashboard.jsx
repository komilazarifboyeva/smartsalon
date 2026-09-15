import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { fetchSalonById } from '../../services/salonService';
import SalonSettingsForm from '../../components/salon/SalonSettingsForm';
import { cn } from '../../utils/cn';

const PUBLIC_BASE = 'smartsalon.uz/s/';

function daysBetween(future) {
  if (!future) return 0;
  let target;
  if (typeof future?.toDate === 'function') target = future.toDate();
  else target = new Date(future);
  const ms = target.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

function StatusBadge({ status, t }) {
  const map = {
    trial: {
      icon: Clock,
      label: t('salonOwner.trial.trialActive'),
      cls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
    pending_approval: {
      icon: Clock,
      label: t('salonOwner.trial.pendingApproval'),
      cls: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    },
    approved: {
      icon: CheckCircle2,
      label: t('salonOwner.trial.approved'),
      cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    rejected: {
      icon: XCircle,
      label: t('salonOwner.trial.rejected'),
      cls: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    },
  };
  const cfg = map[status] ?? map.trial;
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium', cfg.cls)}>
      <Icon className="size-3.5" />
      {cfg.label}
    </span>
  );
}

export default function SalonOwnerDashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [salon, setSalon] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profile?.salonId) {
      fetchSalonById(profile.salonId).then(setSalon);
    }
  }, [profile?.salonId]);

  const publicUrl = profile?.username ? `${PUBLIC_BASE}${profile.username}` : null;
  const daysLeft = salon?.trialEndsAt ? daysBetween(salon.trialEndsAt) : null;
  const approvalStatus = salon?.approvalStatus ?? 'trial';

  async function onCopy() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(`https://${publicUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white">
              {t('salonOwner.trial.status')}
            </p>
            <StatusBadge status={approvalStatus} t={t} />
          </div>
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40">
              <Sparkles className="size-6" />
            </span>
            <div>
              {approvalStatus === 'trial' && daysLeft !== null && (
                <>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {t('salonOwner.trial.daysLeft', { count: daysLeft })}
                  </p>
                  {daysLeft === 0 && (
                    <p className="text-xs text-red-600 dark:text-red-400">{t('salonOwner.trial.expired')}</p>
                  )}
                </>
              )}
              {approvalStatus === 'pending_approval' && (
                <p className="text-sm font-semibold text-slate-700 dark:text-white">
                  {t('salonOwner.trial.pendingApproval')}
                </p>
              )}
              {approvalStatus === 'approved' && (
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  {t('salonOwner.trial.approved')}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white">
            {t('salonOwner.publicUrl')}
          </p>
          {publicUrl ? (
            <>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-950">
                <LinkIcon className="size-4 text-brand-500 shrink-0" />
                <span className="truncate">{publicUrl}</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onCopy} className="btn-secondary text-xs flex-1">
                  <Copy className="size-3.5" />
                  {copied ? t('common.copied') : t('common.copy')}
                </button>
                <a
                  href={`https://${publicUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-xs"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-white">—</p>
          )}
        </div>
      </div>

      <SalonSettingsForm salonId={profile?.salonId} />
    </div>
  );
}
