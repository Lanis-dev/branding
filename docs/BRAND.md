# Existing material inventory

This is a collection, not a new brand guide. It adds no rules for wordmarks, clear space, minimum sizes, typography combinations or new campaigns.

## Artwork

- **Web app icons:** every committed size, all nine palettes, default aliases, favicon ICO and PWA manifests from `lanis_ui/public/`. The upstream icon generator, original raster sources and palette file are preserved under `sources/lanis_ui/scripts/`.
- **Additional icon sizes:** 24, 48, 64, 128 and 256 px PNGs from the same existing generator. Colours, cap geometry and shading are unchanged. Sources are 512 px; no larger “high resolution” icon is invented.
- **Social preview:** the existing complete `opengraph.svg` and `opengraph.png`. The SVG retains its original text and Lato font reference. The PNG preserves the existing rendering. No standalone flat logo or wordmark is extracted from it.
- **Android:** committed launcher PNGs, adaptive-icon XML, monochrome notification glyph and supporting resources from the separate `feat/android-app` branch. Its original generator is also included as reference. XML resources retain their existing Android resource references; use the resource folders together.
- **Admin portal:** the existing `lanis_admin/public/lanis-logo.png`.
- **Product images:** existing historical dashboard and theme images. The navigation image is omitted because it contains personal names. Other landing screenshots have not been reviewed for this collection; they are not silently substituted or recreated.

Every original file is tied to a repository, commit, path and SHA-256 in `sources/provenance.json`. The asset manifest records whether a file is an exact copy, an output of the existing icon script, or a resized/encoded copy of an existing raster image.

## Text

`copy/library.json` contains exact source excerpts from the current landing page, the legacy landing page, HTML metadata and the social-preview SVG. Each has the local source file, character offsets, line number and immutable upstream link. Only German text was collected from these sources; no translations, store listing or new campaign copy have been created.

Existing claims such as speed figures or colour counts are preserved as they appear in the source. Their inclusion does not independently validate them. Legacy wording is labelled as historical. Changes to the source should be collected again rather than rewritten here.

## Colours and fonts

Palette values come directly from `scripts/icon-palettes.mjs`; the unmodified `:root` defaults come from the UI stylesheet. The existing UI font configuration and complete bundled font directory are retained with their original licences. This collection assigns no new display, editorial or logo typography rules.
