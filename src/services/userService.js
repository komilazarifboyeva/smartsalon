import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ROLES } from '../constants/roles';

const USERS_COLLECTION = 'users';

export function userRef(uid) {
  return doc(db, USERS_COLLECTION, uid);
}

export async function fetchUserProfile(uid) {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createUserProfile(firebaseUser) {
  const ref = userRef(firebaseUser.uid);
  const payload = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? null,
    displayName: firebaseUser.displayName ?? null,
    photoURL: firebaseUser.photoURL ?? null,
    role: ROLES.CUSTOMER,
    onboardingCompleted: false,
    firstName: null,
    lastName: null,
    phone: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, payload, { merge: true });
  return payload;
}

export async function ensureUserProfile(firebaseUser) {
  const existing = await fetchUserProfile(firebaseUser.uid);
  if (existing) return existing;
  return createUserProfile(firebaseUser);
}

export async function updateUserProfile(uid, updates) {
  await updateDoc(userRef(uid), { ...updates, updatedAt: serverTimestamp() });
}
