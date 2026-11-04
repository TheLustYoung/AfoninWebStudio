import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalPath, useT } from './i18n';
import { Page } from './Layout';

export function NotFound() {
  const t = useT();
  const lp = useLocalPath();
  return <Page>
    <div className="page-hero missing-page">
      <p className="eyebrow">AFONIN WEB STUDIO · 404</p>
      <h1>{t.notFound.title}</h1>
      <div className="hero-actions">
        <Link className="button solid" to={lp('/')}>{t.notFound.home}</Link>
        <Link className="button" to={lp('/services')}>{t.notFound.services}</Link>
      </div>
    </div>
  </Page>;
}
