import { createSlice } from '@reduxjs/toolkit';
import {
  bootstrapAuth,
  loginWithGoogle,
  logout,
  refreshProfile,
  updateProfile,
  uploadProfilePhoto,
  completeCustomerOnboarding,
  completeOwnerOnboarding,
  completeMasterOnboarding,
} from './authThunks';

const initialState = {
  user: null,
  profile: null,
  role: null,
  status: 'idle',
  error: null,
  onboardingStatus: 'idle',
  onboardingError: null,
  isBootstrapped: false,
};

function applyAuthPayload(state, payload) {
  if (payload) {
    state.user = payload.user;
    state.profile = payload.profile;
    state.role = payload.profile?.role ?? null;
  } else {
    state.user = null;
    state.profile = null;
    state.role = null;
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setProfile(state, action) {
      state.profile = action.payload;
      state.role = action.payload?.role ?? null;
    },
    clearAuth(state) {
      state.user = null;
      state.profile = null;
      state.role = null;
      state.status = 'idle';
      state.error = null;
      state.onboardingStatus = 'idle';
      state.onboardingError = null;
    },
    clearError(state) {
      state.error = null;
      state.onboardingError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.status = 'succeeded';
        applyAuthPayload(state, action.payload);
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.role = null;
        state.status = 'idle';
        state.error = null;
        state.onboardingStatus = 'idle';
        state.onboardingError = null;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        applyAuthPayload(state, action.payload);
        state.isBootstrapped = true;
      })
      .addCase(bootstrapAuth.rejected, (state, action) => {
        state.isBootstrapped = true;
        state.error = action.payload ?? action.error.message;
      })
      .addCase(refreshProfile.fulfilled, (state, action) => {
        if (action.payload) {
          state.profile = action.payload;
          state.role = action.payload.role ?? null;
        }
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (action.payload) {
          state.profile = action.payload;
          state.role = action.payload.role ?? null;
        }
      })
      .addCase(uploadProfilePhoto.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.profile = action.payload.profile;
          state.role = action.payload.profile?.role ?? null;
        }
      })
      .addMatcher(
        (action) => [
          completeCustomerOnboarding.pending.type,
          completeOwnerOnboarding.pending.type,
          completeMasterOnboarding.pending.type,
        ].includes(action.type),
        (state) => {
          state.onboardingStatus = 'loading';
          state.onboardingError = null;
        },
      )
      .addMatcher(
        (action) => [
          completeCustomerOnboarding.fulfilled.type,
          completeOwnerOnboarding.fulfilled.type,
          completeMasterOnboarding.fulfilled.type,
        ].includes(action.type),
        (state, action) => {
          state.onboardingStatus = 'succeeded';
          if (action.payload) {
            state.profile = action.payload;
            state.role = action.payload.role ?? null;
          }
        },
      )
      .addMatcher(
        (action) => [
          completeCustomerOnboarding.rejected.type,
          completeOwnerOnboarding.rejected.type,
          completeMasterOnboarding.rejected.type,
        ].includes(action.type),
        (state, action) => {
          state.onboardingStatus = 'failed';
          state.onboardingError = action.payload ?? action.error.message;
        },
      );
  },
});

export const { setProfile, clearAuth, clearError } = authSlice.actions;

export default authSlice.reducer;
