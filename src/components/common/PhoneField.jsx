import { Phone } from 'lucide-react';
import FormField from './FormField';
import { PHONE_DISPLAY_PREFIX, formatPhoneLocalInput } from '../../utils/phone';

export default function PhoneField({ label, value, onChange, error, placeholder = '90 123 45 67' }) {
  return (
    <FormField
      label={label}
      name="phone"
      type="tel"
      icon={Phone}
      prefix={PHONE_DISPLAY_PREFIX}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(formatPhoneLocalInput(e.target.value))}
      error={error}
      autoComplete="tel"
      inputMode="numeric"
    />
  );
}
