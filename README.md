# Lanis · Brand library

Logos, app icons, product images and reusable marketing text for the Lanis team. Built from the current LANIS UI identity: ruby, the graduation cap, and Outfit. No image-generation tools or services are used.

**[Open the asset catalog](index.html)** after cloning, or browse the folders below on GitHub. The catalog runs offline and lets you search, choose a format and size, download an asset, or copy German and English text.

## Grab what you need

| Need | Location |
| --- | --- |
| Everything in one download | [Complete brand kit](downloads/lanis-brand-kit.zip) |
| Scalable logos and marks | [SVG masters](assets/logos/svg/) |
| PNG / lossless WebP marks, up to 4096 px | [Logo exports](assets/logos/) |
| Original shaded app icons in nine themes, 16–512 px | [App icons](assets/app-icons/) |
| Historical product screenshots, original and web sizes | [Product images](assets/screenshots/) |
| Social, story and feature graphic layouts | [HTML templates](templates/) and [rendered PNGs](assets/templates/) |
| Reusable German and English copy | [Copy library](copy/library.json), [German](copy/de/), [English](copy/en/) |
| Colours and fonts | [Tokens](brand/tokens.json), [CSS](brand/tokens.css), [Fonts](sources/fonts/) |
| Every file, dimension and checksum | [Asset manifest](assets/manifest.json) |

SVG is the resolution-independent master. PNG and lossless WebP preserve logo edges; screenshot WebP/JPEG exports have `web` (quality 80) and `high` (95) presets. Raster sources are never enlarged. JPEGs use an opaque paper background. Export sizes are pixels; 2× exports can be used at half their pixel dimensions for sharp screens.

## Work locally

```sh
git clone https://github.com/Lanis-dev/branding.git
cd branding
npm ci
npm run serve
# Open http://127.0.0.1:4173
```

No install is required to use the committed assets or open `index.html` directly. To edit and regenerate, run `npm run build`, `npm run check`, and `npm test`. HTML templates can be re-rendered with `npm run render:templates` using local Chromium.

## Before publishing

New lockups and marketing copy are proposed kit additions. Copy has explicit review status; imported screenshots are historical landing references. This kit does not assert public app-store availability, official Schulportal endorsement, performance guarantees, or blanket rights for third-party use.

Read the [brand guide](docs/BRAND.md), [maintenance notes](docs/MAINTAINING.md), [rights](docs/RIGHTS.md), and [source provenance](sources/provenance.json). Production and application repositories are not modified by this kit.
