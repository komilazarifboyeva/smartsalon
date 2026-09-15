import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import uz from '../locales/uz/translation.json';
import ru from '../locales/ru/translation.json';
import en from '../locales/en/translation.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'uz', label: "O'zbekcha", flag: 'UZ' },
  { code: 'ru', label: 'Русский', flag: 'RU' },
  { code: 'en', label: 'English', flag: 'EN' },
];

const resources = {
  uz: { translation: uz },
  ru: { translation: ru },
  en: { translation: en },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'uz',
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    debug: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'smartsalon.lang',
    },
    react: { useSuspense: false },
  });

export default i18n;
