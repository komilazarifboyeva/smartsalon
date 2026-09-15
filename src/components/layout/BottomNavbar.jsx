import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

export default function BottomNavbar({ items = [] }) {
  const { t } = useTranslation();

  if (!items || items.length === 0) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-lg shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] safe-bottom dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.45)]"
      aria-label="Bottom navigation"
    >
      <ul className="flex h-16 items-stretch justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex h-full flex-col items-center justify-center gap-1 px-2 text-[11px] font-medium transition-colors',
                    isActive
                      ? 'text-brand-500'
                      : 'text-slate-500 hover:text-slate-800 dark:text-white dark:hover:text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'grid size-9 place-items-center rounded-xl transition-all',
                        isActive ? 'bg-brand-50 dark:bg-brand-950/50' : 'bg-transparent',
                      )}
                    >
                      <Icon className={cn('size-5', isActive && 'scale-110 transition-transform')} />
                    </span>
                    <span className="truncate max-w-[64px]">{t(item.labelKey)}</span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
