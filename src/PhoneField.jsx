import React, { useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRIES } from './phone-countries';

const TOP = ['AM', 'RU', 'US', 'GE', 'KZ', 'BY', 'UA'];
export const KNOWN = new Set(COUNTRIES.map(c => c.code));
const dialOf = code => COUNTRIES.find(c => c.code === code)?.dial || '';

// The number library is heavy, so it loads when the visitor starts entering a number, not with the page.
let library = null;
const loadLibrary = () => import('libphonenumber-js/min').then(mod => { library = mod; return mod; });

const Flag = ({ code }) => <img className="flag" src={`/assets/flags/${code}.svg`} width="24" height="16" alt="" loading="lazy" onError={event => { event.currentTarget.style.visibility = 'hidden'; }} />;

// Returns the full international number, '' when empty, or null when it cannot be a real number.
export async function fullNumber(national, country) {
  if (!national.replace(/\D/g, '')) return '';
  const { parsePhoneNumberFromString } = await loadLibrary();
  const parsed = parsePhoneNumberFromString(national, country);
  return parsed && parsed.isPossible() ? parsed.number : null;
}

export default function PhoneField({ id, lang, label, value, country, onChange, onCountry, texts, invalid }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const root = useRef(null);
  const search = useRef(null);

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const outside = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  const countries = useMemo(() => {
    if (!open) return [];
    // Browsers without this API, or without a language, still get a working list of country codes.
    let names = null;
    try { names = new Intl.DisplayNames([lang, 'en'], { type: 'region' }); } catch {}
    const named = COUNTRIES.map(c => ({ ...c, name: names?.of(c.code) || c.code, top: TOP.indexOf(c.code) }));
    return named.sort((a, b) => {
      if (a.top >= 0 || b.top >= 0) return (a.top < 0 ? 99 : a.top) - (b.top < 0 ? 99 : b.top);
      return a.name.localeCompare(b.name, lang);
    });
  }, [open, lang]);

  const needle = query.trim().toLowerCase().replace(/^\+/, '');
  const shown = needle ? countries.filter(c => c.name.toLowerCase().includes(needle) || c.dial.startsWith(needle) || c.code.toLowerCase() === needle) : countries;

  function format(digits, code) {
    return library ? new library.AsYouType(code).input(digits) : digits;
  }

  function choose(code) {
    onCountry(code);
    onChange(format(value.replace(/\D/g, ''), code));
    setOpen(false);
    setQuery('');
    root.current?.querySelector('input[type=tel]')?.focus();
  }

  function input(event) {
    const raw = event.target.value;
    // A pasted international number sets the country by itself.
    if (raw.trim().startsWith('+')) {
      if (library) {
        const typed = new library.AsYouType();
        typed.input(raw);
        const detected = typed.getCountry();
        if (detected && KNOWN.has(detected)) {
          onCountry(detected);
          onChange(format(typed.getNationalNumber(), detected));
          return;
        }
      }
      onChange('+' + raw.replace(/\D/g, ''));
      return;
    }
    let digits = raw.replace(/\D/g, '');
    // Backspace over a space or a bracket must still remove a digit.
    if (raw.length < value.length && digits === value.replace(/\D/g, '')) digits = digits.slice(0, -1);
    onChange(format(digits, country));
  }

  return <div className="phone-field" ref={root}>
    <label htmlFor={id}>{label}</label>
    <div className={'phone-box' + (invalid ? ' invalid' : '')}>
      <button type="button" className="phone-country" aria-haspopup="listbox" aria-expanded={open} aria-label={texts.chooseCountry} onClick={() => { setOpen(o => !o); loadLibrary(); }}>
        <Flag code={country} /><span>+{dialOf(country)}</span><i aria-hidden="true">▾</i>
      </button>
      <input id={id} type="tel" name="phone" inputMode="tel" autoComplete="tel-national" maxLength={24} aria-invalid={invalid || undefined} value={value} onFocus={loadLibrary} onChange={input} />
    </div>
    {open && <div className="phone-menu" onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); }
    }}>
      <input ref={search} type="search" aria-label={texts.searchCountry} placeholder={texts.searchCountry} value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => {
        if (event.key === 'Enter') { event.preventDefault(); if (shown[0]) choose(shown[0].code); }
      }} />
      <ul role="listbox" aria-label={texts.chooseCountry}>
        {shown.map(c => <li key={c.code} role="option" aria-selected={c.code === country}>
          <button type="button" className={c.code === country ? 'on' : ''} onClick={() => choose(c.code)}><Flag code={c.code} /><span>{c.name}</span><em>+{c.dial}</em></button>
        </li>)}
        {!shown.length && <li className="phone-empty">{texts.noCountry}</li>}
      </ul>
    </div>}
  </div>;
}
