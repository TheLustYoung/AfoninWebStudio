import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage, usePricingData } from './i18n';
import { chatText } from './i18n/estimate-chat';
import { telegram } from './contacts';
import { ADDONS, ADDON_IDS, PROJECTS, PROJECT_IDS, SUPPORT, SUPPORT_IDS, calc, detect, summaryRu } from './estimate-engine';
import './estimate-chat.css';

const WA = 'https://wa.me/37498969453';
const START = { project: null, langs: 1, bigPages: false, addons: [], support: 'none' };

// Price calculator without AI: the visitor describes a project (keywords pick the type) or chooses it, answers 2-3 short questions,
// and gets a price and timeline from the studio price list. The request goes to Telegram (POST /api/lead); if the server is not
// configured, ready-made Telegram and WhatsApp links with the calculation are shown instead.
export default function EstimateChat() {
  const { lang } = useLanguage();
  const t = chatText[lang] || chatText.ru;
  const { services } = usePricingData();
  const titleOf = (id) => services.find((s) => s.id === id)?.title || id;
  const money = (n) => new Intl.NumberFormat(lang === 'hy' ? 'hy-AM' : lang === 'en' ? 'en-US' : 'ru-RU').format(n).replace(/ | /g, ' ') + ' ֏';

  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState(START);
  const [step, setStep] = useState('start');
  const [notes, setNotes] = useState('');
  const [hint, setHint] = useState('');
  const [showLead, setShowLead] = useState(false);
  const [lead, setLead] = useState({ name: '', contact: '', hp: '' });
  const [leadState, setLeadState] = useState('idle'); // idle | sending | sent | fallback
  const [error, setError] = useState('');
  const [leadId, setLeadId] = useState('');
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [step, showLead]);

  const project = answers.project ? PROJECTS[answers.project] : null;
  const steps = project
    ? ['start', ...(project.langs && answers.project !== 'shop' ? ['langs'] : []), ...(answers.project === 'company' ? ['pages'] : []), 'addons', 'result']
    : ['start'];
  const idx = steps.indexOf(step);
  const go = (delta) => setStep(steps[Math.min(steps.length - 1, Math.max(0, idx + delta))]);

  function chooseProject(id) {
    setAnswers({ ...START, project: id, langs: PROJECTS[id].langs || 1 });
    setHint('');
    const nextSteps = ['start', ...(PROJECTS[id].langs && id !== 'shop' ? ['langs'] : []), ...(id === 'company' ? ['pages'] : []), 'addons'];
    setStep(nextSteps[1]);
  }

  function guess() {
    const id = detect(notes);
    if (!id) {
      setHint(t.notFound);
      return;
    }
    chooseProject(id);
    setHint(`${t.guessed}: ${titleOf(id)}`);
  }

  const toggleAddon = (id) => setAnswers((a) => ({ ...a, addons: a.addons.includes(id) ? a.addons.filter((x) => x !== id) : [...a.addons, id] }));
  const reset = () => {
    setAnswers(START);
    setStep('start');
    setNotes('');
    setHint('');
    setShowLead(false);
    setLeadState('idle');
    setError('');
  };

  const result = answers.project ? calc(answers) : null;
  const message = result ? `${t.msgHead}\n\n${summaryRu(answers, result, notes)}` : '';

  async function submitLead(e) {
    e.preventDefault();
    setError('');
    if (lead.name.trim().length < 2 || lead.contact.trim().length < 5) {
      setError(t.errName);
      return;
    }
    setLeadState('sending');
    try {
      const r = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, answers, notes, lang, page: location.pathname }),
      });
      if (r.ok) {
        const done = await r.json().catch(() => ({}));
        setLeadId(done.id || '');
        setLeadState('sent');
        setShowLead(false);
        return;
      }
    } catch {
      /* falls through to the direct links */
    }
    setLeadState('fallback');
    setShowLead(false);
  }

  const addonPrice = (id) => {
    const a = ADDONS[id];
    const parts = [];
    if (a.price) parts.push(money(a.price));
    if (a.monthly) parts.push(`${money(a.monthly)} ${t.perMonth}`);
    return parts.join(' + ');
  };

  if (!open) {
    return (
      <button type="button" className="ec-fab" onClick={() => setOpen(true)} aria-label={t.open}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M8 7h8M8 12h2M12 12h2M8 16h2M12 16h2" />
        </svg>
        <span>{t.open}</span>
      </button>
    );
  }

  const choice = (label, active, onClick, key) => (
    <button type="button" key={key ?? label} className={`ec-choice ${active ? 'is-on' : ''}`} onClick={onClick} aria-pressed={active}>
      {label}
    </button>
  );

  return (
    <section className="ec-panel" role="dialog" aria-modal="false" aria-label={t.title}>
      <header className="ec-head">
        <div>
          <b>{t.title}</b>
          <span>{t.sub}</span>
        </div>
        <div className="ec-head-tools">
          {(answers.project || notes) && (
            <button type="button" className="ec-link" onClick={reset}>
              {t.restart}
            </button>
          )}
          <button type="button" className="ec-close" onClick={() => setOpen(false)} aria-label={t.close}>
            ×
          </button>
        </div>
      </header>

      <div className="ec-body" ref={bodyRef}>
        {showLead && leadState !== 'sent' ? (
          <form className="ec-lead" onSubmit={submitLead}>
            <b>{t.leaveTitle}</b>
            <p>{t.leaveText}</p>
            <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} placeholder={t.name} autoComplete="name" maxLength={80} required />
            <input value={lead.contact} onChange={(e) => setLead({ ...lead, contact: e.target.value })} placeholder={t.contact} autoComplete="tel" maxLength={120} required />
            <input className="ec-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={lead.hp} onChange={(e) => setLead({ ...lead, hp: e.target.value })} />
            <small>
              {t.consent} <Link to="/privacy">{t.privacy}</Link>
            </small>
            {error && <p className="ec-err">{error}</p>}
            <div className="ec-actions">
              <button type="submit" className="ec-btn ec-solid" disabled={leadState === 'sending'}>
                {leadState === 'sending' ? t.sending : t.submit}
              </button>
              <button type="button" className="ec-link" onClick={() => setShowLead(false)}>
                {t.back}
              </button>
            </div>
          </form>
        ) : (
          <>
            {step === 'start' && (
              <div className="ec-step">
                <p className="ec-q">{t.hello}</p>
                <label className="ec-label" htmlFor="ec-notes">
                  {t.describe}
                </label>
                <textarea id="ec-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.placeholder} rows={3} maxLength={800} />
                <button type="button" className="ec-btn ec-solid" onClick={guess} disabled={notes.trim().length < 3}>
                  {t.pick}
                </button>
                {hint && <p className="ec-hint">{hint}</p>}
                <p className="ec-label">{t.types}</p>
                <div className="ec-grid">{PROJECT_IDS.map((id) => choice(titleOf(id), answers.project === id, () => chooseProject(id), id))}</div>
              </div>
            )}

            {step === 'langs' && project && (
              <div className="ec-step">
                {hint && <p className="ec-hint">{hint}</p>}
                <p className="ec-q">{t.qLangs}</p>
                <div className="ec-grid ec-col">{t.langOpt.map((label, i) => choice(label, answers.langs === i + 1, () => setAnswers((a) => ({ ...a, langs: i + 1 })), i))}</div>
                <p className="ec-hint">
                  {t.langIncluded} {project.langs}
                </p>
              </div>
            )}

            {step === 'pages' && (
              <div className="ec-step">
                <p className="ec-q">{t.qPages}</p>
                <div className="ec-grid ec-col">{t.pagesOpt.map((label, i) => choice(label, answers.bigPages === (i === 1), () => setAnswers((a) => ({ ...a, bigPages: i === 1 })), i))}</div>
              </div>
            )}

            {step === 'addons' && (
              <div className="ec-step">
                {hint && step === 'addons' && <p className="ec-hint">{hint}</p>}
                <p className="ec-q">{t.qAddons}</p>
                <p className="ec-hint">{t.addonsHint}</p>
                <div className="ec-grid ec-col">
                  {ADDON_IDS.filter((id) => id !== answers.project).map((id) => choice(`${t.addons[id]} · ${addonPrice(id)}`, answers.addons.includes(id), () => toggleAddon(id), id))}
                </div>
                <p className="ec-q">{t.qSupport}</p>
                <div className="ec-grid ec-col">{SUPPORT_IDS.map((id) => choice(id === 'none' ? t.support.none : `${t.support[id]} · ${money(SUPPORT[id])} ${t.perMonth}`, answers.support === id, () => setAnswers((a) => ({ ...a, support: id })), id))}</div>
              </div>
            )}

            {step === 'result' && result && (
              <div className="ec-step">
                <div className="ec-estimate">
                  <small>{t.estimate}</small>
                  <b className="ec-price">
                    {result.custom ? t.from : ''} {money(result.min)} {t.to} {money(result.max)}
                  </b>
                  <p>
                    {titleOf(answers.project)} · {t.term}: {result.daysMax ? `${result.daysMin === result.daysMax ? result.daysMin : `${result.daysMin}–${result.daysMax}`} ${t.days}` : t.byTz}
                  </p>
                  {result.monthly > 0 && (
                    <p>
                      {t.monthly}: {money(result.monthly)}
                    </p>
                  )}
                  <small className="ec-label">{t.composition}</small>
                  <ul>
                    {result.items.map((it) => (
                      <li key={it.id}>
                        <span>{itemLabel(it)}</span>
                        <em>
                          {it.from ? `${t.from} ` : ''}
                          {money(it.amount)}
                          {it.monthly ? ` ${t.perMonth}` : ''}
                        </em>
                      </li>
                    ))}
                  </ul>
                  {result.custom && <small>{t.customNote}</small>}
                  <small className="ec-note">{t.disclaimer}</small>
                </div>

                {leadState === 'sent' && <p className="ec-ok">{t.sent}{leadId ? ` (${leadId})` : ''}</p>}
                {leadState === 'fallback' && (
                  <div className="ec-fallback">
                    <b>{t.fallbackTitle}</b>
                    <p>{t.fallbackText}</p>
                    <div className="ec-actions">
                      <a className="ec-btn ec-solid" href={`${telegram}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
                        {t.sendTg}
                      </a>
                      <a className="ec-btn" href={`${WA}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
                        {t.sendWa}
                      </a>
                    </div>
                  </div>
                )}
                {leadState !== 'sent' && leadState !== 'fallback' && (
                  <button type="button" className="ec-btn ec-solid ec-wide" onClick={() => setShowLead(true)}>
                    {t.leave}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {!showLead && step !== 'start' && (
        <footer className="ec-foot">
          <button type="button" className="ec-link" onClick={() => go(-1)}>
            {t.back}
          </button>
          {step !== 'result' && (
            <button type="button" className="ec-btn ec-solid" onClick={() => go(1)}>
              {step === 'addons' ? t.calc : t.next}
            </button>
          )}
        </footer>
      )}
    </section>
  );

  function itemLabel(it) {
    if (it.id.endsWith(':monthly')) return `${t.addons[it.id.split(':')[0]] || titleOf(it.id.split(':')[0])}`;
    if (it.id === 'lang') return `${t.langExtra} (${it.count})`;
    if (SUPPORT_IDS.includes(it.id)) return `${t.qSupport.replace('?', '')}: ${t.support[it.id]}`;
    if (it.id === answers.project) return titleOf(it.id);
    return t.addons[it.id] || titleOf(it.id);
  }
}

