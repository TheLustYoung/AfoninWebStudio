import React, { useEffect, useRef, useState } from 'react';

const LANGS = ['en', 'ru', 'hy'];
const LABELS = { en: 'EN', ru: 'RU', hy: 'HY' };
const FILE_NAMES = { en: 'Afonin-Web-Studio-Presentation-EN.pdf', ru: 'Afonin-Web-Studio-Presentation-RU.pdf', hy: 'Afonin-Web-Studio-Presentation-HY.pdf' };

export default function PresentationMenu({ className, triggerClassName, ariaLabel, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDocClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className={'presentation-menu' + (className ? ' ' + className : '')} ref={ref}>
      <button type="button" className={triggerClassName} aria-haspopup="true" aria-expanded={open} aria-label={ariaLabel} onClick={() => setOpen(o => !o)}>
        {children}
      </button>
      {open && (
        <div className="presentation-menu-list" role="menu">
          {LANGS.map(code => (
            <a key={code} role="menuitem" href={'/assets/afonin-presentation-' + code + '.pdf'} download={FILE_NAMES[code]} onClick={() => setOpen(false)}>{LABELS[code]}</a>
          ))}
        </div>
      )}
    </div>
  );
}
