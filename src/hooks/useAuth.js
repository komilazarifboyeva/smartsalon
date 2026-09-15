import { useDispatch, useSelector } from 'react-redux';
import {
  selectAuthError,
  selectAuthStatus,
  selectIsAuthenticated,
  selectIsBootstrapped,
  selectIsOnboarded,
  selectOnboardingError,
  selectOnboardingStatus,
  selectProfile,
  selectRole,
  selectUser,
} from '../features/auth/authSelectors';
import {
  completeCustomerOnboarding,
  completeMasterOnboarding,
  completeOwnerOnboarding,
  loginWithGoogle,
  logout,
  refreshProfile,
  updateProfile,
  uploadProfilePhoto,
} from '../features/auth/authThunks';

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const profile = useSelector(selectProfile);
  const role = useSelector(selectRole);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const isBootstrapped = useSelector(selectIsBootstrapped);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isOnboarded = useSelector(selectIsOnboarded);
  const onboardingStatus = useSelector(selectOnboardingStatus);
  const onboardingError = useSelector(selectOnboardingError);

  return {
    user,
    profile,
    role,
    status,
    error,
    isBootstrapped,
    isAuthenticated,
    isOnboarded,
    isLoading: status === 'loading',
    onboardingStatus,
    onboardingError,
    isOnboardingLoading: onboardingStatus === 'loading',
    loginWithGoogle: () => dispatch(loginWithGoogle()),
    logout: () => dispatch(logout()),
    refreshProfile: () => dispatch(refreshProfile()),
    updateProfile: (payload) => dispatch(updateProfile(payload)),
    uploadProfilePhoto: (file) => dispatch(uploadProfilePhoto(file)),
    completeCustomerOnboarding: (payload) => dispatch(completeCustomerOnboarding(payload)),
    completeOwnerOnboarding: (payload) => dispatch(completeOwnerOnboarding(payload)),
    completeMasterOnboarding: (payload) => dispatch(completeMasterOnboarding(payload)),
  };
}
