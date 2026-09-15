import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Inbox, Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import FormField from '../common/FormField';
import ProfileAvatar from '../common/ProfileAvatar';
import { meSalonDetailPath } from '../../constants/routes';
import { listSalonsForCustomer } from '../../services/salonService';

function masterDisplayName(master) {
  const full = [master.firstName, master.lastName].filter(Boolean).join(' ');
  return full || master.username || '—';
}

function ownerDisplayName(salon) {
  const full = [salon.ownerFirstName, salon.ownerLastName].filter(Boolean).join(' ');
  return full || null;
}

function matchesSalonSearch(salon, queryText) {
  const q = queryText.toLowerCase();
  const name = (salon.name ?? '').toLowerCase();
  const username = (salon.ownerUsername ?? '').toLowerCase();
  const ownerName = (ownerDisplayName(salon) ?? '').toLowerCase();
  const bio = (salon.ownerBio ?? '').toLowerCase();
  return (
    name.includes(q)
    || username.includes(q)
    || `@${username}`.includes(q)
    || ownerName.includes(q)
    || bio.includes(q)
  );
}

function matchesMasterSearch(master, queryText) {
  const q = queryText.toLowerCase();
  const first = (master.firstName ?? '').toLowerCase();
  const last = (master.lastName ?? '').toLowerCase();
  const full = masterDisplayName(master).toLowerCase();
  const username = (master.username ?? '').toLowerCase();
  const bio = (master.bio ?? '').toLowerCase();
  return (
    first.includes(q)
    || last.includes(q)
    || full.includes(q)
    || username.includes(q)
    || `@${username}`.includes(q)
    || bio.includes(q)
  );
}

function SalonCard({ salon, masters }) {
  const salonProfilePath = salon.ownerUsername ? meSalonDetailPath(salon.ownerUsername) : null;
  const avatarName = ownerDisplayName(salon) ?? salon.ownerUsername ?? 'Salon';

  return (
    <article className="card flex flex-col gap-3">
      {salonProfilePath ? (
        <Link
          to={salonProfilePath}
          className="flex items-center gap-3 group min-w-0"
        >
          <ProfileAvatar
            name={avatarName}
            photoURL={salon.ownerPhotoURL}
            size="md"
            rounded="2xl"
          />
          <span className="font-mono text-sm font-semibold text-brand-600 truncate group-hover:underline">
            @{salon.ownerUsername}
          </span>
        </Link>
      ) : (
        <div className="flex items-center gap-3 min-w-0">
          <ProfileAvatar
            name={avatarName}
            photoURL={salon.ownerPhotoURL}
            size="md"
            rounded="2xl"
          />
          {salon.ownerUsername && (
            <span className="font-mono text-sm font-semibold text-slate-600 truncate dark:text-slate-300">
              @{salon.ownerUsername}
            </span>
          )}
        </div>
      )}

      {masters.length > 0 && (
        <ul className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {masters.map((master) => {
            if (!master.username) return null;
            const masterPath = meSalonDetailPath(master.username);

            return (
              <li key={master.uid}>
                <Link
                  to={masterPath}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-brand-600 hover:bg-brand-50 dark:bg-slate-800 dark:hover:bg-brand-950/40"
                >
                  <ProfileAvatar profile={master} size="xs" />
                  @{master.username}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

export default function CustomerSalonList() {
  const { t } = useTranslation();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSalons(await listSalonsForCustomer());
    } catch (err) {
      setError(err?.message ?? 'generic');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filteredSalons = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return salons.map((salon) => ({ salon, masters: salon.masters }));
    }

    return salons
      .filter((salon) => {
        const salonMatch = matchesSalonSearch(salon, q);
        const masterMatch = salon.masters.some((master) => matchesMasterSearch(master, q));
        return salonMatch || masterMatch;
      })
      .map((salon) => {
        const salonMatch = matchesSalonSearch(salon, q);
        const masters = salonMatch
          ? salon.masters
          : salon.masters.filter((master) => matchesMasterSearch(master, q));
        return { salon, masters };
      });
  }, [salons, search]);

  return (
    <>
      <FormField
        name="masterSearch"
        icon={Search}
        placeholder={t('customer.salons.searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {t('customer.salons.error')}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-brand-500" />
        </div>
      ) : filteredSalons.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-white">
            <Inbox className="size-8" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700 dark:text-white">
            {search.trim() ? t('customer.salons.emptySearch') : t('customer.salons.empty')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredSalons.map(({ salon, masters }) => (
            <SalonCard key={salon.id} salon={salon} masters={masters} />
          ))}
        </div>
      )}
    </>
  );
}
