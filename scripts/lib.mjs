import { createHash } from 'node:crypto';
export const digest = data => createHash('sha256').update(data).digest('hex');
export function rasterWidths(nativeWidth) { return [...new Set([480, 960, 1440, nativeWidth].filter(w => w <= nativeWidth))].sort((a,b) => a-b); }
export function extendExistingIconGenerator(source) {
  // Keep the upstream recolouring algorithm, immutable artwork, palettes and theme list intact.
  // Additional PNG resolutions are the only artwork change. Existing ICOs are copied verbatim,
  // so omit the legacy to-ico dependency and its final ICO-writing step in this temporary runner.
  const sizes="const iconSizes = {";
  const icoStart=source.indexOf('const ico = await toIco(');
  const icoEnd=source.indexOf("await sharp(join(defaultDirectory",icoStart);
  if(!source.includes(sizes)||icoStart<0||icoEnd<0)throw new Error('Upstream script changed; review the size adapter.');
  return (source.slice(0,icoStart)+source.slice(icoEnd))
    .replace("import toIco from 'to-ico';\n",'')
    .replace(sizes,`${sizes}\n  'icon-24.png': 24,\n  'icon-48.png': 48,\n  'icon-64.png': 64,\n  'icon-128.png': 128,\n  'icon-256.png': 256,`);
}
export function verifyCopyExcerpt(item, source) {
  const text=source.slice(item.source.start,item.source.end);
  if(item.text.de!==text || source.slice(0,item.source.start).split('\n').length!==item.source.line)
    throw new Error(`Copy is not a verbatim source excerpt: ${item.id}`);
  return true;
}
