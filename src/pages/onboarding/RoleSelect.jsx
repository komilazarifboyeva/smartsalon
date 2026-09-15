import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Scissors, Store, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { cn } from '../../utils/cn';

const OPTIONS = [
  {
    id: 'customer',
    icon: User,
    target: ROUTES.ONBOARDING.CUSTOMER,
    accent: 'from-pink-100 to-rose-100',
  },
  {
    id: 'master',
    icon: Scissors,
    target: ROUTES.ONBOARDING.MASTER,
    accent: 'from-violet-100 to-fuchsia-100',
  },
  {
    id: 'salon_owner',
    icon: Store,
    target: ROUTES.ONBOARDING.OWNER,
    accent: 'from-amber-100 to-orange-100',
  },
];

export default function RoleSelect() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">
          {t('onboarding.stepOf', { current: 1, total: 2 })}
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 text-balance dark:text-white">
          {t('onboarding.roleSelect.title')}
        </h1>
        <p className="mt-2 text-sm text-slate-600 text-balance dark:text-white">
          {t('onboarding.roleSelect.subtitle')}
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => navigate(opt.target)}
            className={cn(
              'group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 text-left transition-all',
              'hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
            )}
          >
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  'shrink-0 grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-brand-600 transition-transform group-hover:scale-110',
                  opt.accent,
                )}
              >
                <opt.icon className="size-7" />
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {t(`onboarding.roleSelect.${opt.id}.title`)}
                </h3>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-white">
                  {t(`onboarding.roleSelect.${opt.id}.desc`)}
                </p>
              </div>
              <ArrowRight className="size-5 shrink-0 text-slate-400 transition-all group-hover:text-brand-500 group-hover:translate-x-1 dark:text-white" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
