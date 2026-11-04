import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLocalPath, useT } from './i18n';
import { Page } from './Layout';
import { ContactBlock, useRequest } from './Request';
import { NotFound } from './NotFound';
import { CASES } from './routes';

const GALLERY = {
  'telegram-support': { repo: 'https://github.com/TheLustYoung/SUPPORT-DESK-CRM', desktop: ['desktop-03-ticket', 'desktop-02-tickets', 'desktop-01-overview', 'desktop-05-analytics', 'desktop-06-faq'], phone: ['mobile-04-ticket', 'mobile-02-overview'], service: 'bot', category: 'automation' },
  'media-platform': { repo: 'https://github.com/TheLustYoung/CRM-PLATFORM-BOTS', desktop: ['desktop-01-overview', 'desktop-04-bots', 'desktop-05-users', 'desktop-03-reports', 'desktop-07-monetization'], phone: ['mobile-02-overview', 'mobile-09-menu'], service: 'crm', category: 'webapps' }
};

export default function Work() {
  const { slug } = useParams();
  const t = useT();
  const lp = useLocalPath();
  const openRequest = useRequest();
  if (!CASES.includes(slug)) return <NotFound />;
  const c = t.work.cases[slug];
  const g = GALLERY[slug];
  return <Page>
    <div className="page-hero">
      <nav className="breadcrumbs" aria-label={t.common.breadcrumbs}>
        <Link to={lp('/')}>{t.common.home}</Link><span aria-hidden="true">/</span>
        <Link to={`${lp('/')}#work`}>{t.common.navWork}</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{c.name}</span>
      </nav>
      <p className="eyebrow">{c.name} · {t.work.demoBadge}</p>
      <h1>{c.h1}</h1>
      <p className="page-lead">{c.lead}</p>
      <div className="hero-actions">
        <button className="button solid" type="button" onClick={() => openRequest(g.service)}>{t.work.requestDemo}<span aria-hidden="true">⟶</span></button>
        <a className="button" href={g.repo} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
      </div>
    </div>
    <div className="page-body">
      <figure className="case-main">
        <img src={`/assets/work/${slug}-${g.desktop[0]}.webp`} width="1400" height="875" alt={c.shotAlt} fetchPriority="high" />
        <figcaption>{t.work.note}</figcaption>
      </figure>
      <div className="case-columns">
        <div>
          <h2>{t.work.whatTitle}</h2>
          <ul className="check-list">{c.features.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <h2>{t.work.checkTitle}</h2>
          <p>{c.check}</p>
          <h2>{t.work.stackTitle}</h2>
          <ul className="tag-list">{c.stack.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
      <div className="case-gallery">
        {g.desktop.slice(1).map(name => <img key={name} src={`/assets/work/${slug}-${name}.webp`} width="1400" height="875" loading="lazy" alt={`${c.name}: ${c.shotAlt}`} />)}
      </div>
      <div className="case-phones">
        {g.phone.map(name => <img key={name} src={`/assets/work/${slug}-${name}.webp`} width="560" height="1212" loading="lazy" alt={`${c.name}: ${t.work.phoneAlt}`} />)}
      </div>
      <p className="related"><Link to={lp(`/services/${g.category}`)}>{c.relatedLabel} ⟶</Link></p>
    </div>
    <ContactBlock service={g.service} />
  </Page>;
}
