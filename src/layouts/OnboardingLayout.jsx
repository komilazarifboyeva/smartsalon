import { Outlet } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { LogOut, Sparkles } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

import LangSwitcher from '../components/common/LangSwitcher';

import ThemeToggle from '../components/common/ThemeToggle';



export default function OnboardingLayout() {

  const { t } = useTranslation();

  const { logout, user } = useAuth();



  return (

    <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">

      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">

        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4">

          <div className="flex items-center gap-2">

            <span className="grid size-9 place-items-center rounded-xl bg-brand-500 text-white shadow-brand-glow">

              <Sparkles className="size-5" />

            </span>

            <span className="text-lg font-bold tracking-tight">

              <span className="text-slate-900 dark:text-white">Smart</span>

              <span className="text-brand-500"> Salon</span>

            </span>

          </div>



          <div className="flex items-center gap-2">

            <ThemeToggle compact />

            <LangSwitcher compact />

            {user && (

              <button

                type="button"

                onClick={() => logout()}

                className="btn-ghost text-sm"

                aria-label={t('auth.logout')}

              >

                <LogOut className="size-4" />

                <span className="hidden sm:inline">{t('auth.logout')}</span>

              </button>

            )}

          </div>

        </div>

      </header>



      <main className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">

        <div className="w-full max-w-2xl">

          <Outlet />

        </div>

      </main>

    </div>

  );

}

