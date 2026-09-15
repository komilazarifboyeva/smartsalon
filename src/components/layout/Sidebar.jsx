import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { getProfileDisplayName, getProfileInitial, getProfilePhotoURL } from '../../utils/profileDisplay';

export default function Sidebar({ items = [], title }) {
  const { t } = useTranslation();
  const { logout, user, profile, role } = useAuth();
  const displayName = getProfileDisplayName(profile, user);
  const initial = getProfileInitial(profile, user);
  const photoURL = getProfilePhotoURL(profile, user);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:border-r md:border-slate-100 md:bg-white dark:md:border-slate-800 dark:md:bg-slate-950">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <span className="grid size-9 place-items-center rounded-xl bg-brand-500 text-white shadow-brand-glow">
          <Sparkles className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold leading-tight">
            <span className="text-slate-900 dark:text-white">Smart</span>
            <span className="text-brand-500"> Salon</span>
          </p>
          {title && <p className="text-xs text-slate-500 dark:text-white">{title}</p>}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-white dark:hover:bg-slate-800 dark:hover:text-white',
                    )
                  }
                >
                  <Icon className="size-5" />
                  {t(item.labelKey)}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              className="size-10 rounded-full border border-slate-200 object-cover dark:border-slate-700"
            />
          ) : (
            <div className="size-10 rounded-full bg-brand-100 grid place-items-center text-brand-600 font-semibold dark:bg-brand-950/50 dark:text-brand-400">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {displayName}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-white">{t(`roles.${role}`)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="btn-secondary w-full text-sm"
        >
          <LogOut className="size-4" />
          {t('auth.logout')}
        </button>
      </div>
    </aside>
  );
}
