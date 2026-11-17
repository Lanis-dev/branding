# LANIS branding

A manually maintained library of existing LANIS branding and marketing text.

Open [index.html](index.html) to search assets, select a size or format, download files, and copy text. It works directly from disk, with no installation or build step.

- [Logos and icons](assets/icons/): nine colour variants in the available sizes, browser favicon and the existing monochrome vector resource.
- [Social images](assets/social/): the existing social preview and its size/format exports.
- [Product screenshots](assets/screenshots/): dashboard and colour-theme images.
- [Fonts](fonts/): existing font files and their licences.
- [Marketing text](copy/marketing.js): one entry per existing wording, organised by content type.
- [Colours](brand/colours.js): existing palette values.

[Download the whole library](https://github.com/Lanis-dev/branding/archive/refs/heads/main.zip).

Each asset is stored once. Shared web, Android and admin icons use the same files. Different sizes and formats are available together; copies of upstream repositories and redundant aliases are not kept here. The complete download is GitHub’s repository archive rather than another stored copy of the library.

To maintain the library, copy existing files into the appropriate asset folder and update [the catalog list](catalog/assets.js) by hand. Edit existing text in `copy/marketing.js` and colours in `brand/colours.js` directly. No import scripts, generators, synchronisation jobs or GitHub Actions workflows are needed.

Do not invent logos, layouts, slogans or translations. Extra icon sizes already present here were exported using the existing LANIS icon script without changing its artwork or palette. Raster icons are available up to their native 512 px. Product screenshots and some wording are historical; this library preserves the existing material rather than validating its claims. Font licences remain with the fonts.
