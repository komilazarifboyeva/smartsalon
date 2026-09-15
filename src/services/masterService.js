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

export async function setMasterDisabled(uid, isDisabled) {
  await updateDoc(userRef(uid), {
    isDisabled: Boolean(isDisabled),
    updatedAt: serverTimestamp(),
  });
}
