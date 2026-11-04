// Writes real HTML for every page and language into dist, plus 404.html and sitemap.xml. Runs after both vite builds.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = join(process.cwd(), 'dist');
const ssr = join(process.cwd(), 'dist-ssr');
const { render, headTags, LANGUAGES, PAGES, localize, absolute } = await import(pathToFileURL(join(ssr, 'entry-server.js')).href);
const template = readFileSync(join(dist, 'index.html'), 'utf8');

const page = (lang, head, body, attrs = '') => template
  .replace('<html lang="ru">', `<html lang="${lang}">`)
  .replace('<!--head-->', head)
  .replace('<div id="root"></div>', `<div id="root"${attrs}>${body}</div>`);

function write(url, html) {
  const file = join(dist, url === '/' ? 'index.html' : `${url.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

for (const lang of LANGUAGES) {
  for (const path of PAGES) {
    const url = localize(path, lang);
    write(url, page(lang, headTags(path, lang), render(url)));
  }
}
writeFileSync(join(dist, '404.html'), page('ru', headTags('/__missing', 'ru'), render('/__missing'), ' data-csr'));

const urls = PAGES.map(path => LANGUAGES.map(lang => [
  '  <url>',
  `    <loc>${absolute(path, lang)}</loc>`,
  ...LANGUAGES.map(code => `    <xhtml:link rel="alternate" hreflang="${code}" href="${absolute(path, code)}"/>`),
  `    <xhtml:link rel="alternate" hreflang="x-default" href="${absolute(path, 'ru')}"/>`,
  '  </url>'
].join('\n')).join('\n')).join('\n');
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`);

rmSync(ssr, { recursive: true, force: true });
console.log(`prerendered ${LANGUAGES.length * PAGES.length} pages, 404.html, sitemap.xml`);
