import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { listMastersBySalonId } from './masterService';

const SALONS_COLLECTION = 'salons';

export function salonsRef() {
  return collection(db, SALONS_COLLECTION);
}

export function salonRef(salonId) {
  return doc(db, SALONS_COLLECTION, salonId);
}

export function newSalonRef() {
  return doc(salonsRef());
}

export const TRIAL_DAYS = 30;

export function buildSalonPayload({ ownerId, ownerUsername, ownerFirstName, ownerLastName, ownerPhone, ownerBio, ownerPhotoURL }) {
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  return {
    ownerId,
    ownerUsername,
    ownerFirstName: ownerFirstName ?? null,
    ownerLastName: ownerLastName ?? null,
    ownerPhone: ownerPhone ?? null,
    ownerBio: ownerBio ?? null,
    ownerPhotoURL: ownerPhotoURL ?? null,
    name: null,
    address: null,
    phone: null,
    description: null,
    coverURL: null,
    approvalStatus: 'trial',
    trialStartedAt: serverTimestamp(),
    trialEndsAt,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export async function fetchSalonById(salonId) {
  if (!salonId) return null;
  const snap = await getDoc(salonRef(salonId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function fetchSalonByOwnerUsername(ownerUsername) {
  const clean = String(ownerUsername ?? '').trim().toLowerCase();
  if (!clean) return null;

  const q = query(salonsRef(), where('ownerUsername', '==', clean));
  const snap = await getDocs(q);
  if (snap.empty) return null;

  const salon = { id: snap.docs[0].id, ...snap.docs[0].data() };
  if (salon.isActive !== true || salon.approvalStatus === 'rejected') return null;
  return salon;
}

export function salonByOwnerQuery(ownerId) {
  return query(salonsRef(), where('ownerId', '==', ownerId));
}

export async function listSalonsForCustomer() {
  const salonsSnap = await getDocs(query(salonsRef(), where('isActive', '==', true)));
  const salons = salonsSnap.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .filter((salon) => salon.approvalStatus !== 'rejected');

  const enriched = await Promise.all(
    salons.map(async (salon) => {
      const masters = await listMastersBySalonId(salon.id);
      return {
        ...salon,
        masters: masters.filter((m) => !m.isDisabled),
      };
    }),
  );

  enriched.sort((a, b) => {
    const labelA = (a.ownerUsername ?? a.name ?? '').toLowerCase();
    const labelB = (b.ownerUsername ?? b.name ?? '').toLowerCase();
    return labelA.localeCompare(labelB);
  });

  return enriched;
}

export async function updateSalonSettings(salonId, { name, workingHours, phone, address }) {
  if (!salonId) throw new Error('SALON_ID_REQUIRED');

  const payload = { updatedAt: serverTimestamp() };

  if (name !== undefined) {
    const trimmed = String(name ?? '').trim();
    payload.name = trimmed.length > 0 ? trimmed.slice(0, 100) : null;
  }

  if (workingHours !== undefined) {
    payload.workingHours = workingHours;
  }

  if (phone !== undefined) {
    const trimmed = String(phone ?? '').trim();
    payload.phone = trimmed.length > 0 ? trimmed : null;
  }

  if (address !== undefined) {
    const trimmed = String(address ?? '').trim();
    payload.address = trimmed.length > 0 ? trimmed.slice(0, 200) : null;
  }

  await updateDoc(salonRef(salonId), payload);
  return fetchSalonById(salonId);
}

export async function syncOwnerPublicFields(
  salonId,
  { firstName, lastName, phone, bio, photoURL },
) {
  if (!salonId) return;

  await updateDoc(salonRef(salonId), {
    ownerFirstName: firstName?.trim?.() || null,
    ownerLastName: lastName?.trim?.() || null,
    ownerPhone: phone ?? null,
    ownerBio: bio?.trim?.() || null,
    ownerPhotoURL: photoURL ?? null,
    updatedAt: serverTimestamp(),
  });
}
