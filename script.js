const cards = [...document.querySelectorAll('.document-card')];
const viewer = document.querySelector('#pdf-viewer');
const viewerTitle = document.querySelector('#viewer-title');
const viewerDescription = document.querySelector('#viewer-description');
const viewerOpenLink = document.querySelector('#viewer-open-link');
const viewerFallbackLink = document.querySelector('#viewer-fallback-link');
const viewerLabel = document.querySelector('#viewer-label');

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

const requestedDocument = new URLSearchParams(location.hash.slice(1)).get('document');
const requestedCard = cards.find((card) => card.dataset.document === requestedDocument);
if (requestedCard) selectDocument(requestedCard, false);

document.querySelector('#year').textContent = new Date().getFullYear();
