import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../common/Loader';
import { ROLES } from '../../constants/roles';
import { ROUTES } from '../../constants/routes';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, profile, role, isBootstrapped, isOnboarded } = useAuth();
  const location = useLocation();

  if (!isBootstrapped) return <Loader fullscreen />;

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!isOnboarded) {
    return <Navigate to={ROUTES.ONBOARDING.ROLE} replace />;
  }

  if (profile?.isDisabled && (role === ROLES.MASTER || role === ROLES.SALON_OWNER)) {
    if (location.pathname !== ROUTES.ACCOUNT_DISABLED) {
      return <Navigate to={ROUTES.ACCOUNT_DISABLED} replace />;
    }
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children ?? <Outlet />;
}
