import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';

export { headTags } from './seo';
export { LANGUAGES, PAGES, localize, absolute, SITE_URL } from './routes';

export function render(url) {
  return renderToString(<StaticRouter location={url}><App /></StaticRouter>);
}
