import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { listMastersBySalonId } from './masterService';
import { fetchUserProfile } from './userService';

const SERVICES_COLLECTION = 'services';

export function servicesRef() {
  return collection(db, SERVICES_COLLECTION);
}

export function serviceRef(serviceId) {
  return doc(db, SERVICES_COLLECTION, serviceId);
}

export async function listAllServicesBySalonId(salonId) {
  if (!salonId) return [];

  const q = query(servicesRef(), where('salonId', '==', salonId));
  const snap = await getDocs(q);
  return snap.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export async function listSalonServices(salonId) {
  if (!salonId) return [];

  const q = query(
    servicesRef(),
    where('salonId', '==', salonId),
    where('masterId', '==', null),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export async function listMasterServices(salonId, masterId) {
  if (!salonId || !masterId) return [];

  const q = query(
    servicesRef(),
    where('salonId', '==', salonId),
    where('masterId', '==', masterId),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export async function createService({
  salonId,
  masterId,
  name,
  price,
  durationMinutes,
  durationPreset,
  createdBy,
}) {
  const payload = {
    salonId,
    masterId: masterId ?? null,
    name: name.trim(),
    price: Number(price),
    durationMinutes: Number(durationMinutes),
    durationPreset,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(servicesRef(), payload);
  return { id: ref.id, ...payload };
}

export async function updateService(serviceId, { name, price, durationMinutes, durationPreset }) {
  await updateDoc(serviceRef(serviceId), {
    name: name.trim(),
    price: Number(price),
    durationMinutes: Number(durationMinutes),
    durationPreset,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteService(serviceId) {
  await deleteDoc(serviceRef(serviceId));
}

export async function listMasterServiceGroups(salonId) {
  if (!salonId) return [];

  const [allServices, masters] = await Promise.all([
    listAllServicesBySalonId(salonId),
    listMastersBySalonId(salonId),
  ]);

  const masterServices = allServices.filter((s) => s.masterId);
  const servicesByMasterId = masterServices.reduce((acc, service) => {
    const key = service.masterId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(service);
    return acc;
  }, {});

  const masterMap = new Map(masters.map((m) => [m.uid, m]));

  for (const masterId of Object.keys(servicesByMasterId)) {
    if (!masterMap.has(masterId)) {
      const profile = await fetchUserProfile(masterId);
      if (profile?.role === 'master') {
        masterMap.set(masterId, profile);
      }
    }
  }

  return [...masterMap.values()]
    .map((master) => ({
      master,
      services: servicesByMasterId[master.uid] ?? [],
    }))
    .filter((group) => group.services.length > 0)
    .sort((a, b) => {
      const nameA = `${a.master.firstName ?? ''}${a.master.lastName ?? ''}`.toLowerCase();
      const nameB = `${b.master.firstName ?? ''}${b.master.lastName ?? ''}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
}
