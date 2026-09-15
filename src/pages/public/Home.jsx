import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Calendar, Scissors, Sparkles, Star } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

const FEATURES = [
  { icon: Scissors, titleKey: 'nav.services', descKey: 'app.tagline' },
  { icon: Calendar, titleKey: 'nav.bookings', descKey: 'app.tagline' },
  { icon: Star, titleKey: 'nav.masters', descKey: 'app.tagline' },
];

export default function Home() {
  const { t } = useTranslation()

  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900"
          aria-hidden
        />
        <div
          className="absolute -top-24 right-1/3 -z-10 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl"
          aria-hidden
        />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold text-brand-600 shadow-sm dark:bg-slate-900">
              <Sparkles className="size-3.5" />
              {t('app.name')}
            </span>
            <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
              {t('pages.home.heroTitle')}
            </h1>
            <p className="mt-5 text-balance text-base text-slate-600 sm:text-lg dark:text-white">
              {t('pages.home.heroSubtitle')}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={ROUTES.LOGIN} className="btn-primary w-full sm:w-auto">
                {t('pages.home.ctaPrimary')}
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#features"
                className="btn-secondary w-full sm:w-auto"
              >
                {t('pages.home.ctaSecondary')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="card group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="inline-grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors dark:bg-brand-950/40">
                <f.icon className="size-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{t(f.titleKey)}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-white">{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
