import { isValidUsername } from '../services/usernameService';
import { isValidUzbekPhoneLocal } from './phone';

export function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidPhone(value) {
  return isValidUzbekPhoneLocal(value);
}

export { isValidUsername };

export function validateOnboardingForm(values, { requireUsername = false } = {}) {
  const errors = {};
  if (!isNonEmpty(values.firstName)) errors.firstName = 'required';
  if (!isNonEmpty(values.lastName)) errors.lastName = 'required';
  if (!isNonEmpty(values.phone)) {
    errors.phone = 'required';
  } else if (!isValidPhone(values.phone)) {
    errors.phone = 'phone';
  }
  if (requireUsername) {
    if (!isNonEmpty(values.username)) {
      errors.username = 'required';
    } else if (!isValidUsername(values.username.trim().toLowerCase())) {
      errors.username = 'username';
    }
  }
  return errors;
}
