import {
  collection,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { DEFAULT_WORKING_HOURS } from '../constants/workingHours';
import { ROLES } from '../constants/roles';
import { listMastersBySalonId } from './masterService';
import { fetchSalonById, fetchSalonByOwnerUsername } from './salonService';
import { listMasterServices, listSalonServices } from './serviceService';
import { fetchUserProfile } from './userService';
import { normalizeUsername, usernameRef } from './usernameService';

function computeRatingFromReviews(reviews) {
  if (!reviews.length) return { rating: null, count: 0 };
  const sum = reviews.reduce((acc, review) => acc + (Number(review.rating) || 0), 0);
  return {
    rating: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}

async function findMasterByUsername(username) {
  const clean = normalizeUsername(username);
  if (!clean) return null;

  const q = query(
    collection(db, 'users'),
    where('username', '==', clean),
    where('role', '==', ROLES.MASTER),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;

  const master = { id: snap.docs[0].id, ...snap.docs[0].data() };
  if (master.isDisabled || !master.onboardingCompleted) return null;
  return master;
}

export async function resolvePublicUsername(username) {
  const clean = normalizeUsername(String(username ?? '').replace(/^@/, ''));
  if (!clean) return null;

  try {
    const snap = await getDoc(usernameRef(clean));
    if (snap.exists()) {
      const data = snap.data();
      if (data.type === 'owner' && data.salonId) {
        return { view: 'salon', salonId: data.salonId, username: clean };
      }
      if (data.type === 'master_invite' && data.claimedBy && data.salonId) {
        return {
          view: 'master',
          salonId: data.salonId,
          masterId: data.claimedBy,
          username: clean,
        };
      }
    }
  } catch {
    /* fallback below */
  }

  const salon = await fetchSalonByOwnerUsername(clean);
  if (salon) {
    return { view: 'salon', salonId: salon.id, username: clean };
  }

  const master = await findMasterByUsername(clean);
  if (master?.salonId) {
    return {
      view: 'master',
      salonId: master.salonId,
      masterId: master.uid,
      username: clean,
    };
  }

  return null;
}

/** @deprecated use resolvePublicUsername */
export async function resolveUsernameToSalon(username) {
  const resolved = await resolvePublicUsername(username);
  if (!resolved) return null;
  return {
    salonId: resolved.salonId,
    highlightMasterUsername: resolved.view === 'master' ? resolved.username : null,
    highlightMasterId: resolved.view === 'master' ? resolved.masterId : null,
  };
}

export async function listReviewsBySalonId(salonId, max = 20) {
  if (!salonId) return [];

  const q = query(
    collection(db, 'salons', salonId, 'reviews'),
    orderBy('createdAt', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function fetchSalonPublicProfile(salonId, { ownerProfile = false } = {}) {
  const salon = await fetchSalonById(salonId);
  if (!salon || salon.isActive !== true || salon.approvalStatus === 'rejected') {
    return null;
  }

  const ownerPromise =
    ownerProfile && salon.ownerId
      ? fetchUserProfile(salon.ownerId).catch(() => null)
      : Promise.resolve(null);

  const [masters, salonServices, reviews, owner] = await Promise.all([
    listMastersBySalonId(salonId),
    listSalonServices(salonId),
    listReviewsBySalonId(salonId).catch(() => []),
    ownerPromise,
  ]);

  const activeMasters = masters.filter((master) => !master.isDisabled);
  const mastersWithServices = await Promise.all(
    activeMasters.map(async (master) => ({
      master,
      services: await listMasterServices(salonId, master.uid),
    })),
  );

  const computed = computeRatingFromReviews(reviews);
  const ownerNameFromSalon = [salon.ownerFirstName, salon.ownerLastName].filter(Boolean).join(' ');
  const ownerName = owner ? [owner.firstName, owner.lastName].filter(Boolean).join(' ') : ownerNameFromSalon;
  const salonName = salon.name?.trim() || null;

  let displayName = salonName || (salon.ownerUsername ? `@${salon.ownerUsername}` : 'Salon');
  if (ownerProfile && ownerName) {
    displayName = ownerName;
  }

  return {
    view: 'salon',
    ownerProfile,
    salon,
    owner,
    salonServices,
    mastersWithServices,
    reviews,
    rating: salon.rating ?? computed.rating,
    reviewsCount: salon.reviewsCount ?? computed.count,
    workingHours: salon.workingHours ?? DEFAULT_WORKING_HOURS,
    phone: salon.ownerPhone ?? salon.phone ?? owner?.phone ?? null,
    ownerDisplayName: ownerNameFromSalon || null,
    ownerPhone: salon.ownerPhone ?? owner?.phone ?? null,
    ownerBio: salon.ownerBio ?? owner?.bio ?? null,
    ownerPhotoURL: salon.ownerPhotoURL ?? owner?.photoURL ?? null,
    address: salon.address ?? null,
    displayUsername: salon.ownerUsername ?? owner?.username ?? null,
    displayName,
    salonName,
  };
}

export async function fetchMasterPublicProfile(masterId, masterUsername) {
  const master = await fetchUserProfile(masterId);
  if (!master || master.role !== ROLES.MASTER || master.isDisabled) return null;

  const salon = await fetchSalonById(master.salonId);
  if (!salon || salon.isActive !== true || salon.approvalStatus === 'rejected') {
    return null;
  }

  const services = await listMasterServices(master.salonId, masterId);
  const fullName = [master.firstName, master.lastName].filter(Boolean).join(' ');

  return {
    view: 'master',
    salon,
    master,
    services,
    bio: master.bio ?? null,
    photoURL: master.photoURL ?? null,
    workingHours: salon.workingHours ?? DEFAULT_WORKING_HOURS,
    phone: master.phone ?? null,
    address: salon.address ?? null,
    displayUsername: masterUsername ?? master.username ?? null,
    displayName: fullName || (master.username ? `@${master.username}` : 'Master'),
  };
}

export async function fetchPublicProfileByUsername(username) {
  const resolved = await resolvePublicUsername(username);
  if (!resolved) return null;

  if (resolved.view === 'master') {
    return fetchMasterPublicProfile(resolved.masterId, resolved.username);
  }
  return fetchSalonPublicProfile(resolved.salonId, { ownerProfile: false });
}
