import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ROLES } from '../constants/roles';
import { fetchSalonById } from './salonService';
import { userRef } from './userService';

export async function listSalonOwnersWithSalons() {
  const ownersQuery = query(
    collection(db, 'users'),
    where('role', '==', ROLES.SALON_OWNER),
  );
  const snap = await getDocs(ownersQuery);

  const owners = snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  const enriched = await Promise.all(
    owners.map(async (owner) => {
      const salon = owner.salonId ? await fetchSalonById(owner.salonId) : null;
      return { ...owner, salon };
    }),
  );

  enriched.sort((a, b) => {
    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    return bTime - aTime;
  });

  return enriched;
}

export async function setSalonOwnerDisabled(uid, isDisabled) {
  await updateDoc(userRef(uid), {
    isDisabled: Boolean(isDisabled),
    updatedAt: serverTimestamp(),
  });
}
