import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  buildSalonPayload,
  newSalonRef,
} from './salonService';
import { userRef } from './userService';
import { ROLES } from '../constants/roles';

const USERNAMES_COLLECTION = 'usernames';
/** Lotin harflar, raqamlar, defis. Pastki chiziq (_) majburiy emas va shart emas. */
const USERNAME_REGEX = /^[a-z0-9-]{3,24}$/;

export function usernameRef(username) {
  return doc(db, USERNAMES_COLLECTION, username);
}

export function normalizeUsername(raw) {
  return String(raw ?? '').trim().toLowerCase();
}

export function sanitizeUsernameInput(raw) {
  return String(raw ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 24);
}

export function isValidUsername(username) {
  return USERNAME_REGEX.test(username);
}

export async function isUsernameAvailable(username) {
  const snap = await getDoc(usernameRef(username));
  return !snap.exists();
}

// Salon rahbari onboarding'ini bitta atomik tranzaksiyada bajaradi:
//  1) username band emasligini tekshiradi
//  2) salons/{newId} ni yaratadi (trial bilan)
//  3) usernames/{username} ni 'owner' turida yaratadi
//  4) users/{uid} ni yangilaydi: role=salon_owner, salonId, username, profile, onboardingCompleted=true
export async function completeSalonOwnerOnboarding({ uid, firstName, lastName, phone, username }) {
  const cleanUsername = normalizeUsername(username);
  if (!isValidUsername(cleanUsername)) {
    throw new Error('INVALID_USERNAME');
  }

  const salonDocRef = newSalonRef();
  const unameDocRef = usernameRef(cleanUsername);
  const usrRef = userRef(uid);

  await runTransaction(db, async (tx) => {
    const unameSnap = await tx.get(unameDocRef);
    if (unameSnap.exists()) {
      throw new Error('USERNAME_TAKEN');
    }

    const userSnap = await tx.get(usrRef);
    if (!userSnap.exists()) {
      throw new Error('USER_DOC_MISSING');
    }
    if (userSnap.data().onboardingCompleted === true) {
      throw new Error('ALREADY_ONBOARDED');
    }

    const salonPayload = buildSalonPayload({
      ownerId: uid,
      ownerUsername: cleanUsername,
      ownerFirstName: firstName,
      ownerLastName: lastName,
      ownerPhone: phone,
    });

    tx.set(salonDocRef, salonPayload);

    tx.set(unameDocRef, {
      type: 'owner',
      username: cleanUsername,
      uid,
      salonId: salonDocRef.id,
      createdAt: serverTimestamp(),
    });

    tx.update(usrRef, {
      role: ROLES.SALON_OWNER,
      firstName,
      lastName,
      phone,
      username: cleanUsername,
      salonId: salonDocRef.id,
      onboardingCompleted: true,
      updatedAt: serverTimestamp(),
    });
  });

  return { salonId: salonDocRef.id, username: cleanUsername };
}

// Master onboarding tranzaksiyasi:
//  1) usernames/{username} mavjudligini va type=master_invite, claimedBy=null ekanligini tekshiradi
//  2) claimedBy ni o'rnatadi
//  3) users/{uid} ni master roli bilan yangilaydi va salonId bog'laydi
export async function completeMasterOnboarding({ uid, firstName, lastName, phone, inviteUsername }) {
  const cleanUsername = normalizeUsername(inviteUsername);
  if (!cleanUsername) {
    throw new Error('INVALID_USERNAME');
  }

  const unameDocRef = usernameRef(cleanUsername);
  const usrRef = userRef(uid);

  let salonId = null;

  await runTransaction(db, async (tx) => {
    const unameSnap = await tx.get(unameDocRef);
    if (!unameSnap.exists()) {
      throw new Error('INVITE_NOT_FOUND');
    }
    const data = unameSnap.data();
    if (data.type !== 'master_invite') {
      throw new Error('INVITE_NOT_FOUND');
    }
    if (data.claimedBy) {
      throw new Error('INVITE_ALREADY_CLAIMED');
    }

    const userSnap = await tx.get(usrRef);
    if (!userSnap.exists()) {
      throw new Error('USER_DOC_MISSING');
    }
    if (userSnap.data().onboardingCompleted === true) {
      throw new Error('ALREADY_ONBOARDED');
    }

    salonId = data.salonId;

    tx.update(unameDocRef, {
      claimedBy: uid,
      claimedAt: serverTimestamp(),
    });

    tx.update(usrRef, {
      role: ROLES.MASTER,
      firstName,
      lastName,
      phone,
      username: cleanUsername,
      salonId,
      isDisabled: false,
      onboardingCompleted: true,
      updatedAt: serverTimestamp(),
    });
  });

  return { salonId, username: cleanUsername };
}

// ---------- Master taklifnomalari (salon rahbari paneli uchun) ----------

export async function createMasterInvitation({ username, salonId }) {
  const cleanUsername = normalizeUsername(username);
  if (!isValidUsername(cleanUsername)) {
    throw new Error('INVALID_USERNAME');
  }
  const ref = usernameRef(cleanUsername);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    throw new Error('USERNAME_TAKEN');
  }
  await setDoc(ref, {
    type: 'master_invite',
    username: cleanUsername,
    salonId,
    claimedBy: null,
    claimedAt: null,
    createdAt: serverTimestamp(),
  });
  return cleanUsername;
}

export async function deleteMasterInvitation({ username, salonId }) {
  const cleanUsername = normalizeUsername(username);
  const ref = usernameRef(cleanUsername);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;

    const data = snap.data();
    if (data.type !== 'master_invite' || data.salonId !== salonId) {
      throw new Error('FORBIDDEN');
    }

    if (data.claimedBy) {
      const masterRef = userRef(data.claimedBy);
      const masterSnap = await tx.get(masterRef);
      if (
        masterSnap.exists()
        && masterSnap.data().role === ROLES.MASTER
        && masterSnap.data().salonId === salonId
      ) {
        tx.update(masterRef, {
          salonId: null,
          username: null,
          isDisabled: true,
          updatedAt: serverTimestamp(),
        });
      }
    }

    tx.delete(ref);
  });
}

export async function listMasterInvitations(salonId) {
  const q = query(
    collection(db, USERNAMES_COLLECTION),
    where('type', '==', 'master_invite'),
    where('salonId', '==', salonId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
