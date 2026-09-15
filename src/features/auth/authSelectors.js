export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectProfile = (state) => state.auth.profile;
export const selectRole = (state) => state.auth.role;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectIsBootstrapped = (state) => state.auth.isBootstrapped;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectIsOnboarded = (state) =>
  Boolean(state.auth.profile?.onboardingCompleted);
export const selectOnboardingStatus = (state) => state.auth.onboardingStatus;
export const selectOnboardingError = (state) => state.auth.onboardingError;
