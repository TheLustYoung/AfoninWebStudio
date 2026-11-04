import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLocalPath, useT } from './i18n';
import { Page } from './Layout';
import { ContactBlock, useRequest } from './Request';
import { NotFound } from './NotFound';
import { SERVICE_CATEGORIES } from './routes';

// Which card of a category page explains each row of the overview list (same order in every language).
const ROW_DETAILS = [['websites', 0], ['websites', 1], ['websites', 2], ['websites', 3], ['automation', 0], ['automation', 1], ['webapps', 0]];

function ServiceItem({ title, hint, text, service, more, defaultOpen }) {
  const t = useT();
  const openRequest = useRequest();
  return <details className="service-item" name="services" open={defaultOpen}>
    <summary>
      <span className="service-item-head"><strong>{title}</strong>{hint && <span>{hint}</span>}</span>
      <i aria-hidden="true">+</i>
    </summary>
    <div className="service-item-body">
      <p>{text}</p>
      <div className="hero-actions">
        <button className="button solid" type="button" onClick={() => openRequest(service)}>{t.form.open}<span aria-hidden="true">⟶</span></button>
        {more}
      </div>
    </div>
  </details>;
}

export default function Services() {
  const { category } = useParams();
  const t = useT();
  const lp = useLocalPath();
  const openRequest = useRequest();
  const s = t.services;
  if (category && !SERVICE_CATEGORIES.includes(category)) return <NotFound />;
  const current = category ? s.categories[category] : null;
  return <Page>
    <div className="page-hero">
      <nav className="breadcrumbs" aria-label={t.common.breadcrumbs}>
        <Link to={lp('/')}>{t.common.home}</Link><span aria-hidden="true">/</span>
        {current ? <><Link to={lp('/services')}>{t.common.navServices}</Link><span aria-hidden="true">/</span><span aria-current="page">{current.nav}</span></> : <span aria-current="page">{t.common.navServices}</span>}
      </nav>
      <h1>{current ? current.h1 : s.h1}</h1>
      <p className="page-lead">{current ? current.lead : s.lead}</p>
      <button className="button solid" type="button" onClick={() => openRequest(current?.service)}>{t.form.open}<span aria-hidden="true">⟶</span></button>
    </div>
    <div className="page-body">
      {current ? <>
        <div className="service-list">
          {current.items.map((item, i) => <ServiceItem key={item.title} title={item.title} text={item.text} service={item.service || current.service} defaultOpen={i === 0} />)}
        </div>
        {current.related && <p className="related"><Link to={lp(current.related.to)}>{current.related.label} ⟶</Link></p>}
      </> : <>
        <div className="service-list">
          {s.rows.map((row, i) => {
            const [id, index] = ROW_DETAILS[i];
            const cat = s.categories[id];
            const item = cat.items[index];
            return <ServiceItem key={row.title} title={row.title} hint={row.when} text={item.text} service={item.service || cat.service}
              more={<Link className="button" to={lp(`/services/${id}`)}>{cat.nav} ⟶</Link>} />;
          })}
        </div>
        <p className="related"><Link to={lp('/services/support')}>{s.categories.support.h1} ⟶</Link></p>
        <div className="faq">
          {s.faq.map(item => <div key={item.q}><h2>{item.q}</h2><p>{item.a}</p></div>)}
        </div>
      </>}
    </div>
    <ContactBlock service={current?.service} />
  </Page>;
}
