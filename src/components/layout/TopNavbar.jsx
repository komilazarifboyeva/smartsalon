import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { cn } from '../../utils/cn';
import LangSwitcher from '../common/LangSwitcher';
import ThemeToggle from '../common/ThemeToggle';
import { getProfileDisplayName, getProfileInitial, getProfilePhotoURL } from '../../utils/profileDisplay';

export default function TopNavbar({ links = [], showAuthActions = true }) {
  const { t } = useTranslation();
  const { isAuthenticated, user, profile, logout } = useAuth();
  const displayName = getProfileDisplayName(profile, user);
  const initial = getProfileInitial(profile, user);
  const photoURL = getProfilePhotoURL(profile, user);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-500 text-white shadow-brand-glow transition-transform group-hover:scale-105">
            <Sparkles className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-slate-900 dark:text-white">Smart</span>
            <span className="text-brand-500"> Salon</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-white dark:hover:bg-slate-800 dark:hover:text-white',
                )
              }
            >
              {link.icon && <link.icon className="size-4" />}
              {t(link.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <LangSwitcher compact />
          {showAuthActions &&
            (isAuthenticated ? (
              <div className="flex items-center gap-2">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName}
                    className="size-9 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                  />
                ) : (
                  <div className="size-9 rounded-full bg-brand-100 grid place-items-center text-brand-600 font-semibold">
                    {initial}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => logout()}
                  className="btn-ghost hidden sm:inline-flex"
                  aria-label={t('auth.logout')}
                >
                  <LogOut className="size-4" />
                  <span className="hidden lg:inline">{t('auth.logout')}</span>
                </button>
              </div>
            ) : (
              <Link to={ROUTES.LOGIN} className="btn-primary text-sm">
                <LogIn className="size-4" />
                <span className="hidden sm:inline">{t('auth.login')}</span>
              </Link>
            ))}
        </div>
      </div>
    </header>
  );
}
