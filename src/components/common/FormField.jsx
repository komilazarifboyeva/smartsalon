import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

const FormField = forwardRef(function FormField(
  { label, hint, error, icon: Icon, prefix, className, ...inputProps },
  ref,
) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={inputProps.id ?? inputProps.name}
          className="text-sm font-medium text-slate-700 dark:text-white"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-stretch overflow-hidden rounded-xl border bg-white transition-all dark:bg-slate-900',
          'focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent',
          error ? 'border-red-300 dark:border-red-800' : 'border-slate-200 dark:border-slate-700',
        )}
      >
        {Icon && (
          <span className="grid place-items-center px-3 text-slate-400 dark:text-slate-500">
            <Icon className="size-4" />
          </span>
        )}
        {prefix && (
          <span className="grid place-items-center px-3 text-sm font-medium text-slate-500 bg-slate-50 border-r border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          {...inputProps}
          id={inputProps.id ?? inputProps.name}
          className={cn(
            'w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-white/60',
            (Icon || prefix) && 'pl-2',
          )}
        />
      </div>
      {error ? (
        <p className="flex items-start gap-1 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500 dark:text-white">{hint}</p>
      ) : null}
    </div>
  );
});

export default FormField;
