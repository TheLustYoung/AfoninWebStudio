import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage, useLocalPath, useT } from './i18n';
import { LanguageSwitcher } from './i18n/Nl';
import { BEHANCE, GITHUB } from './contacts';

export function SiteHeader() {
  const t = useT();
  const lp = useLocalPath();
  const { lang, languages, setLang } = useLanguage();
  const home = lp('/');
  return <header className="header">
    <Link className="brand" to={home} aria-label={t.common.brandAria}><img src="/assets/logo.jpg" width="434" height="94" alt="Afonin Web Studio" /></Link>
    <nav className="main-nav" aria-label={t.common.navAria}>
      <Link to={`${home}#work`}>{t.common.navWork}</Link>
      <Link to={lp('/services')}>{t.common.navServices}</Link>
      <Link to={`${home}#process`}>{t.common.navProcess}</Link>
      <Link to={`${home}#contact`}>{t.common.navContact}</Link>
    </nav>
    <LanguageSwitcher lang={lang} languages={languages} setLang={setLang} />
  </header>;
}

export function SiteFooter() {
  const t = useT();
  const lp = useLocalPath();
  return <footer className="footer-line">
    <span>{t.common.copyright}</span>
    <Link to={lp('/services')}>{t.common.navServices}</Link>
    <Link to={lp('/privacy')}>{t.common.privacyLink}</Link>
    <Link to={lp('/offer')}>{t.common.offerLink}</Link>
    <a href={BEHANCE} target="_blank" rel="noopener noreferrer">BEHANCE ↗</a>
    <a href={GITHUB} target="_blank" rel="noopener noreferrer">GITHUB ↗</a>
  </footer>;
}

export function Page({ children }) {
  return <div className="site">
    <SiteHeader />
    <main>{children}</main>
    <SiteFooter />
  </div>;
}
