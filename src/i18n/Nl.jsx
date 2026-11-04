import React from 'react';

export function Nl({ text }) {
  const lines = text.split('\n');
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 && <br />}
      {i > 0 && ' '}
      {line}
    </React.Fragment>
  ));
}

export function LanguageSwitcher({ lang, languages, setLang }) {
  return (
    <div className="lang-switch" role="group" aria-label="Language / Язык / Լեզու">
      {languages.map(code => (
        <button
          key={code}
          type="button"
          lang={code}
          className={'lang-switch-btn' + (lang === code ? ' active' : '')}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
