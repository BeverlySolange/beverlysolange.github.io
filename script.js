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

document.querySelector('.portrait-frame img').addEventListener('error', (event) => event.currentTarget.closest('picture, img').remove());
initialiseCvLanguages();

const gardenSvg = document.querySelector('.growing-garden svg');
const svgNamespace = 'http://www.w3.org/2000/svg';
const gardenColours = ['#5f8a71', '#738f4e', '#8d9d62', '#587f77', '#9a8057', '#728a83'];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function makeGardenPath(className, d, delay, fill) {
  const path = document.createElementNS(svgNamespace, 'path');
  path.setAttribute('class', className);
  path.setAttribute('d', d);
  path.style.setProperty('--delay', `${delay.toFixed(2)}s`);
  if (className.includes('garden-stem')) path.setAttribute('pathLength', '1');
  if (fill) path.setAttribute('fill', fill);
  return path;
}

function makeLeaf(x, y, angle, size, delay, colour) {
  const radians = (angle * Math.PI) / 180;
  const tipX = x + Math.cos(radians) * size;
  const tipY = y + Math.sin(radians) * size;
  const perpendicularX = Math.cos(radians + Math.PI / 2) * size * 0.28;
  const perpendicularY = Math.sin(radians + Math.PI / 2) * size * 0.28;
  const d = `M ${x} ${y} Q ${x + perpendicularX} ${y + perpendicularY} ${tipX} ${tipY} Q ${x - perpendicularX} ${y - perpendicularY} ${x} ${y}Z`;
  return makeGardenPath('garden-leaf', d, delay, colour || gardenColours[Math.floor(Math.random() * gardenColours.length)]);
}

function makeRoundLeaf(x, y, angle, size, delay, colour) {
  const radians = (angle * Math.PI) / 180;
  const tipX = x + Math.cos(radians) * size;
  const tipY = y + Math.sin(radians) * size;
  const widthX = Math.cos(radians + Math.PI / 2) * size * 0.5;
  const widthY = Math.sin(radians + Math.PI / 2) * size * 0.5;
  const d = `M ${x} ${y} C ${x + widthX} ${y + widthY}, ${tipX + widthX * 0.45} ${tipY + widthY * 0.18}, ${tipX} ${tipY} C ${tipX - widthX * 0.45} ${tipY - widthY * 0.18}, ${x - widthX} ${y - widthY}, ${x} ${y}Z`;
  return makeGardenPath('garden-leaf', d, delay, colour || gardenColours[Math.floor(Math.random() * gardenColours.length)]);
}

function makeNeedleLeaf(x, y, angle, size, delay, colour) {
  const radians = (angle * Math.PI) / 180;
  const tipX = x + Math.cos(radians) * size * 1.55;
  const tipY = y + Math.sin(radians) * size * 1.55;
  const widthX = Math.cos(radians + Math.PI / 2) * size * 0.09;
  const widthY = Math.sin(radians + Math.PI / 2) * size * 0.09;
  const d = `M ${x} ${y} Q ${x + widthX * 1.4} ${y + widthY * 1.4}, ${tipX} ${tipY} Q ${x - widthX * 1.4} ${y - widthY * 1.4}, ${x} ${y}Z`;
  return makeGardenPath('garden-leaf', d, delay, colour || gardenColours[Math.floor(Math.random() * gardenColours.length)]);
}

function makeFlower(x, y, delay) {
  const flower = document.createElementNS(svgNamespace, 'g');
  flower.setAttribute('class', 'garden-flower');
  const petalColour = ['#c98273', '#d7a24d', '#b8798b'][Math.floor(Math.random() * 3)];
  const petalSize = randomBetween(3.4, 5.2);
  for (let petal = 0; petal < 5; petal += 1) {
    const angle = (petal / 5) * Math.PI * 2;
    const shape = document.createElementNS(svgNamespace, 'ellipse');
    shape.setAttribute('cx', x + Math.cos(angle) * petalSize * 0.9);
    shape.setAttribute('cy', y + Math.sin(angle) * petalSize * 0.9);
    shape.setAttribute('rx', petalSize * 0.72);
    shape.setAttribute('ry', petalSize * 0.46);
    shape.setAttribute('fill', petalColour);
    shape.setAttribute('transform', `rotate(${(angle * 180) / Math.PI} ${x + Math.cos(angle) * petalSize * 0.9} ${y + Math.sin(angle) * petalSize * 0.9})`);
    flower.append(shape);
  }
  const centre = document.createElementNS(svgNamespace, 'circle');
  centre.setAttribute('cx', x);
  centre.setAttribute('cy', y);
  centre.setAttribute('r', petalSize * 0.44);
  centre.setAttribute('fill', '#855e2f');
  flower.append(centre);
  flower.style.setProperty('--delay', `${delay.toFixed(2)}s`);
  return flower;
}

function addGrass() {
  for (let blade = 0; blade < 178; blade += 1) {
    const x = randomBetween(0, 1180);
    const height = randomBetween(14, 42);
    const bend = randomBetween(-13, 13);
    const delay = randomBetween(0.1, 8.5);
    gardenSvg.append(makeGardenPath('garden-stem garden-stem--grass', `M ${x} 650 Q ${x + bend * 0.2} ${650 - height * 0.55}, ${x + bend} ${650 - height}`, delay));
  }
}

