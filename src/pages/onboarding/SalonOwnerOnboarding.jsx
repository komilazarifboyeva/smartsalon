import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Clock,
  Loader2,
  User as UserIcon,
} from 'lucide-react';
import FormField from '../../components/common/FormField';
import PhoneField from '../../components/common/PhoneField';
import { useAuth } from '../../hooks/useAuth';
import { validateOnboardingForm } from '../../utils/validation';
import { formatPhoneForStorage } from '../../utils/phone';
import { ROUTES } from '../../constants/routes';
import { normalizeUsername, sanitizeUsernameInput } from '../../services/usernameService';

export default function SalonOwnerOnboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { completeOwnerOnboarding, isOnboardingLoading, onboardingError } = useAuth();

  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    username: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    const errs = validateOnboardingForm(values, { requireUsername: true });
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const result = await completeOwnerOnboarding({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: formatPhoneForStorage(values.phone),
      username: normalizeUsername(values.username),
    });
    if (result.meta.requestStatus === 'fulfilled') {
      navigate(ROUTES.SALON.DASHBOARD, { replace: true });
    }
  }

  return (
    <div className="animate-slide-up">
      <Link
        to={ROUTES.ONBOARDING.ROLE}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4 dark:text-white dark:hover:text-white"
      >
        <ArrowLeft className="size-4" />
        {t('common.back')}
      </Link>

      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">
          {t('onboarding.stepOf', { current: 2, total: 2 })}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t('onboarding.owner.title')}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white">{t('onboarding.owner.subtitle')}</p>

        <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
          <Clock className="size-4 mt-0.5 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-400">{t('onboarding.owner.trialNote')}</p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              label={t('onboarding.form.firstName')}
              name="firstName"
              icon={UserIcon}
              value={values.firstName}
              onChange={set('firstName')}
              error={errors.firstName && t(`onboarding.errors.${errors.firstName}`)}
              autoComplete="given-name"
            />
            <FormField
              label={t('onboarding.form.lastName')}
              name="lastName"
              value={values.lastName}
              onChange={set('lastName')}
              error={errors.lastName && t(`onboarding.errors.${errors.lastName}`)}
              autoComplete="family-name"
            />
          </div>
          <PhoneField
            label={t('onboarding.form.phone')}
            value={values.phone}
            onChange={(local) => setValues((v) => ({ ...v, phone: local }))}
            error={errors.phone && t(`onboarding.errors.${errors.phone}`)}
            placeholder={t('onboarding.form.phonePlaceholder')}
          />
          <FormField
            label={t('onboarding.form.username')}
            name="username"
            icon={AtSign}
            prefix="smartsalon.uz/s/"
            placeholder="komilasalon"
            value={values.username}
            onChange={(e) =>
              setValues((v) => ({ ...v, username: sanitizeUsernameInput(e.target.value) }))
            }
            hint={t('onboarding.form.ownerUsernameHelp')}
            error={errors.username && t(`onboarding.errors.${errors.username}`)}
            autoComplete="off"
          />

          {onboardingError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              {t(`onboarding.errors.${onboardingError}`, {
                defaultValue: t('onboarding.errors.generic'),
              })}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={isOnboardingLoading}>
            {isOnboardingLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                {t('common.continue')}
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
