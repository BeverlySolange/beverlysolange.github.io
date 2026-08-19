const cards = [...document.querySelectorAll('.document-card')];
const viewer = document.querySelector('#pdf-viewer');
const viewerTitle = document.querySelector('#viewer-title');
const viewerDescription = document.querySelector('#viewer-description');
const viewerOpenLink = document.querySelector('#viewer-open-link');
const viewerFallbackLink = document.querySelector('#viewer-fallback-link');
const viewerLabel = document.querySelector('#viewer-label');
const cvCard = document.querySelector('[data-document="cv"]');
const cvCardDescription = document.querySelector('#cv-card-description');
const cvCardOpenLink = document.querySelector('#cv-card-open-link');
const cvLanguageButtons = [...document.querySelectorAll('[data-cv-language]')];

const cvLanguages = {
  en: { file: 'documents/beverly-felten-cv-en.pdf', name: 'English' },
  de: { file: 'documents/beverly-felten-cv-de.pdf', name: 'German' },
  es: { file: 'documents/beverly-felten-cv-es.pdf', name: 'Spanish' },
};

function selectDocument(card, updateHash = true) {
  cards.forEach((item) => item.classList.toggle('is-active', item === card));
  const file = card.dataset.file;
  const type = card.querySelector('.document-type').textContent;
  viewer.src = `${file}#view=FitH`;
  viewer.title = `${card.dataset.title} PDF preview`;
  viewerTitle.textContent = card.dataset.title;
  viewerDescription.textContent = card.dataset.description;
  viewerLabel.textContent = type;
  viewerOpenLink.href = file;
  viewerFallbackLink.href = file;

  if (updateHash) history.replaceState(null, '', `#document=${card.dataset.document}`);
}

cards.forEach((card) => {
  card.querySelector('.preview-button').addEventListener('click', () => {
    selectDocument(card);
    document.querySelector('.viewer-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  card.addEventListener('click', (event) => {
    if (event.target.closest('a, button')) return;
    selectDocument(card);
  });
});

function preferredCvLanguage() {
  const browserLanguages = navigator.languages || [navigator.language];
  const locale = browserLanguages.join(',').toLowerCase();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (locale.includes('de') || timeZone === 'Europe/Berlin') return 'de';
  if (locale.includes('es') || timeZone === 'Europe/Madrid') return 'es';
  return 'en';
}

function setCvLanguage(language, updateHash = true) {
  const cv = cvLanguages[language];
  if (!cv || cvCard.dataset.available !== language && !cvCard.dataset.available?.includes(language)) return;
  cvCard.dataset.file = cv.file;
  cvCard.dataset.description = `Curriculum vitae · ${cv.name} · 1 page`;
  cvCardDescription.textContent = cvCard.dataset.description;
  cvCardOpenLink.href = cv.file;
  cvLanguageButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.cvLanguage === language)));
  selectDocument(cvCard, updateHash);
}

async function initialiseCvLanguages() {
  const checks = await Promise.all(Object.entries(cvLanguages).map(async ([language, cv]) => {
    try { return (await fetch(cv.file, { method: 'HEAD' })).ok ? language : null; } catch { return null; }
  }));
  const available = checks.filter(Boolean);
  cvCard.dataset.available = available.join(',');
  cvLanguageButtons.forEach((button) => { button.disabled = !available.includes(button.dataset.cvLanguage); });
  const requested = new URLSearchParams(location.hash.slice(1)).get('cv');
  const language = available.includes(requested) ? requested : available.includes(preferredCvLanguage()) ? preferredCvLanguage() : available[0];
  if (language) setCvLanguage(language, false);
}

cvLanguageButtons.forEach((button) => button.addEventListener('click', () => setCvLanguage(button.dataset.cvLanguage)));

const requestedDocument = new URLSearchParams(location.hash.slice(1)).get('document');
const requestedCard = cards.find((card) => card.dataset.document === requestedDocument);
if (requestedCard && requestedCard !== cvCard) selectDocument(requestedCard, false);

document.querySelector('.portrait-frame img').addEventListener('error', (event) => event.currentTarget.remove());
initialiseCvLanguages();

document.querySelector('#year').textContent = new Date().getFullYear();
