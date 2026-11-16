import { createHash } from 'node:crypto';
export const digest = data => createHash('sha256').update(data).digest('hex');
export const escapeXml = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
export function rasterWidths(nativeWidth) { return [...new Set([480, 960, 1440, nativeWidth].filter(w => w <= nativeWidth))].sort((a,b) => a-b); }
export function svgDocument(width, height, title, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img"><title>${escapeXml(title)}</title>${content}</svg>\n`;
}
