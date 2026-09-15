export const PHONE_DISPLAY_PREFIX = '+998';

/** Faqat 998 dan keyingi 9 ta raqam (foydalanuvchi kiritadi) */
export function formatPhoneLocalInput(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 9);
}

export function formatPhoneForStorage(localDigits) {
  const digits = formatPhoneLocalInput(localDigits);
  return digits ? `${PHONE_DISPLAY_PREFIX}${digits}` : '';
}

export function isValidUzbekPhoneLocal(localDigits) {
  const d = formatPhoneLocalInput(localDigits);
  return d.length === 9;
}

/** +998901234567 → 901234567 */
export function parsePhoneToLocal(storedPhone) {
  const digits = String(storedPhone ?? '').replace(/\D/g, '');
  if (digits.startsWith('998')) return digits.slice(3, 12);
  return digits.slice(-9);
}
