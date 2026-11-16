import { readFile, writeFile, mkdir, rm, readdir, stat, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import * as fontkit from 'fontkit';
import { zipSync } from 'fflate';
import { digest, rasterWidths, svgDocument } from './lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const tokens = JSON.parse(await readFile('brand/tokens.json'));
const copy = JSON.parse(await readFile('copy/library.json'));
const originalSvg = await readFile('sources/upstream/opengraph.svg', 'utf8');
const cap = [...originalSvg.matchAll(/<path d="([^"]+)"/g)].map(m => `<path d="${m[1]}"/>`).join('');
if (!cap) throw new Error('Upstream SVG must contain cap paths');
// TrueType source is necessary: fontkit cannot vary transformed WOFF2 outlines reliably.
const font = fontkit.openSync('sources/fonts/outfit-variable.ttf').getVariation({ wght: 700 });
function outline(text, x, baseline, size, fill) {
  const run = font.layout(text); let cursor = 0;
  return `<g fill="${fill}" transform="translate(${x} ${baseline}) scale(${size/font.unitsPerEm} ${-size/font.unitsPerEm})">${run.glyphs.map((glyph,i) => {
    const pos=run.positions[i]; const result=`<path transform="translate(${cursor+pos.xOffset} ${pos.yOffset})" d="${glyph.path.toSVG()}"/>`; cursor+=pos.xAdvance; return result;
  }).join('')}</g>`;
}
const records=[];
async function save(file, data, meta) {
  await mkdir(path.dirname(file),{recursive:true}); await writeFile(file,data);
  records.push({path:file,bytes:Buffer.byteLength(data),sha256:digest(data),...meta});
}
for(const dir of ['assets/logos','assets/app-icons','assets/screenshots','downloads','copy/de','copy/en']) await rm(dir,{recursive:true,force:true});
for(const kind of ['mark','lockup']) {
  const variants=kind==='mark'?{...tokens.themes,ink:tokens.colors.ink,white:'#ffffff',black:'#000000'}:{ruby:tokens.colors.ruby,ink:tokens.colors.ink,white:'#ffffff',black:'#000000'};
  for(const [variant,color] of Object.entries(variants)) {
    const width=kind==='mark'?1000:1400; const height=kind==='mark'?1000:400;
    const content=kind==='mark'?`<g fill="${color}">${cap}</g>`:`<rect x="0" y="40" width="320" height="320" rx="76" fill="${color}"/><g transform="translate(0 40) scale(.32)" fill="${variant==='white'?tokens.colors.ink:tokens.colors.rubyInk}">${cap}</g>${outline('Lanis',390,306,320,variant==='ruby'?tokens.colors.ink:color)}`;
    const svg=svgDocument(width,height,`Lanis ${kind} · ${variant}`,content);
    const base=`assets/logos`; const stem=`lanis-${kind}-${variant}`;
    const meta={id:stem,name:`${kind==='mark'?'Flat cap':'Horizontal lockup'} · ${variant}`,category:'logos',variant,kind,alt:`Lanis ${variant} ${kind}`,status:kind==='lockup'?'proposed':'source-derived',source:'sources/upstream/opengraph.svg'};
    await save(`${base}/svg/${stem}.svg`,svg,{...meta,format:'svg',width,height,quality:'vector'});
    for(const size of tokens.sizes[kind]) {
      const h=Math.round(size*height/width);
      for(const format of ['png','webp']) {
        const pipe=sharp(Buffer.from(svg),{density:Math.max(72,size/width*72)}).resize(size,h);
        const data=await (format==='png'?pipe.png({compressionLevel:9}):pipe.webp({lossless:true})).toBuffer();
        await save(`${base}/${format}/${stem}-${size}.${format}`,data,{...meta,format,width:size,height:h,quality:'lossless'});
      }
    }
  }
}
for(const variant of Object.keys(tokens.themes)) {
 const source=variant==='ruby'?'sources/upstream/android-chrome-512x512.png':`sources/upstream/app-icon-${variant}-512.png`;
 const stem=variant==='ruby'?'lanis-app-icon':`lanis-app-icon-${variant}`;
 for(const size of tokens.sizes.appIcon) {
  for(const format of ['png','webp']) {
    const pipe=sharp(source).resize(size,size,{withoutEnlargement:true});
    const data=await (format==='png'?pipe.png({compressionLevel:9}):pipe.webp({lossless:true})).toBuffer();
    await save(`assets/app-icons/${stem}-${size}.${format}`,data,{id:stem,name:`Original shaded app icon · ${variant}`,category:'app-icons',kind:'app-icon',variant,format,width:size,height:size,quality:'lossless',status:'source',source,alt:`Lanis ${variant} app icon with shaded graduation cap`});
  }
 }
}
await save('assets/app-icons/favicon.ico',await readFile('sources/upstream/favicon.ico'),{id:'favicon',name:'Browser favicon',category:'app-icons',format:'ico',quality:'original',status:'source',source:'sources/upstream/favicon.ico',alt:'Lanis browser favicon'});
for(const name of ['lanis-dashboard','themes']) {
  const src=`sources/upstream/${name}.png`; const m=await sharp(src).metadata();
  for(const width of rasterWidths(m.width)) {
    const height=Math.round(m.height*width/m.width);
    const common={id:`screenshot-${name}`,name:`${name.replaceAll('-',' ')} · historical`,category:'screenshots',kind:'screenshot',status:'historical',source:src,width,height,alt:`Historical Lanis landing image: ${name.replaceAll('-',' ')}`};
    await save(`assets/screenshots/${name}-${width}.png`,await sharp(src).resize(width).png({compressionLevel:9}).toBuffer(),{...common,format:'png',quality:'lossless'});
    for(const format of ['webp','jpeg']) for(const [preset,quality] of Object.entries(tokens.quality[format])) {
      let pipe=sharp(src).resize(width);
      const data=await (format==='webp'?pipe.webp({quality}):pipe.flatten({background:tokens.colors.paper}).jpeg({quality,mozjpeg:true})).toBuffer();
      await save(`assets/screenshots/${name}-${width}-${preset}.${format==='jpeg'?'jpg':format}`,data,{...common,format,quality:preset});
    }
  }
}
// Rendering HTML templates is a separate, explicit browser step. Index committed screenshots if present.
try {
  for(const file of (await readdir('assets/templates')).filter(f=>f.endsWith('.png')).sort()) {
    const p=`assets/templates/${file}`; const data=await readFile(p); const m=await sharp(data).metadata();
    records.push({path:p,bytes:data.length,sha256:digest(data),id:`template-${file.slice(0,-4)}`,name:`${file.slice(0,-4).replaceAll('-',' ')} · draft`,category:'templates',format:'png',quality:'lossless',width:m.width,height:m.height,status:'draft',source:`templates/${file.slice(0,-4)}.html`,alt:`Lanis ${file.slice(0,-4).replaceAll('-',' ')} marketing layout`});
  }
} catch(e) { if(e.code!=='ENOENT') throw e; }
for(const locale of copy.locales) for(const category of [...new Set(copy.items.map(i=>i.category))]) {
  const slug=category.toLowerCase().replaceAll(' ','-');
  await mkdir(`copy/${locale}`,{recursive:true});
  await writeFile(`copy/${locale}/${slug}.md`,`# ${category} · ${locale}\n\n${copy.items.filter(i=>i.category===category).map(i=>`## ${i.id}\n\nStatus: ${i.status}${i.reviewNote?` — ${i.reviewNote}`:''}\n\n${i.text[locale]}\n`).join('\n')}`);
}
await writeFile('brand/tokens.css',`:root {\n${Object.entries(tokens.colors).map(([key,value])=>`  --lanis-${key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}: ${value};`).join('\n')}\n  --lanis-font-body: 'Outfit', system-ui, sans-serif;\n  --lanis-font-display: 'Syne', sans-serif;\n  --lanis-font-utility: 'JetBrains Mono', monospace;\n}\n`);
records.sort((a,b)=>a.path.localeCompare(b.path,'en'));
const manifest={schemaVersion:1,sourceCommit:tokens.sourceCommit,assets:records};
await writeFile('assets/manifest.json',JSON.stringify(manifest,null,2)+'\n');
await writeFile('catalog/data.js',`// Generated by npm run build. Supports file:// without fetch.\nwindow.LANIS_BRAND = ${JSON.stringify({tokens,copy,assets:records})};\n`);
async function files(dir) {
  const out=[]; for(const f of (await readdir(dir)).sort()) {const p=`${dir}/${f}`; if((await stat(p)).isDirectory())out.push(...await files(p));else out.push(p);} return out;
}
async function bundle(name, paths) {
  const entries={}; for(const p of [...new Set(paths)].sort()) entries[p]=[new Uint8Array(await readFile(p)),{mtime:new Date(2026, 0, 1, 0, 0, 0)}];
  await mkdir('downloads',{recursive:true}); await writeFile(`downloads/${name}.zip`,zipSync(entries,{level:6}));
}
const common=['README.md','docs/BRAND.md','docs/RIGHTS.md','sources/provenance.json'];
await bundle('lanis-logos',[...common,...records.filter(a=>a.category==='logos'||a.category==='app-icons').map(a=>a.path)]);
await bundle('lanis-copy',[...common,...await files('copy')]);
await bundle('lanis-brand-kit',[...common,'docs/MAINTAINING.md','assets/manifest.json',...records.map(a=>a.path),...await files('copy'),...await files('brand'),'index.html','package.json','package-lock.json',...await files('catalog'),...await files('sources'),...await files('docs'),...await files('scripts'),...await files('templates')]);
console.log(`Exported ${records.length} indexed assets and ${copy.items.length} copy entries in ${copy.locales.length} languages.`);
