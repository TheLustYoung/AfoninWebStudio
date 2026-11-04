import React from 'react';
import { useT } from './i18n';
import { Page } from './Layout';

export default function Legal({ page }) {
  const t = useT();
  const isOffer = page === 'offer';
  const sections = isOffer ? t.legal.offer : t.legal.privacy;
  return <Page>
    <div className="legal-page">
      <p className="eyebrow">AFONIN WEB STUDIO</p>
      <h1>{isOffer ? t.legal.offerTitle : t.legal.privacyTitle}</h1>
      <p className="legal-updated">{t.legal.updated}</p>
      {sections.map(section => <section key={section.h}><h2>{section.h}</h2><p>{section.p}</p></section>)}
    </div>
  </Page>;
}
