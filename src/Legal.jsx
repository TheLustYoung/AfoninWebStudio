import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useT, useLanguage } from './i18n';
import { LanguageSwitcher } from './i18n/Nl';

export default function Legal({ page }) {
  const t = useT();
  const { lang, setLang } = useLanguage();
  const isOffer = page === 'offer';
  const title = isOffer ? t.legal.offerTitle : t.legal.privacyTitle;
  const sections = isOffer ? t.legal.offer : t.legal.privacy;
  useEffect(() => { document.title = `${title} | ${t.meta.siteName}`; }, [title, t]);
  return <div className="site legal-site">
    <header className="header">
      <Link className="brand" to="/" aria-label={t.common.brandAria}><img src="/assets/logo.jpg" width="434" height="94" alt="Afonin Web Studio" /></Link>
      <div className="header-right">
        <Link className="pricing-home" to="/">{t.common.backToHome}</Link>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </div>
    </header>
    <main className="legal-page">
      <p className="eyebrow">AFONIN WEB STUDIO</p>
      <h1>{title}</h1>
      <p className="legal-updated">{t.legal.updated}</p>
      {sections.map(section => <section key={section.h}><h2>{section.h}</h2><p>{section.p}</p></section>)}
    </main>
    <footer className="pricing-footer">
      <span>{t.common.copyright}</span>
      <Link to="/privacy">{t.common.privacyLink}</Link>
      <Link to="/offer">{t.common.offerLink}</Link>
      <Link to="/">{t.common.backToHome}</Link>
    </footer>
  </div>;
}
