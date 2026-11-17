# LANIS existing brand collection

This repository collects **existing** LANIS artwork, fonts, product colours and marketing text. It does not define a new identity or write new campaigns.

Open [index.html](index.html) locally to search, download and copy the collected material. The catalog works offline. Every asset and text entry links to its original committed source.

| Material | Location |
| --- | --- |
| Complete collection with sources | [Brand kit ZIP](downloads/lanis-brand-kit.zip) |
| All existing favicon sizes, nine icon themes and default aliases | [Original app assets](assets/app-icons/original/) |
| Extra icon sizes from the existing UI generator | [Additional sizes](assets/app-icons/additional/) |
| Original SVG and PNG social preview, plus resized exports | [Social assets](assets/social/) |
| Existing Android launcher, adaptive and monochrome resources | [Android assets](assets/android/) |
| Existing admin portal logo | [Admin asset](assets/admin/) |
| Historical product images and resized exports | [Screenshots](assets/screenshots/) |
| Exact existing marketing text | [Copy index](copy/library.json), [German excerpts](copy/de/) |
| Existing bundled fonts | [Fonts](sources/lanis_ui/public/fonts/) |
| Product palette and CSS defaults | [Extracted tokens](brand/tokens.json) |
| File origins and transformations | [Manifest](assets/manifest.json), [source provenance](sources/provenance.json) |

Originals are copied byte-for-byte. Additional icon sizes are produced by the existing `lanis_ui/scripts/generate-themed-icons.mjs` with its original artwork, palettes and recolouring algorithm. The adapter only adds PNG resolutions and skips the unused legacy ICO export; existing ICOs are copied unchanged. Resized images never exceed their source resolution. No caps are extracted into new standalone logos, no new lockups or layouts are authored, and no copy is rewritten or translated.

```sh
npm ci
npm run build
npm run check
npm test
npm run test:browser  # requires local Chromium, or CHROME_PATH
npm run serve       # http://127.0.0.1:4173
```

No installation is needed to open the committed catalog or use the assets. Read the [source inventory](docs/BRAND.md), [maintenance instructions](docs/MAINTAINING.md) and [attribution](docs/RIGHTS.md).
