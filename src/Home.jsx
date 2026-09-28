import React from 'react';
import { Link } from 'react-router-dom';
import { whatsapp, email } from './contacts';
import { useT, useLanguage } from './i18n';
import { Nl, LanguageSwitcher } from './i18n/Nl';
import PresentationMenu from './PresentationMenu';

export default function Home() {
  const t = useT();
  const { lang, setLang } = useLanguage();
  const h = t.home;
  return (<>
<a className="skip" href="#services">{t.common.skipServices}</a>
<div className="site">
<header className="header">
  <a className="brand" href="#home" aria-label={t.common.brandAria}><img src="/assets/logo.jpg" width="434" height="94" alt="Afonin Web Studio" /></a>
  <div className="header-right">
    <a className="availability" href="#contact">{h.availability} <img className="spark" src="/assets/logo-mark.png" width="34" height="18" alt="" aria-hidden="true" /></a>
    <LanguageSwitcher lang={lang} setLang={setLang} />
  </div>
</header>
<main>
<section className="hero" id="home" aria-labelledby="hero-title">
  <div className="hero-word" aria-hidden="true">AFONIN</div>
  <img className="portrait" src="/assets/portrait.webp" alt={h.portraitAlt} fetchPriority="high" width="1147" height="1372" />
  <div className="hero-intro">
    <p className="handwritten">{h.greeting}</p>
    <h1 id="hero-title"><Nl text={h.name} /></h1>
    <h2><Nl text={h.role} /></h2>
    <p className="intro-copy">{h.intro}</p>
    <p className="location"><span>◎</span> {h.location}</p>
  </div>
  <div className="hero-note"><span className="orbit"><img src="/assets/logo-mark.png" width="30" height="16" alt="" aria-hidden="true" /></span><p><Nl text={h.heroNote} /></p></div>
  <dl className="stats">{h.stats.map(s => <div key={s.label}><dt>{s.value}<span>{s.unit}</span></dt><dd><Nl text={s.label} /></dd></div>)}</dl>
</section>
<section className="services" id="services" aria-labelledby="services-title">
  <div className="section-heading"><h2 id="services-title">{h.servicesTitle}</h2><span className="heading-line"></span><Link to="/pricing">{h.fullPricing} <span className="long-arrow">⟶</span></Link></div>
  <div className="service-grid">
    <Link className="service-card" to="/pricing/websites"><img src="/assets/websites.webp" alt={h.services[0].alt} width="1440" height="810" loading="lazy" /><span className="card-caption"><span className="card-number">01</span><span><strong>{h.services[0].title}</strong><small>{h.services[0].small}</small></span><span className="long-arrow">⟶</span></span></Link>
    <Link className="service-card" to="/pricing/automation"><img src="/assets/automation.webp" alt={h.services[1].alt} width="1440" height="810" loading="lazy" /><span className="card-caption"><span className="card-number">02</span><span><strong>{h.services[1].title}</strong><small>{h.services[1].small}</small></span><span className="long-arrow">⟶</span></span></Link>
    <Link className="service-card" to="/pricing/webapps"><img src="/assets/webapps.webp" alt={h.services[2].alt} width="1440" height="810" loading="lazy" /><span className="card-caption"><span className="card-number">03</span><span><strong>{h.services[2].title}</strong><small>{h.services[2].small}</small></span><span className="long-arrow">⟶</span></span></Link>
  </div>
</section>
<section className="about-grid" aria-label={h.aboutAria}>
  <div className="experience"><h2>{h.experienceTitle}</h2><h3>{h.aboutStudio}</h3>
    {h.experienceRows.map(row => <div className="experience-row" key={row.title}><div><strong>{row.title}</strong><p>{row.desc}</p></div><span>{row.badge}</span></div>)}
    <div className="skills"><h3>{h.skillsTitle}</h3><ul>{h.skills.map(skill => <li key={skill}>{skill}</li>)}</ul></div>
  </div>
  <div className="process"><h2>{h.processTitle}</h2><ol>
    {h.steps.map((step, i) => {
      const icons = ['⌕', '◇', '✎', null, '↗'];
      return <li key={step.title}><span className="step-number">{String(i + 1).padStart(2, '0')}</span><span className={'step-icon' + (i === 3 ? ' code-icon' : '')}>{i === 3 ? <>&lt;/&gt;</> : icons[i]}</span><div><h3>{step.title}</h3><p><Nl text={step.desc} /></p></div></li>;
    })}
  </ol></div>
  <aside className="manifesto"><span className="quote-mark" aria-hidden="true">“</span><blockquote><Nl text={h.manifestoQuote} /></blockquote><p className="signature">{h.signature}</p><div className="manifesto-bottom"><Nl text={h.manifestoBottom} /><img className="brand-mark" src="/assets/logo-mark.png" width="44" height="24" alt="" aria-hidden="true" /></div></aside>
</section>
<footer className="contact" id="contact">
  <div className="contact-intro"><h2><Nl text={h.contactTitle} /> <img className="brand-mark" src="/assets/logo-mark.png" width="46" height="25" alt="" aria-hidden="true" /></h2><p>{h.contactLead}</p><a className="contact-cta" href="https://t.me/AfoninWebStudio" target="_blank" rel="noopener"><span>↗</span> {h.contactCta}</a></div>
  <address className="contact-links"><a href={email} aria-label={h.emailAria}><span className="contact-icon">✉</span><span><small>{h.emailSmall}</small>afoninwebstudio@gmail.com</span></a><a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label={h.whatsappAria}><span className="contact-icon">☎</span><span><small>{h.whatsappSmall}</small>+374 98 96 94 53</span></a><a href="https://t.me/AfoninWebStudio" target="_blank" rel="noopener"><span className="contact-icon">↗</span><span>@AfoninWebStudio</span></a><a href="tel:+37498969453"><span className="contact-icon">☎</span><span>{h.callText}</span></a><p><span className="contact-icon">⌖</span><span>{h.cityLine}</span></p></address>
  <PresentationMenu className="presentation-preview" triggerClassName="presentation-trigger" ariaLabel={h.presentationAria}><img src="/assets/presentation.webp" width="1440" height="810" alt={h.presentationAlt} loading="lazy" /><span>{h.presentationText} <span>↓</span></span></PresentationMenu>
  <div className="footer-line"><span>{t.common.copyright}</span><Link to="/privacy">{t.common.privacyLink}</Link><Link to="/offer">{t.common.offerLink}</Link><a href="https://github.com/TheLustYoung" target="_blank" rel="noopener">{t.common.github}</a><a href="#home">{t.common.up}</a></div>
</footer>
</main>
</div>
</>);
}
