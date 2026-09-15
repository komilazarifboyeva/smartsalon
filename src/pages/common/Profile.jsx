import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AtSign,
  Calendar,
  Camera,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  Phone,
  Shield,
  User,
} from 'lucide-react';
import FormField from '../../components/common/FormField';
import PhoneField from '../../components/common/PhoneField';
import ThemeToggle from '../../components/common/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { getProfileDisplayName, getProfileInitial, getProfilePhotoURL } from '../../utils/profileDisplay';
import { formatPhoneForStorage, parsePhoneToLocal } from '../../utils/phone';
import { validateOnboardingForm } from '../../utils/validation';
import { cn } from '../../utils/cn';

const PUBLIC_BASE = 'smartsalon.uz/s/';

function formatRegisteredAt(value) {
  if (!value) return null;
  let date;
  if (typeof value?.toDate === 'function') date = value.toDate();
  else if (value?.seconds) date = new Date(value.seconds * 1000);
  else date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function profileToFormValues(profile) {
  return {
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    phone: parsePhoneToLocal(profile?.phone),
    bio: profile?.bio ?? '',
  };
}

function ProfileRow({ icon: Icon, label, value, mono, children }) {
  const { t } = useTranslation();
  const display = value?.trim?.() ? value : null;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0 dark:border-slate-800">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-white">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-white">{label}</p>
        {children ?? (
          <p className={cn('mt-0.5 text-sm text-slate-900 dark:text-white break-words', mono && 'font-mono')}>
            {display ?? t('pages.profile.noData')}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, role, logout, updateProfile, uploadProfilePhoto } = useAuth();
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [values, setValues] = useState(() => profileToFormValues(profile));
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const profileFormKey = [
    profile?.firstName,
    profile?.lastName,
    profile?.phone,
    profile?.bio,
    editing ? 'edit' : 'view',
  ].join('|');
  const [syncedFormKey, setSyncedFormKey] = useState(profileFormKey);

  if (profileFormKey !== syncedFormKey) {
    setSyncedFormKey(profileFormKey);
    if (!editing) {
      setValues(profileToFormValues(profile));
    }
  }

  const displayName = getProfileDisplayName(profile, user);
  const initial = getProfileInitial(profile, user);
  const photoURL = getProfilePhotoURL(profile, user);
  const email = profile?.email ?? user?.email ?? null;
  const registeredAt = formatRegisteredAt(profile?.createdAt);
  const publicUrl = profile?.username ? `${PUBLIC_BASE}${profile.username}` : null;
  const showSalonUrl = role === ROLES.SALON_OWNER && publicUrl;
  const showBio = role === ROLES.SALON_OWNER || role === ROLES.MASTER;

  function startEdit() {
    setValues(profileToFormValues(profile));
    setFieldErrors({});
    setSaveError(null);
    setSaveSuccess(false);
    setEditing(true);
  }

  function cancelEdit() {
    setValues(profileToFormValues(profile));
    setFieldErrors({});
    setSaveError(null);
    setEditing(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    const errs = validateOnboardingForm(values);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setSaveError(null);
    setSaveSuccess(false);
    setSaving(true);

    const result = await updateProfile({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: formatPhoneForStorage(values.phone),
      bio: showBio ? values.bio : undefined,
    });

    setSaving(false);

    if (result.meta.requestStatus === 'fulfilled') {
      setSaveSuccess(true);
      setEditing(false);
    } else {
      setSaveError(result.payload ?? 'generic');
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate(ROUTES.LOGIN, { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setPhotoError(null);
    setPhotoSuccess(false);
    setUploadingPhoto(true);

    const result = await uploadProfilePhoto(file);
    setUploadingPhoto(false);

    if (result.meta.requestStatus === 'fulfilled') {
      setPhotoSuccess(true);
    } else {
      const code = result.payload ?? 'UPLOAD_FAILED';
      setPhotoError(code);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('pages.profile.title')}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-white">{t('pages.profile.subtitle')}</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={startEdit}
            className="btn-secondary shrink-0 text-sm"
          >
            <Pencil className="size-4" />
            {t('common.edit')}
          </button>
        )}
      </div>

      {saveSuccess && (
        <p className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
          {t('pages.profile.saveSuccess')}
        </p>
      )}

      {saveError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {t('pages.profile.saveError')}
        </p>
      )}

      {photoSuccess && (
        <p className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
          {t('pages.profile.photoUploadSuccess')}
        </p>
      )}

      {photoError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {t(`pages.profile.photoErrors.${photoError}`, { defaultValue: t('pages.profile.photoUploadError') })}
        </p>
      )}

      <div className="card overflow-hidden p-0">
        <div className="flex flex-col items-center gap-3 border-b border-slate-100 bg-gradient-to-b from-brand-50 to-white px-6 py-8 text-center dark:border-slate-800 dark:from-slate-950/80 dark:to-slate-900">
          <div className="relative">
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                className="size-20 rounded-full border-4 border-white object-cover shadow-md dark:border-slate-800"
              />
            ) : (
              <div className="grid size-20 place-items-center rounded-full border-4 border-white bg-brand-100 text-2xl font-bold text-brand-600 shadow-md dark:border-slate-800 dark:bg-brand-950/50 dark:text-brand-400">
                {initial}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-2 border-white bg-brand-500 text-white shadow-md transition hover:bg-brand-600 disabled:opacity-60 dark:border-slate-800"
              title={t('pages.profile.uploadPhoto')}
              aria-label={t('pages.profile.uploadPhoto')}
            >
              {uploadingPhoto ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Camera className="size-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={handlePhotoChange}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {uploadingPhoto ? t('pages.profile.uploadingPhoto') : t('pages.profile.photoHint')}
          </p>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{displayName}</h2>
            {role && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                <Shield className="size-3.5" />
                {t(`roles.${role}`)}
              </span>
            )}
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4 px-6 py-6">
            <FormField
              label={t('onboarding.form.firstName')}
              name="firstName"
              icon={User}
              value={values.firstName}
              onChange={(e) => setValues((v) => ({ ...v, firstName: e.target.value }))}
              error={fieldErrors.firstName && t(`onboarding.errors.${fieldErrors.firstName}`)}
              autoComplete="given-name"
            />
            <FormField
              label={t('onboarding.form.lastName')}
              name="lastName"
              icon={User}
              value={values.lastName}
              onChange={(e) => setValues((v) => ({ ...v, lastName: e.target.value }))}
              error={fieldErrors.lastName && t(`onboarding.errors.${fieldErrors.lastName}`)}
              autoComplete="family-name"
            />
            <PhoneField
              label={t('onboarding.form.phone')}
              value={values.phone}
              onChange={(phone) => setValues((v) => ({ ...v, phone }))}
              error={fieldErrors.phone && t(`onboarding.errors.${fieldErrors.phone}`)}
            />
            {showBio && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="bio" className="text-sm font-medium text-slate-700 dark:text-white">
                  {t('pages.profile.bio')}
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  maxLength={500}
                  value={values.bio}
                  onChange={(e) => setValues((v) => ({ ...v, bio: e.target.value }))}
                  placeholder={t('pages.profile.bioPlaceholder')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('pages.profile.bioHint')}</p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={cancelEdit} className="btn-secondary flex-1" disabled={saving}>
                {t('common.cancel')}
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : t('common.save')}
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-2">
            <ProfileRow
              icon={User}
              label={t('onboarding.form.firstName')}
              value={profile?.firstName}
            />
            <ProfileRow
              icon={User}
              label={t('onboarding.form.lastName')}
              value={profile?.lastName}
            />
            <ProfileRow
              icon={Phone}
              label={t('onboarding.form.phone')}
              value={profile?.phone}
            />
            {showBio && (
              <ProfileRow icon={FileText} label={t('pages.profile.bio')} value={profile?.bio} />
            )}
            <ProfileRow icon={Mail} label={t('pages.profile.email')} value={email} />
            {profile?.username && (
              <ProfileRow
                icon={AtSign}
                label={t('onboarding.form.username')}
                value={`@${profile.username}`}
                mono
              />
            )}
            {showSalonUrl && (
              <ProfileRow icon={ExternalLink} label={t('pages.profile.salonUrl')}>
                <a
                  href={`https://${publicUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-mono text-brand-600 hover:text-brand-700 break-all"
                >
                  {publicUrl}
                  <ExternalLink className="size-3.5 shrink-0" />
                </a>
              </ProfileRow>
            )}
            {registeredAt && (
              <ProfileRow
                icon={Calendar}
                label={t('pages.profile.registeredAt')}
                value={registeredAt}
              />
            )}
          </div>
        )}
      </div>

      <div className="card flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{t('theme.label')}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-white">
            {isDark ? t('theme.dark') : t('theme.light')}
          </p>
        </div>
        <ThemeToggle showLabel />
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="btn w-full border border-red-200 bg-white text-red-600 hover:bg-red-50 focus:ring-red-500 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
      >
        {loggingOut ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogOut className="size-4" />
        )}
        {t('auth.logout')}
      </button>
    </div>
  );
}