function addPlant(baseX, height, bend, startDelay) {
  const plant = document.createElementNS(svgNamespace, 'g');
  const kind = ['shrub', 'fern', 'flower', 'vine', 'reeds', 'broadleaf'][Math.floor(Math.random() * 6)];
  const plantColour = gardenColours[Math.floor(Math.random() * gardenColours.length)];
  plant.style.setProperty('--plant-stem', plantColour);
  const topX = baseX + bend;
  const topY = 650 - height;
  const stemPath = kind === 'vine'
    ? `M ${baseX} 650 C ${baseX + bend * 1.2} ${650 - height * 0.22}, ${baseX - bend * 0.8} ${650 - height * 0.58}, ${topX} ${topY}`
    : kind === 'reeds'
      ? `M ${baseX} 650 Q ${baseX + bend * 0.25} ${650 - height * 0.5}, ${topX} ${topY}`
      : `M ${baseX} 650 C ${baseX + bend * 0.15} ${650 - height * 0.3}, ${baseX + bend * 1.15} ${650 - height * 0.7}, ${topX} ${topY}`;
  plant.append(makeGardenPath('garden-stem', stemPath, startDelay));
  if (kind === 'reeds') {
    for (let reed = 0; reed < 3; reed += 1) {
      const offset = randomBetween(-18, 18);
      plant.append(makeGardenPath('garden-stem garden-stem--fine', `M ${baseX + offset} 650 Q ${baseX + offset + bend * 0.4} ${650 - height * 0.48}, ${topX + offset * 0.35} ${topY + randomBetween(8, 35)}`, startDelay + reed * 0.25));
    }
  }

  const branches = kind === 'fern' ? Math.floor(randomBetween(4, 6)) : kind === 'reeds' ? 2 : Math.floor(randomBetween(2, 4));
  for (let index = 0; index < branches; index += 1) {
    const progress = (index + 1) / (branches + 1);
    const branchX = baseX + bend * progress;
    const branchY = 650 - height * progress;
    const direction = (index % 2 ? 1 : -1) * randomBetween(0.7, 1.15);
    const endX = branchX + direction * randomBetween(38, 72);
    const endY = branchY - randomBetween(24, 58);
    const delay = startDelay + 0.8 + index * 0.34;
    plant.append(makeGardenPath('garden-stem garden-stem--fine', `M ${branchX} ${branchY} C ${branchX + direction * 12} ${branchY - 14}, ${endX - direction * 12} ${endY + 16}, ${endX} ${endY}`, delay));
    const leaves = kind === 'fern' ? 3 : kind === 'broadleaf' ? 4 : 2;
    for (let leaf = 0; leaf < leaves; leaf += 1) {
      const angle = direction > 0 ? -35 - leaf * 30 : -145 + leaf * 30;
      const leafSize = randomBetween(18, kind === 'fern' ? 31 : 42);
      const leafDelay = delay + 0.72 + leaf * 0.2;
      if (kind === 'broadleaf') plant.append(makeRoundLeaf(endX, endY, angle, leafSize, leafDelay, plantColour));
      else if (kind === 'fern' || kind === 'reeds') plant.append(makeNeedleLeaf(endX, endY, angle, leafSize, leafDelay, plantColour));
      else plant.append(makeLeaf(endX, endY, angle, leafSize, leafDelay, plantColour));
    }
    if (kind === 'flower' && index > 0) {
      plant.append(makeFlower(endX - 7, endY - 4, delay + 1.15));
      plant.append(makeFlower(endX + 7, endY - 7, delay + 1.28));
      plant.append(makeFlower(endX, endY - 13, delay + 1.41));
    }
  }

  plant.append(kind === 'broadleaf'
    ? makeRoundLeaf(topX, topY, -115, randomBetween(27, 43), startDelay + 1.8, plantColour)
    : kind === 'fern' || kind === 'reeds'
      ? makeNeedleLeaf(topX, topY, -115, randomBetween(27, 43), startDelay + 1.8, plantColour)
      : makeLeaf(topX, topY, -115, randomBetween(27, 43), startDelay + 1.8, plantColour));
  plant.append(kind === 'broadleaf'
    ? makeRoundLeaf(topX, topY, -52, randomBetween(25, 40), startDelay + 2.08, plantColour)
    : kind === 'fern' || kind === 'reeds'
      ? makeNeedleLeaf(topX, topY, -52, randomBetween(25, 40), startDelay + 2.08, plantColour)
      : makeLeaf(topX, topY, -52, randomBetween(25, 40), startDelay + 2.08, plantColour));
  if (kind === 'flower') plant.append(makeFlower(topX, topY - 8, startDelay + 2.36));
  gardenSvg.append(plant);
}

if (gardenSvg) {
  addGrass();
  for (let index = 0; index < 9; index += 1) {
    addPlant(randomBetween(22, 1158), randomBetween(115, 360), randomBetween(-60, 60), index * 0.92);
  }
}

document.querySelector('#year').textContent = new Date().getFullYear();
