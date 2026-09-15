import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, User as UserIcon, Loader2 } from 'lucide-react';
import FormField from '../../components/common/FormField';
import PhoneField from '../../components/common/PhoneField';
import { useAuth } from '../../hooks/useAuth';
import { validateOnboardingForm } from '../../utils/validation';
import { formatPhoneForStorage } from '../../utils/phone';
import { ROUTES } from '../../constants/routes';

export default function CustomerOnboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { completeCustomerOnboarding, isOnboardingLoading, onboardingError } = useAuth();

  const [values, setValues] = useState({ firstName: '', lastName: '', phone: '' });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    const errs = validateOnboardingForm(values);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const result = await completeCustomerOnboarding({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: formatPhoneForStorage(values.phone),
    });
    if (result.meta.requestStatus === 'fulfilled') {
      navigate(ROUTES.ME.DASHBOARD, { replace: true });
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
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t('onboarding.customer.title')}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-white">{t('onboarding.customer.subtitle')}</p>

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
