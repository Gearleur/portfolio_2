/* global document, localStorage, location, navigator */
/*
 * Read before the first paint (journal n° 107): it picks, among the copies of the
 * Vitrine rendered at build time, the one in the visitor's language, as Vitrine.tsx
 * will (the language kept, else the browser's), and hides them when the address
 * opens a project page. A file rather than an inline script: the site's policy
 * allows no inline script. Keep the project addresses in step with Vitrine.tsx.
 */
(function () {
  var racine = document.documentElement;
  var gardee = null;
  try {
    gardee = localStorage.getItem('langue');
  } catch {
    /* storage blocked: the browser's language will do */
  }
  racine.lang = gardee === 'fr' || gardee === 'en' ? gardee : (navigator.language || '').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en';
  if (/^#(whiteboard-amdec|sncf-gpt)$/.test(location.hash)) racine.setAttribute('data-projet', '');
})();
