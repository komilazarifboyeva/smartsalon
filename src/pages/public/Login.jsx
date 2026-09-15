import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { isFirebaseConfigured } from '../../config/firebase';
import { ROLES } from '../../constants/roles';
import { ROUTES } from '../../constants/routes';

const ROLE_HOME = {
  [ROLES.BIG_ADMIN]: ROUTES.ADMIN.DASHBOARD,
  [ROLES.SALON_OWNER]: ROUTES.SALON.DASHBOARD,
  [ROLES.MASTER]: ROUTES.MASTER.DASHBOARD,
  [ROLES.CUSTOMER]: ROUTES.ME.DASHBOARD,
};

export default function Login() {
  const { t } = useTranslation();
  const { loginWithGoogle, isLoading, error, isAuthenticated, isOnboarded, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!isOnboarded) {
      navigate(ROUTES.ONBOARDING.ROLE, { replace: true });
      return;
    }
    const from = location.state?.from?.pathname;
    navigate(from ?? ROLE_HOME[role] ?? ROUTES.HOME, { replace: true });
  }, [isAuthenticated, isOnboarded, role, navigate, location.state]);

  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4 dark:text-white dark:hover:text-white"
        >
          <ArrowLeft className="size-4" />
          {t('common.back')}
        </Link>

        <div className="card text-center animate-slide-up">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-500 text-white shadow-brand-glow">
            <Sparkles className="size-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">{t('auth.welcomeBack')}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-white">{t('auth.loginSubtitle')}</p>

          <button
            type="button"
            disabled={isLoading || !isFirebaseConfigured}
            onClick={() => loginWithGoogle()}
            className="btn-primary mt-6 w-full"
          >
            <GoogleIcon />
            {isLoading ? t('auth.loggingIn') : t('auth.loginWithGoogle')}
          </button>

          {!isFirebaseConfigured && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
              {t('auth.errors.noConfig')}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#FFFFFF"
        d="M21.35 11.1H12v3.8h5.35c-.25 1.65-1.95 4.85-5.35 4.85-3.2 0-5.85-2.7-5.85-6s2.65-6 5.85-6c1.85 0 3.05.8 3.75 1.45l2.55-2.45C16.7 5.3 14.55 4.3 12 4.3 6.95 4.3 2.85 8.4 2.85 13.45S6.95 22.6 12 22.6c6.9 0 9.45-4.85 9.45-7.3 0-.5-.05-.85-.1-1.2z"
      />
    </svg>
  );
}
