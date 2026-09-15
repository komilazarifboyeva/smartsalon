/**
 * Foydalanuvchi ko'rsatiladigan ismi — onboarding'da kiritilgan ism/familiya ustunlik qiladi.
 */
export function getProfileDisplayName(profile, user) {
  const first = profile?.firstName?.trim();
  const last = profile?.lastName?.trim();

  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (last) return last;

  return user?.displayName ?? user?.email ?? '—';
}

export function getProfileInitial(profile, user) {
  const name = getProfileDisplayName(profile, user);
  return name.slice(0, 1).toUpperCase();
}

/** Firestore yoki Auth dagi profil rasmi — ikkalasi sinxron bo'lishi kerak. */
export function getProfilePhotoURL(profile, user) {
  return profile?.photoURL ?? user?.photoURL ?? null;
}
