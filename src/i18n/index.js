import { ru } from './ru';
import { en } from './en';
import { hy } from './hy';
import { legal } from './legal';
import { localize } from '../routes';
import { useLanguage, LanguageProvider, languageReady } from './LanguageContext';

export const content = {
  ru: { ...ru, legal: legal.ru },
  en: { ...en, legal: legal.en },
  hy: { ...hy, legal: legal.hy }
};

export { LanguageProvider, useLanguage, languageReady };

export function useT() {
  const { lang } = useLanguage();
  return content[lang];
}

// Turns a page path into the address of that page in the current language.
export function useLocalPath() {
  const { lang } = useLanguage();
  return path => localize(path, lang);
}
