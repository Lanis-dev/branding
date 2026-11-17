# Maintaining the collection

## Scope

Collect existing material. Do not design new brand assets, extract symbols into new logos, invent monochrome variants, compose lockups, create campaign layouts, rewrite product copy or add translations. Missing source material stays missing until the owner supplies it or points to an existing source.

Image-generation tools and services remain prohibited. The owner explicitly permits running or extending existing asset scripts to export variants of the existing artwork. Resizing and encoding existing raster artwork is also allowed.

## Sources

Keep immutable source snapshots under `sources/`. Each source must have its repository, commit, upstream path and SHA-256 in `sources/provenance.json`. Import from committed upstream versions, not another checkout's uncommitted work. Source checkouts and production are never modified by this build.

The collection includes `lanis_ui` main, its separate Android branch, and `lanis_admin` main. Pin each independently. Preserve original font licences and source scripts. Review images for personal data before adding them. Refer to the backend as lanis_api.

## Build

Run `npm ci` and `npm run build`. The build verifies source hashes and copy excerpts first, replaces generated `assets/`, downloads and Markdown excerpts, and refreshes the catalog index and extracted tokens. Do not hand-edit generated outputs.

Original assets are copied unchanged. For additional icon sizes, the build runs the original `generate-themed-icons.mjs` in a disposable directory inside this repository. `extendExistingIconGenerator` in `scripts/lib.mjs` adds five resolution entries and removes the unused legacy `to-ico` import/export. It does not change the palette, algorithm, source artwork or theme list. The adapter fails when its expected source structure changes. Before accepting any extra size, the build compares every existing theme/size output against the original committed pixels.

The temporary output is removed afterward. Existing SVG artwork is copied without editing. Image size/quality exports only resize and encode existing raster images. No icon is enlarged above 512 px. ZIP timestamps are fixed for reproducibility.

## Text

Every excerpt must exactly equal the indexed slice of its source file. Keep its source path, offsets, line and immutable URL. The build and checks reject altered text, made-up entries, translations and missing provenance. To update text, import the new committed source and update the excerpt coordinates. Preserve historical claims as source material; do not silently edit them.

## Verification

Run `npm run check`, `npm test` and `npm run test:browser`. Chromium is required only for the browser check; set `CHROME_PATH` if needed. The catalog works from `index.html` directly, or `npm run serve` binds to localhost. Browser verification checks downloads, exact source links, filters, clipboard and mobile layouts. `verification/` screenshots are ignored review artifacts, not branding exports.

CI validates the committed collection before rebuilding and checks the rebuilt outputs on ARM64 and x64. ARM64 is the canonical export environment and must regenerate byte-identical files. JPEG encoding can differ slightly across CPU architectures; the x64 job validates provenance, original pixels, excerpt equality and archive integrity without requiring the resized JPEG bytes to equal the ARM64 exports. Keep generated outputs and source changes in the same commit. Old invented assets and bundles must be removed when correcting the collection; checking only manifest entries is insufficient, so validation also checks the complete asset tree and archive contents.
