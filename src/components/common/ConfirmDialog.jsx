import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Loader2,
  ShieldOff,
  Sparkles,
  Trash2,
} from 'lucide-react';
import Modal from './Modal';
import { cn } from '../../utils/cn';

const ICON_MAP = {
  danger: { Icon: Trash2, wrap: 'bg-red-50 dark:bg-red-950/40 text-red-500' },
  block: { Icon: Ban, wrap: 'bg-red-50 dark:bg-red-950/40 text-red-500' },
  unblock: { Icon: CheckCircle2, wrap: 'bg-brand-50 dark:bg-brand-950/40 text-brand-500' },
  brand: { Icon: Sparkles, wrap: 'bg-brand-50 dark:bg-brand-950/40 text-brand-500' },
  warning: { Icon: AlertTriangle, wrap: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600' },
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  subtitle,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  loading = false,
}) {
  const tone = variant === 'danger' ? 'block' : variant;
  const { Icon, wrap } = ICON_MAP[tone] ?? ICON_MAP.warning;
  const isDanger = variant === 'danger' || variant === 'block';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="sm"
      hideClose={loading}
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-4 dark:border-brand-900/50 dark:from-slate-950/80 dark:to-slate-900">
          <span className={cn('grid size-11 shrink-0 place-items-center rounded-2xl', wrap)}>
            {variant === 'block' ? (
              <ShieldOff className="size-5" />
            ) : (
              <Icon className="size-5" />
            )}
          </span>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-white">{message}</p>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary flex-1 sm:flex-none"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'btn flex-1 sm:flex-none',
              isDanger
                ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
                : 'btn-primary',
            )}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
