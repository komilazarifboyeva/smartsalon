import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { refreshProfile } from '../../features/auth/authThunks';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';

/** Auth profilini marshrut/focus o'zgarganda yangilaydi (masalan, master bloklanganda). */
export default function AuthSync() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(refreshProfile());
    }
  }, [dispatch, isAuthenticated, location.pathname]);

  useEffect(() => {
    if (!isAuthenticated || role !== ROLES.MASTER) return;
    const onFocus = () => dispatch(refreshProfile());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [dispatch, isAuthenticated, role]);

  return null;
}
