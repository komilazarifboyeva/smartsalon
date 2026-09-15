import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Inbox,
  Loader2,
  Pencil,
  Plus,
  Scissors,
  Trash2,
  Wallet,
} from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';
import FormField from '../common/FormField';
import Modal from '../common/Modal';
import { useAuth } from '../../hooks/useAuth';
import {
  DURATION_PRESETS,
  PRICE_PRESETS,
  formatPrice,
  getDurationPreset,
} from '../../constants/servicePresets';
import {
  createService,
  deleteService,
  listMasterServices,
  listSalonServices,
  updateService,
} from '../../services/serviceService';
import { cn } from '../../utils/cn';

function validateServiceForm(values) {
  const trimmedName = values.name.trim();
  const numericPrice = Number(String(values.price).replace(/\s/g, ''));
  const preset = getDurationPreset(values.durationPreset);

  if (!trimmedName) return 'nameRequired';
  if (!numericPrice || numericPrice <= 0) return 'priceRequired';
  if (!preset) return 'durationRequired';

  return null;
}

function ServiceFormFields({
  t,
  name,
  setName,
  price,
  setPrice,
  durationPreset,
  setDurationPreset,
  onSelectPricePreset,
}) {
  return (
    <>
      <FormField
        label={t('services.form.name')}
        name="serviceName"
        icon={Scissors}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('services.form.namePlaceholder')}
      />

      <div className="space-y-2">
        <FormField
          label={t('services.form.price')}
          name="servicePrice"
          icon={Wallet}
          type="number"
          min="0"
          step="1000"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="50000"
        />
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onSelectPricePreset(preset)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                Number(price) === preset
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-white hover:border-brand-300 hover:text-brand-600',
              )}
            >
              {formatPrice(preset)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700 dark:text-white">{t('services.form.duration')}</p>
        <div className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => setDurationPreset(preset.key)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                durationPreset === preset.key
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-white hover:border-brand-300 hover:text-brand-600',
              )}
            >
              {t(`services.durationPresets.${preset.key}`)}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function ServiceCard({ service, t, onEdit, onDelete, busyId }) {
  const durationKey = service.durationPreset ?? String(service.durationMinutes);
  const durationLabel = t(`services.durationPresets.${durationKey}`, {
    defaultValue: `${service.durationMinutes} min`,
  });
  const isBusy = busyId === service.id;

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
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit(service)}
            disabled={isBusy}
            className="rounded-lg p-2 text-brand-500 hover:bg-brand-50 disabled:opacity-50 dark:bg-brand-950/40"
            title={t('common.edit')}
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(service)}
            disabled={isBusy}
            className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:bg-red-950/40"
            title={t('common.delete')}
          >
            {isBusy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </button>
        </div>
      </div>
      <p className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-white">
        <Clock className="size-4 shrink-0 text-slate-400 dark:text-white" />
        {durationLabel}
      </p>
    </article>
  );
}

const EMPTY_FORM = { name: '', price: '', durationPreset: '30' };

