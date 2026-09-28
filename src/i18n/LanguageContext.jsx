import React, { createContext, useContext, useEffect, useState } from 'react';

export const LANGUAGES = ['ru', 'en', 'hy'];
const STORAGE_KEY = 'afonin_lang';
const GEO_CACHE_KEY = 'afonin_geo_lang';
const GEO_CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days
const RUSSIAN_SPEAKING = new Set(['RU', 'BY', 'KZ', 'KG', 'UZ', 'TJ', 'MD']);

function langFromNavigator() {
  const list = (typeof navigator !== 'undefined' && (navigator.languages?.length ? navigator.languages : [navigator.language])) || [];
  for (const raw of list) {
    const code = String(raw || '').toLowerCase();
    if (code.startsWith('hy')) return 'hy';
    if (code.startsWith('ru')) return 'ru';
    if (code.startsWith('en')) return 'en';
  }
  return 'ru';
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
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const { lang, ts } = JSON.parse(raw);
    if (!LANGUAGES.includes(lang) || Date.now() - ts > GEO_CACHE_TTL) return null;
    return lang;
  } catch {
    return null;
  }
}

function cacheGeoLang(lang) {
  try { localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ lang, ts: Date.now() })); } catch {}
}

function langFromCountry(code) {
  if (!code) return null;
  if (code === 'AM') return 'hy';
  if (RUSSIAN_SPEAKING.has(code)) return 'ru';
  return 'en';
}

async function detectLangByGeo(signal) {
  const cached = readCachedGeoLang();
  if (cached) return cached;
  try {
    const res = await fetch('https://ipwho.is/', { signal });
    if (!res.ok) return null;
    const data = await res.json();
    const lang = langFromCountry(data && data.country_code);
    if (lang) cacheGeoLang(lang);
    return lang;
  } catch {
    return null;
  }
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => readStoredLang() || langFromNavigator());

  useEffect(() => {
    if (readStoredLang()) return; // user already picked a language explicitly
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    detectLangByGeo(controller.signal).then(geoLang => {
      if (geoLang) setLangState(geoLang);
    });
    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(next) {
    if (!LANGUAGES.includes(next)) return;
    setLangState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  }

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
