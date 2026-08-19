# beverlysolange.github.io

A lightweight GitHub Pages document hub for Beverly Felten.

## Updating a document

Replace the corresponding file in `documents/` with the updated PDF, keeping its
filename exactly the same. This preserves existing shared links and the website
preview:

- `beverly-felten-cv-en.pdf` (English)
- `beverly-felten-cv-de.pdf` (German)
- `beverly-felten-cv-es.pdf` (Spanish)
- `beverly-felten-bachelor-thesis.pdf`
- `beverly-felten-okupas-activist-hubs.pdf`
- `beverly-felten-letters-of-recommendation.pdf`

To add a phone link, replace the “Phone number coming soon” span in `index.html`
with an anchor such as `<a href="tel:+49123456789">+49 123 456 789</a>`.

## Adding the profile photo

Add a portrait at `assets/beverly-felten-profile.png` or
`assets/beverly-felten-profile.jpg`. PNG is preferred when the portrait needs
an opaque background. It will automatically appear in the landing-page portrait
frame. Until then, the page shows a subtle BF placeholder.

## CV language selection

The website detects browser language (and, as a regional fallback, the Berlin
and Madrid time zones) to choose a CV by default. Visitors can always change
the language with the CV language buttons. Missing CV files stay unavailable
until a PDF with the stable filename above is uploaded.
