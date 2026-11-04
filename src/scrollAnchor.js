// Keeps the visitor on the same part of the page when the language changes, even though text lengths differ.
let saved = null;
const blocks = () => [...document.querySelectorAll('main > *, main > * > *')];

export function saveScrollAnchor() {
  const list = blocks();
  // The first block whose top is on screen: its position does not depend on the text above it.
  const visible = list.findIndex(el => el.getBoundingClientRect().top >= 0);
  const index = visible >= 0 ? visible : list.findIndex(el => el.getBoundingClientRect().bottom > 0);
  saved = index < 0 ? null : { index, top: list[index].getBoundingClientRect().top };
}

export function restoreScrollAnchor() {
  if (!saved) return;
  const el = blocks()[saved.index];
  if (el) window.scrollBy({ top: el.getBoundingClientRect().top - saved.top, behavior: 'instant' });
  saved = null;
}
