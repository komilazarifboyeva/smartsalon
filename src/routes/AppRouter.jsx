import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import MasterLayout from '../layouts/MasterLayout';
import SalonOwnerLayout from '../layouts/SalonOwnerLayout';
import BigAdminLayout from '../layouts/BigAdminLayout';
import OnboardingLayout from '../layouts/OnboardingLayout';

import ProtectedRoute from '../components/routing/ProtectedRoute';
import PublicOnlyRoute from '../components/routing/PublicOnlyRoute';
import OnboardingGuard from '../components/routing/OnboardingGuard';

import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Unauthorized from '../pages/public/Unauthorized';
import AccountDisabled from '../pages/public/AccountDisabled';
import NotFound from '../pages/public/NotFound';

import RoleSelect from '../pages/onboarding/RoleSelect';
import CustomerOnboarding from '../pages/onboarding/CustomerOnboarding';
import SalonOwnerOnboarding from '../pages/onboarding/SalonOwnerOnboarding';
import MasterOnboarding from '../pages/onboarding/MasterOnboarding';

import CustomerDashboard from '../pages/customer/Dashboard';
import SalonProfile from '../pages/customer/SalonProfile';
import CustomerBookings from '../pages/customer/Bookings';
import MasterDashboard from '../pages/master/Dashboard';
import MasterBookings from '../pages/master/Bookings';
import MasterReports from '../pages/master/Reports';
import SalonOwnerDashboard from '../pages/salonOwner/Dashboard';
import BigAdminDashboard from '../pages/bigAdmin/Dashboard';
import SalonOwners from '../pages/bigAdmin/SalonOwners';
import MasterInvitations from '../pages/salonOwner/MasterInvitations';
import Masters from '../pages/salonOwner/Masters';
import SalonServices from '../pages/salonOwner/Services';
import SalonOwnerBookings from '../pages/salonOwner/Bookings';

import ComingSoon from '../pages/common/ComingSoon';
import Profile from '../pages/common/Profile';
import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: ROUTES.HOME, element: <Home /> },
      { path: ROUTES.UNAUTHORIZED, element: <Unauthorized /> },
      { path: ROUTES.ACCOUNT_DISABLED, element: <AccountDisabled /> },
      {
        path: ROUTES.LOGIN,
        element: (
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        ),
      },
    ],
  },

  {
    path: ROUTES.ONBOARDING.ROOT,
    element: (
      <OnboardingGuard>
        <OnboardingLayout />
      </OnboardingGuard>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.ONBOARDING.ROLE} replace /> },
      { path: 'role', element: <RoleSelect /> },
      { path: 'customer', element: <CustomerOnboarding /> },
      { path: 'owner', element: <SalonOwnerOnboarding /> },
      { path: 'master', element: <MasterOnboarding /> },
    ],
  },

  {
    path: ROUTES.ADMIN.ROOT,
    element: (
      <ProtectedRoute allowedRoles={[ROLES.BIG_ADMIN]}>
        <BigAdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace /> },
      { path: 'dashboard', element: <BigAdminDashboard /> },
      { path: 'owners', element: <SalonOwners /> },
      { path: 'subscriptions', element: <ComingSoon titleKey="nav.subscriptions" /> },
      { path: 'analytics', element: <ComingSoon titleKey="nav.analytics" /> },
      { path: 'profile', element: <Profile /> },
    ],
  },

  {
    path: ROUTES.SALON.ROOT,
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SALON_OWNER]}>
        <SalonOwnerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.SALON.DASHBOARD} replace /> },
      { path: 'dashboard', element: <SalonOwnerDashboard /> },
      { path: 'bookings', element: <SalonOwnerBookings /> },
      { path: 'services', element: <SalonServices /> },
      { path: 'masters', element: <Masters /> },
      { path: 'invitations', element: <MasterInvitations /> },
      { path: 'profile', element: <Profile /> },
    ],
  },

  {
    path: ROUTES.MASTER.ROOT,
    element: (
      <ProtectedRoute allowedRoles={[ROLES.MASTER]}>
        <MasterLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.MASTER.DASHBOARD} replace /> },
      { path: 'dashboard', element: <MasterDashboard /> },
      { path: 'reports', element: <MasterReports /> },
      { path: 'bookings', element: <MasterBookings /> },
      { path: 'sms', element: <ComingSoon titleKey="master.sms.title" /> },
      { path: 'profile', element: <Profile /> },
    ],
  },

  {
    path: ROUTES.ME.ROOT,
    element: (
      <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.ME.DASHBOARD} replace /> },
      { path: 'dashboard', element: <CustomerDashboard /> },
      { path: 'salons', element: <Navigate to={ROUTES.ME.DASHBOARD} replace /> },
      { path: 'salons/:username', element: <SalonProfile /> },
      { path: 'bookings', element: <CustomerBookings /> },
      { path: 'profile', element: <Profile /> },
    ],
  },

  {
    element: <PublicLayout />,
    children: [{ path: '*', element: <NotFound /> }],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
