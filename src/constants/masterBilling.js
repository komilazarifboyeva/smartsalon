import { firestoreToDate } from '../utils/datetime';

export const MASTER_TARIFFS = {
  USTA: 'usta',
};

export const DEFAULT_MASTER_TARIFF = MASTER_TARIFFS.USTA;

/** Master obunasi shuncha kunda bir marta to'lanadi. */
export const MASTER_BILLING_PERIOD_DAYS = 30;

/** users/{uid} hujjatidagi master billing maydonlari. */
export const MASTER_BILLING_FIELDS = [
  'tariff',
  'balance',
  'nextPaymentAt',
  'smsSentCount',
  'smsCountMonth',
];

export function billingMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function nextPaymentDateFrom(date = new Date()) {
  const next = new Date(date);
  next.setDate(next.getDate() + MASTER_BILLING_PERIOD_DAYS);
  next.setHours(12, 0, 0, 0);
  return next;
}

function startOfDayMs(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function daysUntil(date, now = new Date()) {
  if (!date) return null;
  return Math.round((startOfDayMs(date) - startOfDayMs(now)) / 86_400_000);
}

export function hasMasterBillingFields(profile) {
  return profile != null && typeof profile.balance === 'number';
}

export function buildMasterBillingDefaults(now = new Date()) {
  return {
    tariff: DEFAULT_MASTER_TARIFF,
    balance: 0,
    nextPaymentAt: nextPaymentDateFrom(now),
    smsSentCount: 0,
    smsCountMonth: billingMonthKey(now),
  };
}

/** Profil hujjatidagi xom maydonlarni UI kutgan ko'rinishga keltiradi. */
export function normalizeMasterBilling(profile, now = new Date()) {
  const nextPaymentAt = firestoreToDate(profile?.nextPaymentAt);
  const balance = Number(profile?.balance ?? 0);
  const isCurrentMonth = profile?.smsCountMonth === billingMonthKey(now);

  return {
    tariff: profile?.tariff ?? DEFAULT_MASTER_TARIFF,
    nextPaymentAt,
    daysLeft: daysUntil(nextPaymentAt, now),
    balance,
    isBalanceNegative: balance < 0,
    smsSentCount: isCurrentMonth ? Number(profile?.smsSentCount ?? 0) : 0,
  };
}
