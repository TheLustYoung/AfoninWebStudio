import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useT } from './index';

const STORAGE_KEY = 'afonin_cookie_consent';

export function CookieBanner() {
  const t = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <div className="cookie-banner" role="dialog" aria-live="polite">
      <p>{t.common.cookieText} <Link to="/privacy">{t.common.privacyLink}</Link></p>
      <button type="button" className="price-button solid" onClick={accept}>{t.common.cookieAccept}</button>
    </div>
  );
}
