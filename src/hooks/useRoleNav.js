import {
  Home,
  CalendarCheck,
  User,
  LayoutDashboard,
  Scissors,
  Users,
  BarChart3,
  Building2,
  CreditCard,
  Mail,
} from 'lucide-react';
import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';

export const NAV_BY_ROLE = {
  [ROLES.CUSTOMER]: [
    { to: ROUTES.ME.DASHBOARD, labelKey: 'nav.home', icon: Home },
    { to: ROUTES.ME.BOOKINGS, labelKey: 'nav.bookings', icon: CalendarCheck },
    { to: ROUTES.ME.PROFILE, labelKey: 'nav.profile', icon: User },
  ],
  [ROLES.MASTER]: [
    { to: ROUTES.MASTER.DASHBOARD, labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { to: `${ROUTES.MASTER.ROOT}/bookings`, labelKey: 'nav.bookings', icon: CalendarCheck },
    { to: `${ROUTES.MASTER.ROOT}/reports`, labelKey: 'nav.report', icon: BarChart3 },
    { to: ROUTES.MASTER.PROFILE, labelKey: 'nav.profile', icon: User },
  ],
  [ROLES.SALON_OWNER]: [
    { to: ROUTES.SALON.DASHBOARD, labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { to: `${ROUTES.SALON.ROOT}/bookings`, labelKey: 'nav.bookings', icon: CalendarCheck },
    { to: `${ROUTES.SALON.ROOT}/services`, labelKey: 'nav.services', icon: Scissors },
    { to: `${ROUTES.SALON.ROOT}/masters`, labelKey: 'nav.masters', icon: Users },
    { to: `${ROUTES.SALON.ROOT}/invitations`, labelKey: 'nav.invitations', icon: Mail },
    { to: ROUTES.SALON.PROFILE, labelKey: 'nav.profile', icon: User },
  ],
  [ROLES.BIG_ADMIN]: [
    { to: ROUTES.ADMIN.DASHBOARD, labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { to: `${ROUTES.ADMIN.ROOT}/owners`, labelKey: 'nav.owners', icon: Building2 },
    { to: `${ROUTES.ADMIN.ROOT}/subscriptions`, labelKey: 'nav.subscriptions', icon: CreditCard },
    { to: `${ROUTES.ADMIN.ROOT}/analytics`, labelKey: 'nav.analytics', icon: BarChart3 },
    { to: ROUTES.ADMIN.PROFILE, labelKey: 'nav.profile', icon: User },
  ],
};

export function useRoleNav(role) {
  return NAV_BY_ROLE[role] ?? [];
}
