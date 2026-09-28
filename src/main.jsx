import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './Home';
import Pricing from './Pricing';
import Legal from './Legal';
import { LanguageProvider, useT } from './i18n';
import { CookieBanner } from './i18n/CookieBanner';
import './styles.css';
import './pricing.css';

function RoutePosition() {
  const { pathname, hash } = useLocation();
  const t = useT();
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) target.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
    if (pathname === '/') document.title = t.meta.homeTitle;
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, t]);
  return null;
}
export function NotFound() {
  const t = useT();
  return <main className="missing-page"><p className="eyebrow">{t.common.notFoundEyebrow}</p><h1>{t.notFound.title}</h1><Link className="price-button" to="/pricing">{t.notFound.link}</Link><Link to="/">{t.notFound.home}</Link></main>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><LanguageProvider><BrowserRouter><RoutePosition /><Routes><Route path="/" element={<Home />} /><Route path="/pricing" element={<Pricing />} /><Route path="/pricing/:category" element={<Pricing />} /><Route path="/privacy" element={<Legal page="privacy" />} /><Route path="/offer" element={<Legal page="offer" />} /><Route path="*" element={<NotFound />} /></Routes><CookieBanner /></BrowserRouter></LanguageProvider></React.StrictMode>);
