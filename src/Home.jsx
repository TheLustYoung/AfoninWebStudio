import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalPath, useT } from './i18n';
import { Nl } from './i18n/Nl';
import { Page } from './Layout';
import { BEHANCE } from './contacts';
import { ContactBlock, useRequest } from './Request';
import { CASES } from './routes';

const SHOTS = {
  'telegram-support': ['desktop-03-ticket', 'mobile-04-ticket'],
  'media-platform': ['desktop-01-overview', 'mobile-02-overview']
};

export default function Home() {
  const t = useT();
  const lp = useLocalPath();
  const openRequest = useRequest();
  const h = t.home;
  return <Page>
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="hero-visual">
        <div className="hero-word" aria-hidden="true">AFONIN</div>
        <img className="portrait" src="/assets/portrait.webp" alt={h.portraitAlt} fetchPriority="high" width="1147" height="1372" />
      </div>
      <div className="hero-intro">
        <p className="handwritten">{h.greeting}</p>
        <p className="hero-name"><Nl text={h.name} /></p>
        <h1 id="hero-title">{h.h1}</h1>
        <p className="intro-copy">{h.intro}</p>
        <div className="hero-actions">
          <button className="button solid" type="button" onClick={() => openRequest()}>{t.form.open}<span aria-hidden="true">⟶</span></button>
          <a className="button" href="#work">{h.seeWork}</a>
        </div>
      </div>
      <div className="hero-side">
        <p className="location"><span aria-hidden="true">◎</span> {h.location}</p>
        <dl className="stats">{h.stats.map(s => <div key={s.label}><dt>{s.value}<span>{s.unit}</span></dt><dd><Nl text={s.label} /></dd></div>)}</dl>
      </div>
    </section>
    <p className="intro-band">{h.band}</p>

    <section className="work" id="work" aria-labelledby="work-title">
      <div className="section-heading"><h2 id="work-title">{h.workTitle}</h2><span className="heading-line"></span><a href={BEHANCE} target="_blank" rel="noopener noreferrer">{h.behance} ↗</a></div>
      <div className="work-grid">
        {CASES.map((id, i) => {
          const c = t.work.cases[id];
          const [desktop, phone] = SHOTS[id];
          return <Link className="work-card" key={id} to={lp(`/work/${id}`)}>
            <span className="work-shots">
              <img className="work-desktop" src={`/assets/work/${id}-${desktop}.webp`} width="1400" height="875" loading="lazy" alt={c.shotAlt} />
              <img className="work-phone" src={`/assets/work/${id}-${phone}.webp`} width="560" height="1212" loading="lazy" alt="" />
              <span className="demo-badge">{t.work.demoBadge}</span>
            </span>
            <span className="card-caption">
              <span className="card-number">{String(i + 1).padStart(2, '0')}</span>
              <span><strong>{c.name}</strong><small>{c.tagline}</small></span>
              <span className="long-arrow" aria-hidden="true">⟶</span>
            </span>
            <span className="work-summary">{c.summary}</span>
          </Link>;
        })}
      </div>
      <p className="work-note">{t.work.note}</p>
    </section>

    <section className="services" id="services" aria-labelledby="services-title">
      <div className="section-heading"><h2 id="services-title">{h.servicesTitle}</h2><span className="heading-line"></span><Link to={lp('/services')}>{h.allServices} <span className="long-arrow" aria-hidden="true">⟶</span></Link></div>
      <div className="service-grid">
        {h.problems.map((p, i) => <Link className="service-card" key={p.id} to={lp(`/services/${p.id}`)}>
          <b className="card-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</b>
          <strong>{p.title}</strong>
          <span>{p.text}</span>
          <em>{p.link} ⟶</em>
        </Link>)}
      </div>
    </section>

    <section className="about-grid" id="process" aria-label={h.aboutAria}>
      <div className="process"><h2>{h.processTitle}</h2><ol>
        {h.steps.map((step, i) => <li key={step.title}><span className="step-number">{String(i + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><p>{step.desc}</p></div></li>)}
      </ol></div>
      <div className="experience"><h2>{h.experienceTitle}</h2>
        {h.experienceRows.map(row => <div className="experience-row" key={row.title}><div><strong>{row.title}</strong><p>{row.desc}</p></div><span>{row.badge}</span></div>)}
        <div className="skills"><h3>{h.skillsTitle}</h3><ul>{h.skills.map(skill => <li key={skill}>{skill}</li>)}</ul></div>
      </div>
      <aside className="manifesto"><span className="quote-mark" aria-hidden="true">“</span><blockquote><Nl text={h.manifestoQuote} /></blockquote><p className="signature">{h.signature}</p><div className="manifesto-bottom"><Nl text={h.manifestoBottom} /></div></aside>
    </section>

    <ContactBlock />
  </Page>;
}
