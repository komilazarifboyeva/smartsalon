import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../common/Loader';
import { ROLES } from '../../constants/roles';
import { ROUTES } from '../../constants/routes';

const ROLE_HOME = {
  [ROLES.BIG_ADMIN]: ROUTES.ADMIN.DASHBOARD,
  [ROLES.SALON_OWNER]: ROUTES.SALON.DASHBOARD,
  [ROLES.MASTER]: ROUTES.MASTER.DASHBOARD,
  [ROLES.CUSTOMER]: ROUTES.ME.DASHBOARD,
};

export default function PublicOnlyRoute({ children }) {
  const { user, role, isBootstrapped, isOnboarded } = useAuth();

  if (!isBootstrapped) return <Loader fullscreen />;

  if (user) {
    if (!isOnboarded) {
      return <Navigate to={ROUTES.ONBOARDING.ROLE} replace />;
    }
    return <Navigate to={ROLE_HOME[role] ?? ROUTES.HOME} replace />;
  }

  return children ?? <Outlet />;
}
