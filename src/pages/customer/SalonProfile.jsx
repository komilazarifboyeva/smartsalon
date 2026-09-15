import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarCheck,
  Clock,
  Loader2,
  MapPin,
  Phone,
  Scissors,
  Store,
  User,
} from 'lucide-react';
import InlineBookingPanel from '../../components/booking/InlineBookingPanel';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import { formatPrice } from '../../constants/servicePresets';
import { WEEKDAY_KEYS } from '../../constants/workingHours';
import { ROUTES, meSalonDetailPath } from '../../constants/routes';
import { fetchPublicProfileByUsername } from '../../services/publicSalonService';
import { useAuth } from '../../hooks/useAuth';
import { PHONE_DISPLAY_PREFIX } from '../../utils/phone';

function formatDisplayPhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length >= 12 && digits.startsWith('998')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`.trim();
  }
  return phone.startsWith('+') ? phone : `${PHONE_DISPLAY_PREFIX}${phone}`;
}

function masterDisplayName(master) {
  const full = [master.firstName, master.lastName].filter(Boolean).join(' ');
  return full || master.username || '—';
}

function WorkingHoursList({ hours, t }) {
  if (!hours) return null;

  return (
    <ul className="space-y-2">
      {WEEKDAY_KEYS.map((key) => {
        const day = hours[key];
        const label = day?.closed
          ? t('customer.salonProfile.closed')
          : t('customer.salonProfile.hoursRange', {
              open: day?.open ?? '—',
              close: day?.close ?? '—',
            });

        return (
          <li
            key={key}
            className="flex items-center justify-between gap-4 text-sm text-slate-700 dark:text-white"
          >
            <span className="font-medium">{t(`customer.salonProfile.weekdays.${key}`)}</span>
            <span className={day?.closed ? 'text-slate-400 dark:text-slate-500' : ''}>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}

function ServiceCard({ service, t }) {
  const durationKey = service.durationPreset ?? String(service.durationMinutes);
  const durationLabel = t(`services.durationPresets.${durationKey}`, {
    defaultValue: `${service.durationMinutes} min`,
  });

  return (
    <article className="card flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/40">
          <Scissors className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900 dark:text-white">{service.name}</h3>
          <p className="mt-1 text-lg font-extrabold text-brand-600">{formatPrice(service.price)}</p>
        </div>
      </div>
      <p className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-white">
        <Clock className="size-4 shrink-0 text-slate-400 dark:text-white" />
        {durationLabel}
      </p>
    </article>
  );
}

export default function SalonProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile: authProfile } = useAuth();
  const { username: usernameParam } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [showBooking, setShowBooking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    setProfile(null);
    setShowBooking(false);

    try {
      const data = await fetchPublicProfileByUsername(usernameParam);
      if (!data) {
        setNotFound(true);
        return;
      }
      setProfile(data);
    } catch (err) {
      setError(err?.message ?? 'generic');
    } finally {
      setLoading(false);
    }
  }, [usernameParam]);

  useEffect(() => {
    load();
  }, [load]);

  const bookableServices = useMemo(() => {
    if (!profile) return [];

    if (profile.view === 'master') {
      return profile.services.map((service) => ({
        master: profile.master,
        service,
      }));
    }

    const salonLevel = profile.salonServices.map((service) => ({
      master: null,
      service,
    }));
    const masterLevel = profile.mastersWithServices.flatMap((group) =>
      group.services.map((service) => ({
        master: group.master,
        service,
      })),
    );
    return [...salonLevel, ...masterLevel];
  }, [profile]);

  const customerForBooking = useMemo(
    () => ({
      uid: user?.uid,
      firstName: authProfile?.firstName,
      lastName: authProfile?.lastName,
      phone: authProfile?.phone,
    }),
    [user?.uid, authProfile],
  );

  const handleBookingSuccess = () => {
    setShowBooking(false);
    navigate(ROUTES.ME.BOOKINGS, { state: { bookingCreated: true } });
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-center">
        <p className="text-sm text-slate-600 dark:text-white">{t('customer.salonProfile.notFound')}</p>
        <Link to={ROUTES.ME.DASHBOARD} className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="size-4" />
          {t('customer.salonProfile.backToSalons')}
        </Link>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-center">
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {t('customer.salonProfile.error')}
        </p>
        <button type="button" className="btn-secondary" onClick={load}>
          {t('common.retry')}
        </button>
      </div>
    );
  }

  const isMaster = profile.view === 'master';
  const isSalon = profile.view === 'salon';
  const headerPhotoURL = isMaster ? profile.photoURL : profile.ownerPhotoURL;
  const phoneDisplay = formatDisplayPhone(isMaster ? profile.phone : profile.ownerPhone ?? profile.phone);
  const bioText = isMaster ? profile.bio : profile.ownerBio;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 animate-fade-in">
      <Link
        to={ROUTES.ME.DASHBOARD}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
      >
        <ArrowLeft className="size-4" />
        {t('customer.salonProfile.backToSalons')}
      </Link>

      <header className="card space-y-4">
        <div className="flex items-start gap-4">
          <ProfileAvatar
            name={profile.displayName}
            photoURL={headerPhotoURL}
            profile={isMaster ? profile.master : null}
            size="lg"
            rounded="2xl"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white">
              {isMaster
                ? t('customer.salonProfile.masterAccount')
                : t('customer.salonProfile.salonAccount')}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{profile.displayName}</h1>
            {isSalon && profile.ownerDisplayName && (
              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                {profile.ownerDisplayName}
              </p>
            )}
            {profile.displayUsername && (
              <p className="mt-1 font-mono text-sm text-brand-600">@{profile.displayUsername}</p>
            )}
            {isSalon && profile.salonName && profile.displayName !== profile.salonName && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600 dark:text-white">
                <Store className="size-4 shrink-0 text-brand-500" />
                {profile.salonName}
              </p>
            )}
          </div>
        </div>

        {bioText?.trim() && (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap dark:bg-slate-950/60 dark:text-slate-200">
            {bioText.trim()}
          </p>
        )}

        <ul className="space-y-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
          {isSalon && profile.ownerDisplayName && (
            <li className="flex items-start gap-2 text-slate-700 dark:text-white">
              <User className="mt-0.5 size-4 shrink-0 text-brand-500" />
              <span>{profile.ownerDisplayName}</span>
            </li>
          )}
          <li className="flex items-start gap-2 text-slate-700 dark:text-white">
            <Phone className="mt-0.5 size-4 shrink-0 text-brand-500" />
            {phoneDisplay ? (
              <a href={`tel:${phoneDisplay.replace(/\s/g, '')}`} className="hover:text-brand-600">
                {phoneDisplay}
              </a>
            ) : (
              <span className="text-slate-400 dark:text-white">{t('customer.salonProfile.noPhone')}</span>
            )}
          </li>
          <li className="flex items-start gap-2 text-slate-700 dark:text-white">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand-500" />
            {profile.address ? (
              <span>{profile.address}</span>
            ) : (
              <span className="text-slate-400 dark:text-white">{t('customer.salonProfile.noAddress')}</span>
            )}
          </li>
        </ul>
      </header>

      {profile.workingHours && (
        <section className="card space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <Clock className="size-5 text-brand-500" />
            {t('customer.salonProfile.workingHours')}
          </h2>
          <WorkingHoursList hours={profile.workingHours} t={t} />
        </section>
      )}

      {isMaster ? (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <Scissors className="size-5 text-brand-500" />
            {t('customer.salonProfile.services')}
          </h2>
          {profile.services.length === 0 ? (
            <div className="card py-8 text-center text-sm text-slate-500 dark:text-white">
              {t('customer.salonProfile.noServices')}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.services.map((service) => (
                <ServiceCard key={service.id} service={service} t={t} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {profile.salonServices.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                <Scissors className="size-5 text-brand-500" />
                {t('customer.salonProfile.salonServices')}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.salonServices.map((service) => (
                  <ServiceCard key={service.id} service={service} t={t} />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <User className="size-5 text-brand-500" />
              {t('customer.salonProfile.masters')}
            </h2>
            {profile.mastersWithServices.length === 0 ? (
              <div className="card py-8 text-center text-sm text-slate-500 dark:text-white">
                {t('customer.salons.noMasters')}
              </div>
            ) : (
              <div className="space-y-3">
                {profile.mastersWithServices.map(({ master }) => (
                  <article key={master.uid} className="card">
                    <div className="flex items-start gap-3">
                      <ProfileAvatar profile={master} size="md" />
                      <div className="min-w-0 flex-1">
                        {master.username ? (
                          <Link
                            to={meSalonDetailPath(master.username)}
                            className="inline-flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-brand-600 dark:text-white"
                          >
                            {masterDisplayName(master)}
                            <span className="font-mono text-brand-600">@{master.username}</span>
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {masterDisplayName(master)}
                          </p>
                        )}
                        {master.bio?.trim() && (
                          <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap dark:text-slate-300">
                            {master.bio.trim()}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {profile.salonServices.length === 0 && profile.mastersWithServices.length === 0 && (
            <div className="card py-8 text-center text-sm text-slate-500 dark:text-white">
              {t('customer.salonProfile.noServices')}
            </div>
          )}
        </>
      )}

      {bookableServices.length > 0 && (
        <div className="space-y-4">
          {!showBooking ? (
            <button
              type="button"
              className="btn-primary inline-flex w-full items-center justify-center gap-2 py-3 text-base"
              onClick={() => setShowBooking(true)}
            >
              <CalendarCheck className="size-5" />
              {t('customer.salonProfile.book')}
            </button>
          ) : (
            <InlineBookingPanel
              salon={profile.salon}
              services={bookableServices}
              master={isMaster ? profile.master : null}
              customer={customerForBooking}
              onSuccess={handleBookingSuccess}
            />
          )}
        </div>
      )}
    </div>
  );
}
