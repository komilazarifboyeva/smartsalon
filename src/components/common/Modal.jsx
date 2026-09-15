import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

const SIZE_CLASS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  hideClose = false,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm animate-fade-in dark:bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative w-full animate-slide-up overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-2xl shadow-brand-500/10 dark:border-brand-900/50 dark:bg-slate-900 dark:shadow-black/40',
          SIZE_CLASS[size] ?? SIZE_CLASS.md,
        )}
      >
        <div className="border-b border-brand-100 bg-gradient-to-r from-brand-50 via-fuchsia-50 to-white px-5 py-4 dark:border-brand-900/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title && (
                <h2 id="modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-slate-600 dark:text-white">{subtitle}</p>
              )}
            </div>
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                className="grid size-8 shrink-0 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-white/80 hover:text-slate-700 dark:text-white dark:hover:bg-slate-800"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
