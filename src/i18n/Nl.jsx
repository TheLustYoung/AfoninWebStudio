import React from 'react';

export function Nl({ text }) {
  const lines = text.split('\n');
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </React.Fragment>
  ));
}

export function LanguageSwitcher({ lang, setLang }) {
  const options = [
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
    { code: 'hy', label: 'HY' }
  ];
  return (
    <div className="lang-switch" role="group" aria-label="Language / Язык / Լեզու">
      {options.map(opt => (
        <button
          key={opt.code}
          type="button"
          className={'lang-switch-btn' + (lang === opt.code ? ' active' : '')}
          onClick={() => setLang(opt.code)}
          aria-pressed={lang === opt.code}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
