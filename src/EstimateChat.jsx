import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from './i18n';
import { chatText } from './i18n/estimate-chat';
import { telegram } from './contacts';
import './estimate-chat.css';

const money = (n, lang) => new Intl.NumberFormat(lang === 'hy' ? 'hy-AM' : lang === 'en' ? 'en-US' : 'ru-RU').format(n).replace(/ | /g, ' ') + ' ֏';

// Floating chat: the visitor describes a project, the AI answers with an approximate price (POST /api/estimate),
// and a short form sends the request with the estimate to the owner's Telegram (POST /api/lead).
export default function EstimateChat() {
  const { lang } = useLanguage();
  const t = chatText[lang] || chatText.ru;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [estimate, setEstimate] = useState(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showLead, setShowLead] = useState(false);
  const [lead, setLead] = useState({ name: '', contact: '', hp: '' });
  const [leadState, setLeadState] = useState('idle'); // idle | sending | sent
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, estimate, showLead, leadState, error]);

  const failText = (code, fallback, status) => (code === 'not_configured' ? t.unavailable : code === 'rate' ? t.rate : `${fallback} (${code || status})`);

  async function ask(content) {
    const value = content.trim();
    if (!value || busy) return;
    const next = [...messages, { role: 'user', content: value }];
    setMessages(next);
    setText('');
    setError('');
    setBusy(true);
    try {
      const r = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, lang }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(failText(data.error, t.errChat, r.status));
      } else {
        setMessages([...next, { role: 'assistant', content: data.reply }]);
        if (data.estimate) setEstimate(data.estimate);
      }
    } catch {
      setError(t.errChat);
    } finally {
      setBusy(false);
    }
  }

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
        body: JSON.stringify({ ...lead, messages, estimate, lang, page: location.pathname }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setLeadState('idle');
        setError(failText(data.error, t.errSend, r.status));
        return;
      }
      setLeadState('sent');
      setShowLead(false);
    } catch {
      setLeadState('idle');
      setError(t.errSend);
    }
  }

  function reset() {
    setMessages([]);
    setEstimate(null);
    setShowLead(false);
    setLeadState('idle');
    setError('');
    setText('');
  }

  const tgLink = (
    <a href={telegram} target="_blank" rel="noopener noreferrer">
      {t.tg}
    </a>
  );

  if (!open) {
    return (
      <button type="button" className="ec-fab" onClick={() => setOpen(true)} aria-label={t.open}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
          <path d="M9 11h6M9 14h4" />
        </svg>
        <span>{t.open}</span>
      </button>
    );
  }

  return (
    <section className="ec-panel" role="dialog" aria-modal="false" aria-label={t.title}>
      <header className="ec-head">
        <div>
          <b>{t.title}</b>
          <span>{t.sub}</span>
        </div>
        <div className="ec-head-tools">
          {messages.length > 0 && (
            <button type="button" className="ec-link" onClick={reset}>
              {t.again}
            </button>
          )}
          <button type="button" className="ec-close" onClick={() => setOpen(false)} aria-label={t.close}>
            ×
          </button>
        </div>
      </header>

      <div className="ec-list" ref={listRef} aria-live="polite">
        <p className="ec-msg ec-bot">{t.hello}</p>
        {messages.length === 0 && (
          <div className="ec-chips">
            {t.chips.map((c) => (
              <button type="button" key={c} onClick={() => ask(c)}>
                {c}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <p key={i} className={`ec-msg ${m.role === 'user' ? 'ec-me' : 'ec-bot'}`}>
            {m.content}
          </p>
        ))}
        {busy && <p className="ec-msg ec-bot ec-dots">{t.thinking}</p>}

        {estimate && (
          <div className="ec-estimate">
            <small>{t.estimate}</small>
            <b className="ec-price">
              {t.from} {money(estimate.min, lang)} {t.to} {money(estimate.max, lang)}
            </b>
            <p>
              {estimate.summary} · {t.term}: {estimate.duration}
            </p>
            {estimate.items.length > 0 && (
              <ul>
                {estimate.items.map((it, i) => (
                  <li key={i}>
                    <span>{it.name}</span>
                    <em>{it.price}</em>
                  </li>
                ))}
              </ul>
            )}
            {estimate.assumptions.length > 0 && (
              <details>
                <summary>{t.assumptions}</summary>
                <ul className="ec-plain">
                  {estimate.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </details>
            )}
            <small className="ec-note">{t.disclaimer}</small>
          </div>
        )}

        {leadState === 'sent' && <p className="ec-msg ec-ok">{t.sent}</p>}
        {error && (
          <p className="ec-msg ec-err">
            {error} {tgLink}
          </p>
        )}
      </div>

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
          <div className="ec-lead-actions">
            <button type="submit" className="ec-btn" disabled={leadState === 'sending'}>
              {leadState === 'sending' ? t.sending : t.submit}
            </button>
            <button type="button" className="ec-link" onClick={() => setShowLead(false)}>
              {t.close}
            </button>
          </div>
        </form>
      ) : (
        <form
          className="ec-input"
          onSubmit={(e) => {
            e.preventDefault();
            ask(text);
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                ask(text);
              }
            }}
            placeholder={t.placeholder}
            rows={2}
            maxLength={2000}
            aria-label={t.placeholder}
          />
          <div className="ec-actions">
            {leadState !== 'sent' && (
              <button type="button" className={`ec-btn ${estimate ? '' : 'ec-ghost'}`} onClick={() => setShowLead(true)}>
                {t.leave}
              </button>
            )}
            <button type="submit" className="ec-btn ec-solid" disabled={busy || !text.trim()}>
              {t.send}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
