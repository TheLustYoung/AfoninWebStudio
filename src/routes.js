// One place for URLs: every page exists in each language, Russian has no prefix (/), others use /en and /hy.
export const LANGUAGES = ['ru', 'en', 'hy'];
export const DEFAULT_LANG = 'ru';
export const SITE_URL = 'https://afoninwebstudio.vercel.app';
export const SERVICE_CATEGORIES = ['websites', 'automation', 'webapps', 'support'];
export const CASES = ['telegram-support', 'media-platform'];
export const PAGES = [
  '/',
  '/services',
  ...SERVICE_CATEGORIES.map(id => `/services/${id}`),
  ...CASES.map(id => `/work/${id}`),
  '/privacy',
  '/offer'
];

// '/en/services' -> { lang: 'en', path: '/services' }
export function splitPath(pathname) {
  const match = /^\/(en|hy)(\/.*)?$/.exec(pathname);
  const lang = match ? match[1] : DEFAULT_LANG;
  const rest = match ? match[2] || '/' : pathname;
  const path = rest.length > 1 ? rest.replace(/\/+$/, '') : rest;
  return { lang, path: path || '/' };
}

export function localize(path, lang) {
  if (lang === DEFAULT_LANG) return path;
  return path === '/' ? `/${lang}` : `/${lang}${path}`;
}

export const absolute = (path, lang) => {
  const local = localize(path, lang);
  return local === '/' ? `${SITE_URL}/` : SITE_URL + local;
};
