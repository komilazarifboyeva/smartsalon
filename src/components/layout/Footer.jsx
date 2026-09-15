import { useTranslation } from 'react-i18next';

import { Sparkles } from 'lucide-react';



export default function Footer() {

  const { t } = useTranslation();

  const year = new Date().getFullYear();



  return (

    <footer className="mt-auto border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950">

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="flex flex-col items-center gap-3 text-center md:flex-row md:justify-between md:text-left">

          <div className="flex items-center gap-2">

            <span className="grid size-7 place-items-center rounded-lg bg-brand-500 text-white">

              <Sparkles className="size-4" />

            </span>

            <p className="text-sm font-semibold">

              <span className="text-slate-900 dark:text-white">Smart</span>

              <span className="text-brand-500"> Salon</span>

            </p>

          </div>

          <p className="text-xs text-slate-500 dark:text-white">

            &copy; {year} {t('app.name')}. {t('app.tagline')}

          </p>

        </div>

      </div>

    </footer>

  );

}

