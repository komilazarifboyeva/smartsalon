export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ACCOUNT_DISABLED: '/account-disabled',
  NOT_FOUND: '*',

  ONBOARDING: {
    ROOT: '/onboarding',
    ROLE: '/onboarding/role',
    CUSTOMER: '/onboarding/customer',
    OWNER: '/onboarding/owner',
    MASTER: '/onboarding/master',
  },

  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    PROFILE: '/admin/profile',
  },

  SALON: {
    ROOT: '/salon',
    DASHBOARD: '/salon/dashboard',
    BOOKINGS: '/salon/bookings',
    PROFILE: '/salon/profile',
  },

  MASTER: {
    ROOT: '/master',
    DASHBOARD: '/master/dashboard',
    PROFILE: '/master/profile',
  },

  ME: {
    ROOT: '/me',
    DASHBOARD: '/me/dashboard',
    SALONS: '/me/salons',
    SALON_DETAIL: '/me/salons/:username',
    BOOKINGS: '/me/bookings',
    PROFILE: '/me/profile',
  },
};

export function meSalonDetailPath(username, options = {}) {
  const clean = String(username ?? '').replace(/^@/, '').trim().toLowerCase();
  const path = `${ROUTES.ME.SALONS}/${encodeURIComponent(clean)}`;
  if (options.master) {
    const master = String(options.master).replace(/^@/, '').trim().toLowerCase();
    return `${path}?master=${encodeURIComponent(master)}`;
  }
  return path;
}
