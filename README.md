# LANIS branding

A manually maintained library of existing LANIS branding and marketing text.

The catalog is hosted at **[branding.lanis.arg-server.de](https://branding.lanis.arg-server.de)** on Cloudflare Workers. The GitHub deployment workflow publishes updates from `main`.

Open [index.html](index.html) to search assets, select a size or format, download files, and copy text. It works directly from disk, with no installation or build step.

- [Logos and icons](assets/icons/): nine colour variants, organised by file format, browser favicon and the existing monochrome vector resource.
- [Social images](assets/social/): the existing social preview and its size/format exports.
- [Product screenshots](assets/screenshots/): dashboard and colour-theme images.
- [Fonts](fonts/): existing font files and their licences.
- [Marketing text](copy/marketing.js): one entry per existing wording, organised by content type.
- [Colours](brand/colours.js): existing palette values.

Icon formats:

| Format | Folder | Resolutions |
| --- | --- | --- |
| Scalable SVG | [svg/](assets/icons/svg/) | Existing monochrome vector, any display size |
| PNG | [png/](assets/icons/png/) | 16, 24, 32, 48, 64, 128, 180, 192, 256, 512 px |
| Lossless WebP | [webp/](assets/icons/webp/) | Same ten resolutions |
| JPEG, quality 95 | [jpeg/](assets/icons/jpeg/) | Same ten resolutions; white background |
| Browser ICO | [ico/](assets/icons/ico/) | Existing multi-size favicon |
| Monochrome vector XML | [xml/](assets/icons/xml/) | Existing Android vector resource |

The SVG preserves the existing monochrome vector paths and colour. The shaded colour icons have raster masters only; no traced or redrawn colour SVGs have been added.

PNG, WebP and JPEG each contain colour folders such as `ruby/` and `cyan/`. PNG and WebP retain transparency. JPEG uses white where the original is transparent. Existing PNG pixels are unchanged, and no raster export is larger than its native source.

[Download the whole library](https://github.com/Lanis-dev/branding/archive/refs/heads/main.zip).

Each asset is stored once. Shared web, Android and admin icons use the same files. Different sizes and formats are available together; copies of upstream repositories and redundant aliases are not kept here. The complete download is GitHub’s repository archive rather than another stored copy of the library.

To maintain the library, copy existing files into the appropriate asset folder and update [the catalog list](catalog/assets.js) by hand. Edit existing text in `copy/marketing.js` and colours in `brand/colours.js` directly. There is no asset-generation or synchronisation pipeline. The deployment workflow only packages the existing library for hosting.

Do not invent logos, layouts, slogans or translations. Extra icon sizes already present here were exported using the existing LANIS icon script without changing its artwork or palette. Raster icons are available up to their native 512 px. Product screenshots and some wording are historical; this library preserves the existing material rather than validating its claims. Font licences remain with the fonts.

## Hosting

The Worker is named `lanis-branding`. Its Cloudflare custom domain is `branding.lanis.arg-server.de`. The workflow in `.github/workflows/deploy.yml` runs on pushes to `main` and can also be run manually. It packages only the catalog, assets, fonts, colours, marketing text and README, then deploys them with the Cloudflare CLI. Source icons and marketing copy are not regenerated.

GitHub requires a repository secret named `CLOUDFLARE_API_TOKEN` with Workers Scripts edit permission for the configured account. The custom domain is provisioned separately, so ongoing deployments do not need DNS edit permission. Local inspection and downloads still work directly from `index.html` with no installation.
