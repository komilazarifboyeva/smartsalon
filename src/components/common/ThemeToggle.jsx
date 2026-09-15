import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

export default function ThemeToggle({ compact = false, showLabel = false, className }) {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700',
        compact ? 'p-2' : 'px-3 py-2 text-sm font-medium',
        className,
      )}
      aria-label={isDark ? t('theme.light') : t('theme.dark')}
      title={isDark ? t('theme.light') : t('theme.dark')}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {showLabel && (
        <span className="hidden sm:inline">{isDark ? t('theme.light') : t('theme.dark')}</span>
      )}
    </button>
  );
}
