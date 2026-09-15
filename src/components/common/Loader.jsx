import { Loader2 } from 'lucide-react';

import { cn } from '../../utils/cn';



export default function Loader({ fullscreen = false, label, className }) {

  if (fullscreen) {

    return (

      <div className="fixed inset-0 z-[100] grid place-items-center bg-white/80 backdrop-blur-sm dark:bg-slate-950/80">

        <div className="flex flex-col items-center gap-3">

          <Loader2 className="size-10 animate-spin text-brand-500" />

          {label && <p className="text-sm text-slate-600 dark:text-white">{label}</p>}

        </div>

      </div>

    );

  }

  return (

    <div className={cn('flex items-center justify-center py-8', className)}>

      <Loader2 className="size-6 animate-spin text-brand-500" />

      {label && <span className="ml-2 text-sm text-slate-600 dark:text-white">{label}</span>}

    </div>

  );

}

