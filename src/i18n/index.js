import { content } from './content';
import * as pricingRu from '../pricing-data.ru';
import * as pricingEn from '../pricing-data.en';
import * as pricingHy from '../pricing-data.hy';
import { useLanguage, LanguageProvider, LANGUAGES } from './LanguageContext';

const pricingData = { ru: pricingRu, en: pricingEn, hy: pricingHy };

export { LanguageProvider, useLanguage, LANGUAGES };

export function useT() {
  const { lang } = useLanguage();
  return content[lang];
}

export function usePricingData() {
  const { lang } = useLanguage();
  return pricingData[lang];
}
