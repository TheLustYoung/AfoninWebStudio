import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './Home';
import Services from './Services';
import Work from './Work';
import Legal from './Legal';
import { NotFound } from './NotFound';
import { LanguageProvider, useLanguage } from './i18n';
import { RequestProvider } from './Request';
import { syncHead } from './seo';
import { restoreScrollAnchor } from './scrollAnchor';

function RoutePosition() {
  const { pathname, hash } = useLocation();
  const { lang, path } = useLanguage();
  const previous = useRef(null);
  useEffect(() => { syncHead(path, lang); }, [path, lang]);
  // Before paint, so a language change never shows the page jumping.
  useLayoutEffect(() => {
    const before = previous.current;
    previous.current = { pathname, path };
    if (before && before.path === path && before.pathname !== pathname) return restoreScrollAnchor();
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) target.scrollIntoView({ behavior: 'instant' });
    else if (before && before.pathname !== pathname) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash, path]);
  return null;
}

const PAGES = (prefix) => [
  <Route key={prefix + 'home'} path={prefix || '/'} element={<Home />} />,
  <Route key={prefix + 'services'} path={`${prefix}/services`} element={<Services />} />,
  <Route key={prefix + 'category'} path={`${prefix}/services/:category`} element={<Services />} />,
  <Route key={prefix + 'work'} path={`${prefix}/work/:slug`} element={<Work />} />,
  <Route key={prefix + 'privacy'} path={`${prefix}/privacy`} element={<Legal page="privacy" />} />,
  <Route key={prefix + 'offer'} path={`${prefix}/offer`} element={<Legal page="offer" />} />
];

export default function App() {
  return <LanguageProvider>
    <RequestProvider>
      <RoutePosition />
      <Routes>
        {['', '/en', '/hy'].flatMap(PAGES)}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </RequestProvider>
  </LanguageProvider>;
}
