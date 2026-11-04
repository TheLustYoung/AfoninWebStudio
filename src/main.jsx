import React, { useEffect } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { languageReady } from './i18n';
import '@fontsource/marck-script/400.css';
import '@fontsource/noto-sans-armenian/armenian-400.css';
import '@fontsource/noto-sans-armenian/armenian-500.css';
import '@fontsource/noto-sans-armenian/armenian-600.css';
import './styles.css';

function imageLoaded(img) {
  if (img.complete) return Promise.resolve();
  return new Promise(resolve => {
    img.addEventListener('load', resolve, { once: true });
    img.addEventListener('error', resolve, { once: true });
  });
}

let preloaderStarted = false;
function hidePreloader() {
  const el = document.getElementById('preloader');
  if (!el || preloaderStarted) return;
  preloaderStarted = true;
  // Long enough for the line animation to build up instead of flashing by.
  const minShown = new Promise(resolve => setTimeout(resolve, 600));
  // Never keep a slow connection stuck behind the loader.
  const maxWait = new Promise(resolve => setTimeout(resolve, 3000));
  void document.body.offsetHeight; // force layout so the page's fonts start loading before fonts.ready is read
  const images = [...document.querySelectorAll('#root img:not([loading="lazy"])')].map(imageLoaded);
  const assetsReady = Promise.all([...images, document.fonts.ready, languageReady]);
  Promise.race([Promise.all([assetsReady, minShown]), maxWait]).then(() => {
    el.classList.add('is-done');
    setTimeout(() => el.remove(), 600);
  });
}

function PreloaderGate() {
  useEffect(hidePreloader, []);
  // Fetched ahead of time: otherwise the first switch to Armenian swaps fonts in front of the visitor.
  useEffect(() => { for (const weight of [400, 500, 600]) document.fonts.load(`${weight} 16px "Noto Sans Armenian"`, 'Ա'); }, []);
  return null;
}

const root = document.getElementById('root');
const tree = <React.StrictMode><BrowserRouter><App /><PreloaderGate /></BrowserRouter></React.StrictMode>;
// Prerendered pages are hydrated; the dev server and the 404 page (any address) render from scratch.
if (root.hasChildNodes() && !root.hasAttribute('data-csr')) hydrateRoot(root, tree);
else createRoot(root).render(tree);