export default function ServicesManager({ scope }) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const salonId = profile?.salonId;

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [durationPreset, setDurationPreset] = useState('30');

  const [editTarget, setEditTarget] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDurationPreset, setEditDurationPreset] = useState('30');
  const [editError, setEditError] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const reload = useCallback(async () => {
    if (!salonId) {
      setServices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const items = scope === 'master'
        ? await listMasterServices(salonId, user?.uid)
        : await listSalonServices(salonId);
      setServices(items);
    } catch (err) {
      setError(err?.message ?? 'generic');
    } finally {
      setLoading(false);
    }
  }, [salonId, scope, user]);

  useEffect(() => {
    reload();
  }, [reload]);

  function resetAddForm() {
    setName(EMPTY_FORM.name);
    setPrice(EMPTY_FORM.price);
    setDurationPreset(EMPTY_FORM.durationPreset);
  }

  function openEditModal(service) {
    setEditTarget(service);
    setEditName(service.name ?? '');
    setEditPrice(String(service.price ?? ''));
    setEditDurationPreset(service.durationPreset ?? '30');
    setEditError(null);
  }

  function closeEditModal() {
    if (editSubmitting) return;
    setEditTarget(null);
    setEditError(null);
  }

  async function onSubmitAdd(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateServiceForm({ name, price, durationPreset });
    if (validationError) {
      setError(validationError);
      return;
    }

    const preset = getDurationPreset(durationPreset);
    const trimmedName = name.trim();
    const numericPrice = Number(String(price).replace(/\s/g, ''));

    setSubmitting(true);
    try {
      await createService({
        salonId,
        masterId: scope === 'master' ? user.uid : null,
        name: trimmedName,
        price: numericPrice,
        durationMinutes: preset.minutes,
        durationPreset: preset.key,
        createdBy: user.uid,
      });
      resetAddForm();
      setSuccess('addSuccess');
      await reload();
    } catch (err) {
      setError(err?.message ?? 'generic');
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitEdit(e) {
    e.preventDefault();
    if (!editTarget) return;

    setEditError(null);
    const validationError = validateServiceForm({
      name: editName,
      price: editPrice,
      durationPreset: editDurationPreset,
    });
    if (validationError) {
      setEditError(validationError);
      return;
    }

    const preset = getDurationPreset(editDurationPreset);
    const trimmedName = editName.trim();
    const numericPrice = Number(String(editPrice).replace(/\s/g, ''));

    setEditSubmitting(true);
    try {
      await updateService(editTarget.id, {
        name: trimmedName,
        price: numericPrice,
        durationMinutes: preset.minutes,
        durationPreset: preset.key,
      });
      setEditTarget(null);
      setSuccess('editSuccess');
      await reload();
    } catch (err) {
      setEditError(err?.message ?? 'generic');
    } finally {
      setEditSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setBusyId(deleteTarget.id);
    setError(null);
    setSuccess(null);
    try {
      await deleteService(deleteTarget.id);
      setDeleteTarget(null);
      setSuccess('deleteSuccess');
      setServices((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    } catch (err) {
      setError(err?.message ?? 'generic');
      await reload();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('services.addTitle')}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-white">{t(`services.${scope}Subtitle`)}</p>
        </div>

        <form onSubmit={onSubmitAdd} className="space-y-5">
          <ServiceFormFields
            t={t}
            name={name}
            setName={setName}
            price={price}
            setPrice={setPrice}
            durationPreset={durationPreset}
            setDurationPreset={setDurationPreset}
            onSelectPricePreset={(value) => setPrice(String(value))}
          />

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              {t(`services.errors.${error}`, { defaultValue: t('services.errors.generic') })}
            </p>
          )}

          {success && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
              {t(`services.${success}`)}
            </p>
          )}

          <button type="submit" className="btn-primary w-full sm:w-auto" disabled={submitting}>
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {t('services.addButton')}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('services.listTitle')}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-white">{t('services.listSubtitle')}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-brand-500" />
        </div>
      ) : services.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-white">
            <Inbox className="size-7" />
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-white">{t('services.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              t={t}
              onEdit={openEditModal}
              onDelete={setDeleteTarget}
              busyId={busyId}
            />
          ))}
        </div>
      )}

      <Modal
        open={Boolean(editTarget)}
        onClose={closeEditModal}
        title={t('services.editTitle')}
        subtitle={editTarget?.name}
        size="lg"
        hideClose={editSubmitting}
      >
        <form onSubmit={onSubmitEdit} className="space-y-5">
          <ServiceFormFields
            t={t}
            name={editName}
            setName={setEditName}
            price={editPrice}
            setPrice={setEditPrice}
            durationPreset={editDurationPreset}
            setDurationPreset={setEditDurationPreset}
            onSelectPricePreset={(value) => setEditPrice(String(value))}
          />

          {editError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              {t(`services.errors.${editError}`, { defaultValue: t('services.errors.generic') })}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeEditModal}
              disabled={editSubmitting}
              className="btn-secondary flex-1 sm:flex-none"
            >
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary flex-1 sm:flex-none" disabled={editSubmitting}>
              {editSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Pencil className="size-4" />
              )}
              {t('common.save')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => !busyId && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={t('common.delete')}
        message={t('services.deleteConfirm', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={Boolean(busyId && deleteTarget?.id === busyId)}
      />
    </div>
  );
}
