# Maintaining the library

## Setup and everyday use

Use Node 22 or newer. Run `npm ci`, then `npm run build`. Open `index.html` directly for the offline catalog, or use `npm run serve` for localhost-only access. The catalog has no remote fonts, analytics, or CDN dependencies. Build outputs are committed so downloads work immediately after cloning.

`npm run build` reads the imported sources, tokens and copy, then replaces the generated logo, app-icon and screenshot folders in `assets/`, plus `downloads/` and `copy/de/` / `copy/en/`. Existing `assets/templates/` screenshots are retained and indexed. It writes `catalog/data.js`, `assets/manifest.json` and token CSS. Do not hand-edit these generated outputs. It does not contact the source repository or render new imagery.

## Changing assets

1. Obtain an existing source asset from the owner or the UI repository. Inspect screenshots for personal information before importing.
2. Save immutable inputs in `sources/`; record repository, exact commit, upstream path and SHA-256 in `sources/provenance.json`. Do not rely on a floating branch as provenance.
3. Adjust token values or export presets in `scripts/build.mjs`. Preserve original app icons, keep JPEG backgrounds explicit, and never upscale screenshots or raster source icons.
4. Run the build, check and tests. Review a rendered catalog at desktop and mobile sizes. Commit sources and all affected outputs together.

The primary upstream is `joan-code6/lanis_ui`; the org branding repo is `Lanis-dev/branding`. Sources are pinned to the commit recorded in `brand/tokens.json`. The imported screenshots are historical landing assets and are visibly labelled as such. Fresh product screenshots should replace these only after account data is removed.

## Copy

Edit `copy/library.json`, keeping stable IDs. German is primary. New wording and translations remain drafts until the owner reviews them; set status to `approved` only after that review. Record evidence for factual changes in the review note. The build writes one Markdown file per category and language for quick reuse. Avoid live numbers and platform claims in evergreen assets.

## HTML marketing templates

`templates/` contains real HTML/CSS layouts with existing brand assets. Edit the code and render it with `npm run render:templates`. This requires a local Chromium installation; set `CHROME_PATH` if it is not at `/usr/bin/chromium`. PNG screenshots are written to `assets/templates/`. No image-generation service is used. Run `npm run build` afterward to index them and rebuild bundles.

`npm run test:browser` checks the offline catalog in Chromium, including mobile overflow, image loads, filter results, download selection and clipboard actions. It saves local review screenshots in the ignored `verification/` folder.

## Automation

CI installs locked dependencies, runs the build, checks every manifest entry and checksum, runs the test suite, and fails if regenerated tracked files differ. Output archives use fixed timestamps and sorted entries for reproducibility. Template rendering is explicit, since browser/font rendering may differ across platforms. Local build and validation do not require credentials or LANIS API access.
