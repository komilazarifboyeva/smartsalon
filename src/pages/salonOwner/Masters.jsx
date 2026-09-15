import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AtSign,
  Ban,
  CheckCircle2,
  Inbox,
  Loader2,
  Phone,
  ShieldOff,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { listMastersBySalonId, setMasterDisabled } from '../../services/masterService';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { cn } from '../../utils/cn';

function MasterCard({ master, onToggleBlock, blockingId }) {
  const { t } = useTranslation();
  const isBlocked = Boolean(master.isDisabled);
  const isBusy = blockingId === master.uid;

  const fullName = [master.firstName, master.lastName].filter(Boolean).join(' ') || '—';

  return (
    <article
      className={cn(
        'card flex flex-col gap-4 transition-opacity',
        isBlocked && 'opacity-75 border-red-100 bg-red-50 dark:bg-red-950/40/30',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 font-bold text-lg dark:bg-brand-950/40">
            {(master.firstName?.[0] ?? master.username?.[0] ?? '?').toUpperCase()}
          </span>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 truncate dark:text-white">{fullName}</h3>
            <p className="text-xs text-slate-500 font-mono truncate dark:text-white">@{master.username ?? '—'}</p>
          </div>
        </div>
        {isBlocked && (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-400">
            <ShieldOff className="size-3.5" />
            {t('salonOwner.masters.statusBlocked')}
          </span>
        )}
      </div>

      <ul className="space-y-2 text-sm text-slate-600 dark:text-white">
        <li className="flex items-center gap-2">
          <User className="size-4 shrink-0 text-slate-400 dark:text-white" />
          <span>{fullName}</span>
        </li>
        <li className="flex items-center gap-2">
          <Phone className="size-4 shrink-0 text-slate-400 dark:text-white" />
          <span>{master.phone ?? '—'}</span>
        </li>
        <li className="flex items-center gap-2">
          <AtSign className="size-4 shrink-0 text-slate-400 dark:text-white" />
          <span className="font-mono">@{master.username ?? '—'}</span>
        </li>
      </ul>

      <button
        type="button"
        disabled={isBusy}
        onClick={() => onToggleBlock(master)}
        className={cn(
          'w-full text-sm',
          isBlocked ? 'btn-secondary' : 'btn border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:bg-red-950/40 focus:ring-red-500',
        )}
      >
        {isBusy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isBlocked ? (
          <>
            <CheckCircle2 className="size-4" />
            {t('salonOwner.masters.unblock')}
          </>
        ) : (
          <>
            <Ban className="size-4" />
            {t('salonOwner.masters.block')}
          </>
        )}
      </button>
    </article>
  );
}

export default function Masters() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const salonId = profile?.salonId;

  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockingId, setBlockingId] = useState(null);
  const [blockConfirm, setBlockConfirm] = useState(null);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!salonId) {
      setMasters([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await listMastersBySalonId(salonId);
      items.sort((a, b) => {
        const nameA = `${a.firstName ?? ''}${a.lastName ?? ''}`.toLowerCase();
        const nameB = `${b.firstName ?? ''}${b.lastName ?? ''}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setMasters(items);
    } catch (err) {
      setError(err?.message ?? 'generic');
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    reload();
  }, [reload]);

  function requestToggleBlock(master) {
    setBlockConfirm({ master, next: !master.isDisabled });
  }

  async function confirmToggleBlock() {
    if (!blockConfirm) return;
    const { master, next } = blockConfirm;
    setBlockingId(master.uid);
    try {
      await setMasterDisabled(master.uid, next);
      setBlockConfirm(null);
      await reload();
    } catch (err) {
      setError(err?.message ?? 'generic');
    } finally {
      setBlockingId(null);
    }
  }

  const blockKey = blockConfirm?.next ? 'blockConfirm' : 'unblockConfirm';
  const blockName = blockConfirm?.master
    ? (blockConfirm.master.firstName ?? blockConfirm.master.username)
    : '';

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('salonOwner.masters.title')}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white">{t('salonOwner.masters.subtitle')}</p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {error.includes('permission') || error.includes('insufficient')
            ? t('salonOwner.masters.errors.permission')
            : t('salonOwner.masters.errors.generic')}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-brand-500" />
        </div>
      ) : masters.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-white">
            <Inbox className="size-8" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700 dark:text-white">{t('salonOwner.masters.empty')}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-white">{t('salonOwner.masters.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {masters.map((master) => (
            <MasterCard
              key={master.uid ?? master.id}
              master={master}
              onToggleBlock={requestToggleBlock}
              blockingId={blockingId}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(blockConfirm)}
        onClose={() => !blockingId && setBlockConfirm(null)}
        onConfirm={confirmToggleBlock}
        title={blockConfirm?.next ? t('salonOwner.masters.block') : t('salonOwner.masters.unblock')}
        subtitle={blockName || undefined}
        message={t(`salonOwner.masters.${blockKey}`, { name: blockName })}
        confirmLabel={blockConfirm?.next ? t('salonOwner.masters.block') : t('salonOwner.masters.unblock')}
        cancelLabel={t('common.cancel')}
        variant={blockConfirm?.next ? 'block' : 'unblock'}
        loading={Boolean(blockingId)}
      />
    </div>
  );
}
