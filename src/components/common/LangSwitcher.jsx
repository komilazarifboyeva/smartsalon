import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../config/i18n';
import { cn } from '../../utils/cn';

export default function LangSwitcher({ compact = false }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.resolvedLanguage) ??
    SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const change = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700',
          compact && 'px-2 py-1.5 text-xs',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="size-4 text-brand-500" />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden font-semibold">{current.flag}</span>
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg animate-fade-in dark:border-slate-700 dark:bg-slate-900"
        >
          {SUPPORTED_LANGUAGES.map((lng) => {
            const active = lng.code === current.code;
            return (
              <li key={lng.code}>
                <button
                  type="button"
                  onClick={() => change(lng.code)}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800',
                    active && 'text-brand-600 font-semibold dark:text-brand-400',
                  )}
                  role="option"
                  aria-selected={active}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-white">{lng.flag}</span>
                    {lng.label}
                  </span>
                  {active && <Check className="size-4 text-brand-500" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
