import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Loader2, Save, Store } from 'lucide-react';
import FormField from '../common/FormField';
import PhoneField from '../common/PhoneField';
import WorkingHoursEditor from './WorkingHoursEditor';
import { DEFAULT_WORKING_HOURS } from '../../constants/workingHours';
import { fetchSalonById, updateSalonSettings } from '../../services/salonService';
import { formatPhoneForStorage, parsePhoneToLocal } from '../../utils/phone';

export default function SalonSettingsForm({ salonId }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [workingHours, setWorkingHours] = useState(DEFAULT_WORKING_HOURS);

  const load = useCallback(async () => {
    if (!salonId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const salon = await fetchSalonById(salonId);
      setName(salon?.name ?? '');
      setPhone(parsePhoneToLocal(salon?.phone ?? ''));
      setAddress(salon?.address ?? '');
      setWorkingHours(salon?.workingHours ?? DEFAULT_WORKING_HOURS);
    } catch {
      setError(t('salonOwner.settings.errors.load'));
    } finally {
      setLoading(false);
    }
  }, [salonId, t]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSave(e) {
    e.preventDefault();
    if (!salonId) return;

    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateSalonSettings(salonId, {
        name,
        phone: formatPhoneForStorage(phone),
        address,
        workingHours,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch {
      setError(t('salonOwner.settings.errors.save'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-12">
        <Loader2 className="size-7 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <form onSubmit={onSave} className="card space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <Store className="size-5 text-brand-500" />
          {t('salonOwner.settings.title')}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-white">{t('salonOwner.settings.subtitle')}</p>
      </div>

      <FormField
        name="salonName"
        label={t('salonOwner.settings.salonName')}
        hint={t('salonOwner.settings.salonNameHint')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('salonOwner.settings.salonNamePlaceholder')}
        maxLength={100}
      />

      <PhoneField
        name="salonPhone"
        label={t('salonOwner.settings.phone')}
        value={phone}
        onChange={setPhone}
      />

      <FormField
        name="salonAddress"
        label={t('salonOwner.settings.address')}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder={t('salonOwner.settings.addressPlaceholder')}
        maxLength={200}
      />

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white">
          <Clock className="size-4 text-brand-500" />
          {t('salonOwner.settings.workingHours')}
        </h3>
        <WorkingHoursEditor value={workingHours} onChange={setWorkingHours} />
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
          {t('salonOwner.settings.saveSuccess')}
        </p>
      )}

      <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={saving}>
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {t('common.save')}
      </button>
    </form>
  );
}
