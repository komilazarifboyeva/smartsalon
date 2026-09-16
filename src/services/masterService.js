import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { fetchUserProfile, userRef } from './userService';
import {
  buildMasterBillingDefaults,
  hasMasterBillingFields,
} from '../constants/masterBilling';

/**
 * Firestore list query on `users` salon owner uchun qoidalarda ishlamaydi
 * (client salonId == userSalonId() ekanini rules tasdiqlay olmaydi).
 * Shuning uchun claimed master_invite lar orqali har bir profilni alohida o'qiymiz.
 */
export async function listMastersBySalonId(salonId) {
  if (!salonId) return [];

  const invitesQuery = query(
    collection(db, 'usernames'),
    where('type', '==', 'master_invite'),
    where('salonId', '==', salonId),
  );
  const invitesSnap = await getDocs(invitesQuery);

  const masterUids = [
    ...new Set(
      invitesSnap.docs
        .map((d) => d.data().claimedBy)
        .filter(Boolean),
    ),
  ];

  if (masterUids.length === 0) return [];

  const profiles = await Promise.all(masterUids.map((uid) => fetchUserProfile(uid)));
  return profiles.filter((p) => p && p.role === 'master');
}

/**
 * Onboardingdan oldin ro'yxatdan o'tgan masterlarda billing maydonlari yo'q.
 * Ular birinchi marta Asosiy sahifani ochganda hujjatga default qiymatlarni yozamiz.
 */
export async function ensureMasterBillingFields(uid, profile) {
  if (!uid || hasMasterBillingFields(profile)) return null;

  const defaults = buildMasterBillingDefaults();
  await updateDoc(userRef(uid), { ...defaults, updatedAt: serverTimestamp() });
  return defaults;
}

export async function setMasterDisabled(uid, isDisabled) {
  await updateDoc(userRef(uid), {
    isDisabled: Boolean(isDisabled),
    updatedAt: serverTimestamp(),
  });
}
