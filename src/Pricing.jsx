import React, { useEffect } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { telegram, whatsapp, email } from './contacts';
import { useT, useLanguage, usePricingData } from './i18n';
import { Nl, LanguageSwitcher } from './i18n/Nl';
import PresentationMenu from './PresentationMenu';

function CheckList({ items }) { return <ul className="price-checklist">{items.map(text => <li key={text}><span aria-hidden="true">✓</span>{text}</li>)}</ul>; }

function ServiceCard({ service, t }) {
  return <article className={'price-card' + (service.badge ? ' featured' : '')} id={service.id}>
    <div className="price-card-top"><p className="price-label">{service.label}</p>{service.badge && <span className="price-badge">{service.badge}</span>}</div>
    <h3>{service.title}</h3><p className="price-value">{service.price}</p>
    {service.recurring && <p className="price-recurring">{service.recurring}</p>}
    <p className="price-duration">{service.duration}</p><p className="price-scope">{service.scope}</p>
    <div className="price-includes"><h4>{t.pricing.includesTitle}</h4><CheckList items={service.includes} /></div>
    <div className="price-extras"><h4>{t.pricing.extrasTitle}</h4><dl>{service.extras.map(([name, price]) => <div key={name}><dt>{name}</dt><dd>{price}</dd></div>)}</dl></div>
    <details className="price-needs"><summary>{t.pricing.needsTitle} <span aria-hidden="true">+</span></summary><ul>{service.needs.map(text => <li key={text}>{text}</li>)}</ul></details>
    {service.note && <p className="price-note">{service.note}</p>}
    <a className="price-button" href={telegram} target="_blank" rel="noopener noreferrer">{t.pricing.discussProject} <span aria-hidden="true">↗</span></a>
  </article>;
}

export default function Pricing() {
  const { category } = useParams();
  const t = useT();
  const { lang, setLang } = useLanguage();
  const { categories, services, supportPlans } = usePricingData();
  const p = t.pricing;
  const selected = categories.find(item => item.id === category);
  const valid = !category || Boolean(selected);
  useEffect(() => { document.title = `${selected ? selected.title + t.meta.pricingSuffix : t.meta.pricingAllTitle} | ${t.meta.siteName}`; }, [selected, t]);
  if (!valid) return <main className="missing-page"><p className="eyebrow">{t.common.notFoundEyebrow}</p><h1>{p.notFoundTitle}</h1><Link className="price-button" to="/pricing">{p.notFoundLink}</Link></main>;
  const visible = selected ? [selected] : categories;
  return <div className="site pricing-site">
    <a className="skip" href="#price-list">{t.common.skipPricing}</a>
    <header className="header">
      <Link className="brand" to="/" aria-label={t.common.brandAria}><img src="/assets/logo.jpg" width="434" height="94" alt="Afonin Web Studio" /></Link>
      <div className="header-right">
        <Link className="pricing-home" to="/#services">{t.common.backToHome}</Link>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </div>
    </header>
    <main>
      <section className="pricing-hero">
        <nav className="breadcrumbs" aria-label={p.breadcrumbsAria}><Link to="/">{p.home}</Link><span>/</span>{selected ? <><Link to="/pricing">{p.allServices}</Link><span>/</span><span aria-current="page">{selected.title}</span></> : <span aria-current="page">{p.allServices}</span>}</nav>
        <div className="pricing-heading"><div><p className="eyebrow">{p.eyebrow}</p><h1>{p.heading}<br /><span>{p.headingAccent}</span></h1></div><img className="pricing-star" src="/assets/logo-mark.png" width="210" height="113" alt="" aria-hidden="true" /></div>
        <div className="pricing-lead"><p><Nl text={p.lead} /></p><PresentationMenu className="pricing-download" triggerClassName="pricing-download-trigger" ariaLabel={p.downloadPresentation}>{p.downloadPresentation} <span>↓</span></PresentationMenu></div>
        <div className="price-promises">{p.promises.map(text => <span key={text}>{text}</span>)}</div>
      </section>
      <nav className="price-navigation" aria-label={p.navAria}><NavLink end to="/pricing">{p.allServicesNav} <span>{p.totalCount}</span></NavLink>{categories.map(item => <NavLink key={item.id} to={'/pricing/' + item.id}>{item.title}</NavLink>)}</nav>
      <div className="price-sections" id="price-list">
        {visible.map(item => <section className={'price-category category-' + item.id} key={item.id} aria-labelledby={'heading-' + item.id}>
          <div className="price-section-heading"><span className="price-section-number">{item.number}</span><div><h2 id={'heading-' + item.id}>{item.title}</h2><p>{item.intro}</p></div></div>
          {item.id === 'support' ? <><div className="price-grid">{supportPlans.map(plan => <article className="price-card support-card" key={plan.id}><p className="price-label">{p.supportLabel}</p><h3>{plan.title}</h3><p className="price-value">{plan.price}<span>{p.perMonth}</span></p><p className="price-duration">{plan.response}</p><CheckList items={plan.includes} /><a className="price-button" href={telegram} target="_blank" rel="noopener noreferrer">{p.supportCta} <span>↗</span></a></article>)}</div><p className="category-note">{p.supportNote}</p></> : <div className="price-grid">{services.filter(service => service.category === item.id).map(service => <ServiceCard service={service} key={service.id} t={t} />)}</div>}
        </section>)}
      </div>
      <section className="price-terms" aria-labelledby="terms-title"><p className="eyebrow">{p.termsEyebrow}</p><h2 id="terms-title">{p.termsTitle}</h2><div className="terms-grid">
        {p.terms.map(term => <div key={term.title}><h3>{term.title}</h3><p>{term.text}</p></div>)}
      </div><p className="category-note">{p.termsNote}</p></section>
      <section className="price-contact"><div><p className="eyebrow">{p.contactEyebrow}</p><h2>{p.contactTitle}</h2><p>{p.contactLead}</p><p className="price-bonus">{p.contactBonus}</p></div><div className="price-contact-actions"><a className="price-button solid" href={telegram} target="_blank" rel="noopener noreferrer">{p.writeTelegram} <span>↗</span></a><a className="price-button" href={whatsapp} target="_blank" rel="noopener noreferrer">{p.writeWhatsapp} <span>↗</span></a><a className="price-button" href={email}>{p.writeEmail} <span>✉</span></a><a className="price-phone" href="tel:+37498969453">+374 98 96 94 53</a><a className="price-email" href={email}>afoninwebstudio@gmail.com</a></div></section>
    </main>
    <footer className="pricing-footer"><span>{t.common.copyright}</span><Link to="/privacy">{t.common.privacyLink}</Link><Link to="/offer">{t.common.offerLink}</Link><Link to="/#services">{p.backToStudio}</Link><a href="#price-list">{p.upPrices}</a></footer>
  </div>;
}
