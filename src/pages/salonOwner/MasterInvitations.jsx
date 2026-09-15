import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Inbox,
  Loader2,
  Mail,
  Plus,
  Trash2,
} from 'lucide-react'
import FormField from '../../components/common/FormField'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { useAuth } from '../../hooks/useAuth'
import {
  createMasterInvitation,
  deleteMasterInvitation,
  isValidUsername,
  listMasterInvitations,
  normalizeUsername,
  sanitizeUsernameInput,
} from '../../services/usernameService'
import { cn } from '../../utils/cn'

function formatDate(value) {
  if (!value) return '—'
  if (typeof value?.toDate === 'function') {
    return value.toDate().toLocaleDateString()
  }
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return '—'
  }
}

export default function MasterInvitations() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const salonId = profile?.salonId

  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [errorScope, setErrorScope] = useState(null)
  const [success, setSuccess] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const reload = useCallback(async () => {
    if (!salonId) return
    setLoading(true)
    try {
      const items = await listMasterInvitations(salonId)
      items.sort((a, b) => {
        const aT = a.createdAt?.toMillis?.() ?? 0
        const bT = b.createdAt?.toMillis?.() ?? 0
        return bT - aT
      })
      setInvitations(items)
    } finally {
      setLoading(false)
    }
  }, [salonId])

  useEffect(() => {
    reload()
  }, [reload])

  async function onCreate(e) {
    e.preventDefault()
    if (!salonId) return
    setError(null)
    setErrorScope(null)
    setSuccess(null)
    const clean = normalizeUsername(username)
    if (!isValidUsername(clean)) {
      setErrorScope('create')
      setError('username')
      return
    }
    setSubmitting(true)

    try {
      await createMasterInvitation({ username: clean, salonId })
      setUsername('')
      setSuccess('createSuccess')
      await reload()
    } catch (err) {
      setErrorScope('create')
      setError(err?.message ?? 'generic')
    } finally {
      setSubmitting(false)
    }
  }

  function requestDelete(inv) {
    setDeleteTarget(inv)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const inv = deleteTarget
    setError(null)
    setErrorScope(null)
    setSuccess(null)
    setDeletingId(inv.username)
    try {
      await deleteMasterInvitation({ username: inv.username, salonId })
      setInvitations((prev) => prev.filter((item) => item.username !== inv.username))
      setSuccess('deleteSuccess')
      setDeleteTarget(null)
    } catch (err) {
      setErrorScope('delete')
      setError(err?.message ?? 'generic')
      await reload()
    } finally {
      setDeletingId(null)
    }
  }

  async function onCopy(name) {
    try {
      await navigator.clipboard.writeText(name)
      setCopiedId(name)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      /* noop */
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('salonOwner.invitations.title')}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white">{t('salonOwner.invitations.subtitle')}</p>
      </div>

      <div className="card">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white">
          <Plus className="size-4 text-brand-500" />
          {t('salonOwner.invitations.createTitle')}
        </h2>
        <form onSubmit={onCreate} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <FormField
              name="username"
              icon={Mail}
              placeholder="alimaster"
              value={username}
              onChange={(e) => setUsername(sanitizeUsernameInput(e.target.value))}
              hint={t('onboarding.form.usernameHelp')}
              error={errorScope === 'create' && error && t(`onboarding.errors.${error}`, { defaultValue: t('onboarding.errors.generic') })}
            />
          </div>
          <button
            type="submit"
            className="btn-primary sm:w-auto sm:min-w-[10rem]"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Plus className="size-4" />
                {t('salonOwner.invitations.create')}
              </>
            )}
          </button>
        </form>
        {success && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="size-4" />
            {t(`salonOwner.invitations.${success}`)}
          </p>
        )}
        {errorScope === 'delete' && error && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
            {t('salonOwner.invitations.deleteError')}
          </p>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-brand-500" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-white">
              <Inbox className="size-7" />
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-white">{t('salonOwner.invitations.empty')}</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-950 dark:text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">
                      {t('salonOwner.invitations.tableUsername')}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      {t('salonOwner.invitations.tableStatus')}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      {t('salonOwner.invitations.tableCreated')}
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      {t('salonOwner.invitations.tableActions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invitations.map((inv) => {
                    const claimed = Boolean(inv.claimedBy);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950">
                        <td className="px-4 py-3 font-mono text-sm text-slate-900 dark:text-white">@{inv.username}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                              claimed
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
                            )}
                          >
                            {claimed ? (
                              <CheckCircle2 className="size-3.5" />
                            ) : (
                              <Clock className="size-3.5" />
                            )}
                            {claimed
                              ? t('salonOwner.invitations.statusClaimed')
                              : t('salonOwner.invitations.statusPending')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-white">{formatDate(inv.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onCopy(inv.username)}
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 dark:bg-slate-800"
                              title={t('common.copy')}
                            >
                              {copiedId === inv.username ? (
                                <Check className="size-4 text-emerald-600" />
                              ) : (
                                <Copy className="size-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDelete(inv)}
                              disabled={deletingId === inv.username}
                              className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:bg-red-950/40"
                              title={t('common.delete')}
                            >
                              {deletingId === inv.username ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="sm:hidden divide-y divide-slate-100">
              {invitations.map((inv) => {
                const claimed = Boolean(inv.claimedBy)
                return (
                  <li key={inv.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-semibold text-slate-900 truncate dark:text-white">
                          @{inv.username}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-white">{formatDate(inv.createdAt)}</p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                          claimed
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
                        )}
                      >
                        {claimed
                          ? t('salonOwner.invitations.statusClaimed')
                          : t('salonOwner.invitations.statusPending')}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onCopy(inv.username)}
                        className="btn-secondary text-xs flex-1"
                      >
                        {copiedId === inv.username ? (
                          <>
                            <Check className="size-3.5" />
                            {t('common.copied')}
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            {t('common.copy')}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDelete(inv)}
                        disabled={deletingId === inv.username}
                        className="btn-secondary text-xs text-red-600 border-red-200 disabled:opacity-50 dark:text-red-400 dark:border-red-800"
                      >
                        {deletingId === inv.username ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                        {t('common.delete')}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => !deletingId && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={t('common.delete')}
        subtitle={deleteTarget?.username ? `@${deleteTarget.username}` : undefined}
        message={t(
          `salonOwner.invitations.${deleteTarget?.claimedBy ? 'deleteClaimedConfirm' : 'deleteConfirm'}`,
          { username: deleteTarget?.username ?? '' },
        )}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={Boolean(deletingId)}
      />
    </div>
  )
}
