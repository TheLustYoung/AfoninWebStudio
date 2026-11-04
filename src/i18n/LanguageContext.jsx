import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEFAULT_LANG, LANGUAGES, localize, splitPath } from '../routes';
import { saveScrollAnchor } from '../scrollAnchor';

const STORAGE_KEY = 'afonin_lang';
const GEO_CACHE_KEY = 'afonin_geo_lang';
const GEO_CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days
const RUSSIAN_SPEAKING = new Set(['RU', 'BY', 'KZ', 'KG', 'UZ', 'TJ', 'MD']);
const CRAWLER = /bot|crawl|spider|slurp|lighthouse|facebookexternalhit|telegram|whatsapp/i;

// The preloader waits for this, so a visitor does not see one language flip into another.
let markReady;
export const languageReady = new Promise(resolve => { markReady = resolve; });

function langFromNavigator() {
  for (const raw of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    const code = String(raw || '').toLowerCase();
    if (code.startsWith('hy')) return 'hy';
    if (code.startsWith('ru')) return 'ru';
    if (code.startsWith('en')) return 'en';
  }
  return null;
}

function readStoredLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.includes(saved) ? saved : null;
  } catch {
    return null;
  }
}

function readCachedGeoLang() {
  try {
    const { lang, country, ts } = JSON.parse(localStorage.getItem(GEO_CACHE_KEY));
    return LANGUAGES.includes(lang) && country && Date.now() - ts < GEO_CACHE_TTL ? { lang, country } : null;
  } catch {
    return null;
  }
}

function langFromCountry(code) {
  if (!code) return null;
  if (code === 'AM') return 'hy';
  return RUSSIAN_SPEAKING.has(code) ? 'ru' : 'en';
}

async function detectRegionalLang() {
  const cached = readCachedGeoLang();
  if (cached) return cached;
  try {
    const res = await fetch('/api/geo', { signal: AbortSignal.timeout(1500) });
    const country = res.ok ? (await res.json()).country : null;
    const lang = langFromCountry(country);
    if (lang) {
      try { localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ lang, country, ts: Date.now() })); } catch {}
      return { lang, country };
    }
  } catch {}
  return { lang: langFromNavigator(), country: null };
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const { lang, path } = splitPath(pathname);
  const [regional, setRegional] = useState(null);
  const [country, setCountry] = useState(null);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  useEffect(() => {
    let alive = true;
    const landed = window.location.pathname;
    detectRegionalLang().then(region => {
      if (!alive) return;
      const detected = region.lang;
      setRegional(detected || splitPath(landed).lang);
      setCountry(region.country);
      // Only the language-neutral addresses move: a link to /en or /hy is an explicit choice, and crawlers must see every version.
      const target = readStoredLang() || detected;
      const movable = splitPath(landed).lang === DEFAULT_LANG && window.location.pathname === landed;
      if (target && target !== DEFAULT_LANG && movable && !CRAWLER.test(navigator.userAgent)) {
        navigate(localize(splitPath(landed).path, target) + window.location.search + window.location.hash, { replace: true });
      }
    }).finally(() => markReady());
    return () => { alive = false; };
  }, [navigate]);

  const value = useMemo(() => {
    const first = regional || lang;
    return {
      lang,
      path,
      country,
      // The visitor's regional language always leads the list.
      languages: [first, ...LANGUAGES.filter(code => code !== first)],
      setLang(next) {
        if (!LANGUAGES.includes(next)) return;
        try { localStorage.setItem(STORAGE_KEY, next); } catch {}
        saveScrollAnchor();
        navigate(localize(path, next) + search + hash);
      }
    };
  }, [lang, path, country, regional, search, hash, navigate]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
