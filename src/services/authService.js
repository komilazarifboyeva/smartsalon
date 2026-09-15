import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signOutUser() {
  return signOut(auth);
}

export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}

export function serializeFirebaseUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    providerId: firebaseUser.providerData?.[0]?.providerId ?? null,
  };
}

export async function updateAuthPhotoURL(photoURL) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('NOT_SIGNED_IN');
  await updateProfile(currentUser, { photoURL });
  return serializeFirebaseUser(auth.currentUser);
}
