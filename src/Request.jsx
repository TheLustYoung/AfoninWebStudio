import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage, useLocalPath, useT } from './i18n';
import { EMAIL, PHONE, PHONE_LABEL, emailLink, greeting, telegramLink, whatsappLink } from './contacts';
import { MailIcon, PhoneIcon, TelegramIcon, WhatsappIcon } from './icons';
import PhoneField, { KNOWN, fullNumber } from './PhoneField';

const RequestContext = createContext(() => {});
export const useRequest = () => useContext(RequestContext);

export function MessengerButtons({ text, className = '' }) {
  const t = useT();
  const { lang } = useLanguage();
  const message = text || greeting(lang);
  return <div className={'messengers ' + className}>
    <a className="messenger telegram" href={telegramLink(message)} target="_blank" rel="noopener noreferrer"><TelegramIcon /><span>{t.form.telegram}</span></a>
    <a className="messenger whatsapp" href={whatsappLink(message)} target="_blank" rel="noopener noreferrer"><WhatsappIcon /><span>{t.form.whatsapp}</span></a>
  </div>;
}

export function LeadForm({ service: initialService = 'other', idPrefix = 'lead' }) {
  const t = useT();
  const { lang, country: regionCountry } = useLanguage();
  const lp = useLocalPath();
  const { pathname } = useLocation();
  const [values, setValues] = useState({ name: '', phone: '', contact: '', notes: '', hp: '' });
  const [pickedCountry, setPickedCountry] = useState(null);
  const [service, setService] = useState(initialService);
  const [state, setState] = useState('idle'); // idle | sending | sent | failed
  const [fieldError, setFieldError] = useState(null); // phoneInvalid | needContact
  const f = t.form;
  // The visitor's own country until they pick another; otherwise the studio's main market for that language.
  const country = pickedCountry || (KNOWN.has(regionCountry) ? regionCountry : lang === 'en' ? 'US' : 'AM');

  useEffect(() => setService(initialService), [initialService]);

  const update = key => event => setValues(v => ({ ...v, [key]: event.target.value }));
  const [phoneFull, setPhoneFull] = useState('');
  const message = () => [greeting(lang), `${f.serviceLabel}: ${f.services[service]}`, values.notes, values.name, phoneFull, values.contact].filter(Boolean).join('\n');

  async function submit(event) {
    event.preventDefault();
    setFieldError(null);
    setState('sending');
    try {
      const phone = await fullNumber(values.phone, country);
      if (phone === null) { setFieldError('phoneInvalid'); setState('idle'); return; }
      if (!phone && values.contact.trim().length < 5) { setFieldError('needContact'); setState('idle'); return; }
      setPhoneFull(phone);
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...values, phone, service, lang, page: pathname })
      });
      setState(res.ok ? 'sent' : 'failed');
    } catch {
      setState('failed');
    }
  }

  if (state === 'sent') return <div className="form-result" role="status"><strong>{f.sentTitle}</strong><p>{f.sentText}</p></div>;

  return <form className="lead-form" onSubmit={submit}>
    <fieldset>
      <legend>{f.serviceLabel}</legend>
      <div className="chips">
        {Object.entries(f.services).map(([id, label]) => <label key={id} className={'chip' + (service === id ? ' on' : '')}>
          <input type="radio" name={`${idPrefix}-service`} value={id} checked={service === id} onChange={() => setService(id)} />{label}
        </label>)}
      </div>
    </fieldset>
    <div className="form-row">
      <label htmlFor={`${idPrefix}-name`}>{f.name}<input id={`${idPrefix}-name`} name="name" autoComplete="name" required minLength={2} maxLength={80} value={values.name} onChange={update('name')} /></label>
      <PhoneField id={`${idPrefix}-phone`} lang={lang} label={f.phone} value={values.phone} country={country} texts={f} invalid={fieldError === 'phoneInvalid'}
        onChange={phone => { setValues(v => ({ ...v, phone })); setFieldError(null); }} onCountry={setPickedCountry} />
    </div>
    <label htmlFor={`${idPrefix}-contact`}>{f.contact}<input id={`${idPrefix}-contact`} name="contact" maxLength={120} placeholder={f.contactHint} value={values.contact} onChange={event => { update('contact')(event); setFieldError(null); }} /></label>
    {fieldError && <p className="field-error" role="alert">{f[fieldError]}</p>}
    <label htmlFor={`${idPrefix}-notes`}>{f.notes}<textarea id={`${idPrefix}-notes`} name="notes" rows={4} maxLength={1500} placeholder={f.notesHint} value={values.notes} onChange={update('notes')} /></label>
    <input className="form-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="company" value={values.hp} onChange={update('hp')} />
    {state === 'failed' && <div className="form-failed" role="alert"><p>{f.failed}</p><MessengerButtons text={message()} /><a href={emailLink(message())}>{EMAIL}</a></div>}
    <button className="button solid" type="submit" disabled={state === 'sending'}>{state === 'sending' ? f.sending : f.send}<span aria-hidden="true">⟶</span></button>
    <small>{f.consent} <Link to={lp('/privacy')}>{t.common.privacyLink}</Link></small>
  </form>;
}

export function ContactBlock({ service }) {
  const t = useT();
  const { lang } = useLanguage();
  const c = t.contact;
  return <section className="contact" id="contact" aria-labelledby="contact-title">
    <div className="contact-intro">
      <h2 id="contact-title">{c.title}</h2>
      <p>{c.lead}</p>
      <MessengerButtons />
      <address className="contact-links">
        <a href={emailLink(greeting(lang))}><MailIcon /><span>{EMAIL}</span></a>
        <a href={`tel:${PHONE}`}><PhoneIcon /><span>{PHONE_LABEL}</span></a>
        <p>{c.city}</p>
      </address>
    </div>
    <LeadForm service={service} idPrefix="contact" />
  </section>;
}

// Floating Telegram / WhatsApp buttons and the request dialog, available on every page.
export function RequestProvider({ children }) {
  const t = useT();
  const { lang } = useLanguage();
  const dialog = useRef(null);
  const [service, setService] = useState('other');

  function open(next = 'other') {
    setService(next);
    dialog.current?.showModal();
  }

  return <RequestContext.Provider value={open}>
    {children}
    <div className="dock">
      <a className="dock-round telegram" href={telegramLink(greeting(lang))} target="_blank" rel="noopener noreferrer" aria-label={t.form.telegram} title={t.form.telegram}><TelegramIcon /></a>
      <a className="dock-round whatsapp" href={whatsappLink(greeting(lang))} target="_blank" rel="noopener noreferrer" aria-label={t.form.whatsapp} title={t.form.whatsapp}><WhatsappIcon /></a>
      <button className="dock-request" type="button" onClick={() => open()}>{t.form.open}</button>
    </div>
    <dialog className="request-dialog" ref={dialog} aria-labelledby="request-title" onClick={event => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="request-inner">
        <button className="dialog-close" type="button" aria-label={t.form.close} onClick={() => dialog.current.close()}>×</button>
        <h2 id="request-title">{t.form.title}</h2>
        <p>{t.contact.lead}</p>
        <LeadForm service={service} idPrefix="dialog" />
      </div>
    </dialog>
  </RequestContext.Provider>;
}
