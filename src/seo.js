// Head tags of a page: the same source for the prerendered HTML (scripts/prerender.mjs) and for navigation in the browser.
import { content } from './i18n';
import { CASES, LANGUAGES, SITE_URL, absolute } from './routes';
import { EMAIL, PHONE } from './contacts';

const esc = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const LOCALES = { ru: 'ru_RU', en: 'en_US', hy: 'hy_AM' };

function jsonLd(path, lang, seo) {
  const t = content[lang];
  const url = absolute(path, lang);
  const items = [{
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#studio`,
    name: 'Afonin Web Studio',
    url: absolute('/', lang),
    logo: `${SITE_URL}/assets/logo.jpg`,
    image: `${SITE_URL}/assets/og.jpg`,
    description: t.seo['/'].description,
    telephone: PHONE,
    email: EMAIL,
    founder: { '@type': 'Person', name: 'Vladislav Afonin' },
    address: { '@type': 'PostalAddress', addressLocality: 'Gyumri', addressCountry: 'AM' },
    areaServed: ['Armenia', 'United States'],
    knowsLanguage: LANGUAGES,
    sameAs: ['https://www.instagram.com/afoninwebstudio/', 'https://www.facebook.com/profile.php?id=61594983876881', 'https://t.me/AfoninWebStudio', 'https://www.youtube.com/@AfoninWebStudio', 'https://github.com/TheLustYoung', 'https://www.behance.net/vladislavafonin']
  }];
  if (path !== '/') {
    items.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t.common.home, item: absolute('/', lang) },
        { '@type': 'ListItem', position: 2, name: seo.title, item: url }
      ]
    });
  }
  if (path.startsWith('/services/')) {
    items.push({ '@type': 'Service', name: seo.title, description: seo.description, url, provider: { '@id': `${SITE_URL}/#studio` } });
  }
  if (path.startsWith('/work/')) {
    items.push({ '@type': 'CreativeWork', name: seo.title, description: seo.description, url, inLanguage: lang, creator: { '@id': `${SITE_URL}/#studio` } });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': items }).replace(/</g, '\\u003c');
}

export function pageSeo(path, lang) {
  const known = content[lang].seo[path];
  return known || { title: content[lang].notFound.title + ' | Afonin Web Studio', description: '', missing: true };
}

export function headTags(path, lang) {
  const seo = pageSeo(path, lang);
  if (seo.missing) return [`<title data-seo>${esc(seo.title)}</title>`, '<meta data-seo name="robots" content="noindex">'].join('\n  ');
  const url = absolute(path, lang);
  const slug = path.startsWith('/work/') && path.slice(6);
  const image = `${SITE_URL}/assets/${CASES.includes(slug) ? `work/${slug}-og.jpg` : 'og.jpg'}`;
  return [
    `<title data-seo>${esc(seo.title)}</title>`,
    `<meta data-seo name="description" content="${esc(seo.description)}">`,
    `<link data-seo rel="canonical" href="${url}">`,
    ...LANGUAGES.map(code => `<link data-seo rel="alternate" hreflang="${code}" href="${absolute(path, code)}">`),
    `<link data-seo rel="alternate" hreflang="x-default" href="${absolute(path, 'ru')}">`,
    '<meta data-seo property="og:type" content="website">',
    '<meta data-seo property="og:site_name" content="Afonin Web Studio">',
    `<meta data-seo property="og:locale" content="${LOCALES[lang]}">`,
    `<meta data-seo property="og:title" content="${esc(seo.title)}">`,
    `<meta data-seo property="og:description" content="${esc(seo.description)}">`,
    `<meta data-seo property="og:url" content="${url}">`,
    `<meta data-seo property="og:image" content="${image}">`,
    '<meta data-seo property="og:image:width" content="1200">',
    '<meta data-seo property="og:image:height" content="630">',
    '<meta data-seo name="twitter:card" content="summary_large_image">',
    `<script data-seo type="application/ld+json">${jsonLd(path, lang, seo)}</script>`
  ].join('\n  ');
}

export function syncHead(path, lang) {
  document.head.querySelectorAll('[data-seo]').forEach(node => node.remove());
  const holder = document.createElement('template');
  holder.innerHTML = headTags(path, lang);
  // Scripts parsed from a template stay inert, which is fine for JSON-LD data.
  document.head.append(holder.content);
}
