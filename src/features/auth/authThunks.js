import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  serializeFirebaseUser,
  signInWithGoogle,
  signOutUser,
  subscribeToAuthChanges,
  updateAuthPhotoURL,
} from '../../services/authService';
import {
  ensureUserProfile,
  fetchUserProfile,
  updateUserProfile,
} from '../../services/userService';
import { prepareUserAvatar } from '../../services/avatarService';
import { syncOwnerPublicFields } from '../../services/salonService';
import {
  completeMasterOnboarding as txCompleteMasterOnboarding,
  completeSalonOwnerOnboarding as txCompleteOwnerOnboarding,
} from '../../services/usernameService';
import { ROLES } from '../../constants/roles';

async function loadUserBundle(firebaseUser) {
  if (!firebaseUser) return null;
  let profile = await fetchUserProfile(firebaseUser.uid);
  if (!profile) {
    profile = await ensureUserProfile(firebaseUser);
  }
  if (profile?.role === ROLES.SALON_OWNER && profile.salonId) {
    try {
      await syncSalonOwnerIfNeeded(profile);
    } catch {
      /* salon public maytalari sinxronlashda xato — kirishni bloklamaymiz */
    }
  }
  return {
    user: serializeFirebaseUser(firebaseUser),
    profile,
  };
}

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const credential = await signInWithGoogle();
      const bundle = await loadUserBundle(credential.user);
      return bundle;
    } catch (err) {
      return rejectWithValue(err?.message ?? 'Google bilan kirishda xato');
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await signOutUser();
    return true;
  } catch (err) {
    return rejectWithValue(err?.message ?? 'Chiqishda xato');
  }
});

export const bootstrapAuth = createAsyncThunk(
  'auth/bootstrap',
  (_, { rejectWithValue }) =>
    new Promise((resolve, reject) => {
      try {
        const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
          try {
            unsubscribe();
            const bundle = await loadUserBundle(firebaseUser);
            resolve(bundle);
          } catch (innerErr) {
            reject(rejectWithValue(innerErr?.message ?? 'Auth bootstrap xatosi'));
          }
        });
      } catch (err) {
        reject(rejectWithValue(err?.message ?? 'Auth bootstrap xatosi'));
      }
    }),
);

export const refreshProfile = createAsyncThunk(
  'auth/refreshProfile',
  async (_, { getState, rejectWithValue }) => {
    const uid = getState().auth.user?.uid;
    if (!uid) return null;
    try {
      return await fetchUserProfile(uid);
    } catch (err) {
      return rejectWithValue(err?.message ?? 'Profil yangilashda xato');
    }
  },
);

async function syncSalonOwnerIfNeeded(profile) {
  if (profile?.role !== ROLES.SALON_OWNER || !profile.salonId) return;
  await syncOwnerPublicFields(profile.salonId, {
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    bio: profile.bio,
    photoURL: profile.photoURL,
  });
}

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ firstName, lastName, phone, bio }, { getState, rejectWithValue }) => {
    const uid = getState().auth.user?.uid;
    if (!uid) return rejectWithValue('NOT_SIGNED_IN');
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone,
      };
      if (bio !== undefined) {
        payload.bio = bio.trim() ? bio.trim().slice(0, 500) : null;
      }
      await updateUserProfile(uid, payload);
      const profile = await fetchUserProfile(uid);
      await syncSalonOwnerIfNeeded(profile);
      return profile;
    } catch (err) {
      return rejectWithValue(err?.message ?? 'generic');
    }
  },
);

export const uploadProfilePhoto = createAsyncThunk(
  'auth/uploadProfilePhoto',
  async (file, { getState, rejectWithValue }) => {
    const uid = getState().auth.user?.uid;
    if (!uid) return rejectWithValue('NOT_SIGNED_IN');
    try {
      const photoURL = await prepareUserAvatar(file);
      await updateUserProfile(uid, { photoURL });
      const profile = await fetchUserProfile(uid);

      let user;
      if (photoURL.startsWith('https://')) {
        user = await updateAuthPhotoURL(photoURL);
      } else {
        const currentUser = getState().auth.user;
        user = currentUser ? { ...currentUser, photoURL } : null;
      }

      await syncSalonOwnerIfNeeded(profile);
      return { user, profile };
    } catch (err) {
      return rejectWithValue(err?.message ?? 'UPLOAD_FAILED');
    }
  },
);

export const completeCustomerOnboarding = createAsyncThunk(
  'auth/completeCustomerOnboarding',
  async ({ firstName, lastName, phone }, { getState, rejectWithValue }) => {
    const uid = getState().auth.user?.uid;
    if (!uid) return rejectWithValue('NOT_SIGNED_IN');
    try {
      await updateUserProfile(uid, {
        role: ROLES.CUSTOMER,
        firstName,
        lastName,
        phone,
        onboardingCompleted: true,
      });
      return await fetchUserProfile(uid);
    } catch (err) {
      return rejectWithValue(err?.message ?? 'Onboarding xatosi');
    }
  },
);

export const completeOwnerOnboarding = createAsyncThunk(
  'auth/completeOwnerOnboarding',
  async ({ firstName, lastName, phone, username }, { getState, rejectWithValue }) => {
    const uid = getState().auth.user?.uid;
    if (!uid) return rejectWithValue('NOT_SIGNED_IN');
    try {
      await txCompleteOwnerOnboarding({ uid, firstName, lastName, phone, username });
      return await fetchUserProfile(uid);
    } catch (err) {
      return rejectWithValue(err?.message ?? 'Onboarding xatosi');
    }
  },
);

export const completeMasterOnboarding = createAsyncThunk(
  'auth/completeMasterOnboarding',
  async ({ firstName, lastName, phone, inviteUsername }, { getState, rejectWithValue }) => {
    const uid = getState().auth.user?.uid;
    if (!uid) return rejectWithValue('NOT_SIGNED_IN');
    try {
      await txCompleteMasterOnboarding({ uid, firstName, lastName, phone, inviteUsername });
      return await fetchUserProfile(uid);
    } catch (err) {
      return rejectWithValue(err?.message ?? 'Onboarding xatosi');
    }
  },
);
