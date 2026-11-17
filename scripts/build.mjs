import { readFile, writeFile, mkdir, rm, readdir, stat, mkdtemp, copyFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { zipSync } from 'fflate';
import { digest, rasterWidths, extendExistingIconGenerator, verifyCopyExcerpt } from './lib.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');process.chdir(root);
const provenance=JSON.parse(await readFile('sources/provenance.json'));
const byPath=new Map(provenance.map(s=>[s.path,s]));
for(const source of provenance)if(digest(await readFile(source.path))!==source.sha256)throw new Error(`Source changed: ${source.path}`);
const copy=JSON.parse(await readFile('copy/library.json'));
for(const item of copy.items)verifyCopyExcerpt(item,await readFile(item.source.path,'utf8'));
const ui='sources/lanis_ui';
const {themes}=await import(pathToFileURL(path.resolve(`${ui}/scripts/icon-palettes.mjs`)).href);
const css=await readFile(`${ui}/src/index.css`,'utf8');
const defaults=css.match(/:root\s*\{([^}]+)\}/)?.[1];
const colors=Object.fromEntries(Object.entries(themes).map(([name,t])=>[name,t.themeColor]));
const tokens={name:'Lanis',sourceCommit:byPath.get(`${ui}/public/opengraph.svg`).commit,colors,themes:colors,typography:{body:'Outfit',utility:'JetBrains Mono'},sources:{colors:`${ui}/scripts/icon-palettes.mjs`,typography:`${ui}/tailwind.config.js`},defaultCssVariables:defaults.trim(),policy:'Extracted existing product values. No new palettes or brand rules.'};
await writeFile('brand/tokens.json',JSON.stringify(tokens,null,2)+'\n');
await writeFile('brand/tokens.css',`/* Existing UI defaults; source: ${ui}/src/index.css */\n:root {\n${defaults.trim()}\n}\n`);
await rm('assets',{recursive:true,force:true});await rm('downloads',{recursive:true,force:true});await rm('copy/de',{recursive:true,force:true});
const records=[];
async function save(file,data,meta){await mkdir(path.dirname(file),{recursive:true});await writeFile(file,data);records.push({path:file,bytes:data.length,sha256:digest(data),...meta});}
async function original(source,destination,meta){
 const data=await readFile(source);const format=path.extname(source).slice(1);const dimensions=['png','webp','svg'].includes(format)?await sharp(data).metadata():{};
 await save(destination,data,{...meta,format,width:dimensions.width,height:dimensions.height,quality:'original',status:meta.status||'original',source,sourceUrl:byPath.get(source).url,transformation:{type:'exact-copy'}});
}
// Preserve every existing favicon size, PWA manifest and default alias byte-for-byte.
for(const source of provenance.filter(s=>s.path.startsWith(`${ui}/public/favicon/`))){
 const tail=source.upstreamPath.slice('public/favicon/'.length);const variant=tail.startsWith('themes/')?tail.split('/')[1]:'default';
 const isIco=tail.endsWith('.ico');
 await original(source.path,`assets/app-icons/original/${tail}`,{id:isIco?'favicon':`app-icon-${variant}`,name:isIco?'Existing browser favicon':`Existing app icon · ${variant}`,category:'app-icons',variant,alt:`Existing Lanis ${variant} app icon`});
}
await original(`${ui}/public/icon.webp`,'assets/app-icons/original/icon.webp',{id:'app-icon-default',name:'Existing app icon · default',category:'app-icons',variant:'default',alt:'Existing Lanis default app icon'});
// Run the actual upstream generator with extra size entries, in an isolated temporary directory.
const workspace=await mkdtemp(path.join(root,'.icon-export-'));
try{
 for(const file of ['icon-source.png','icon-source-cyan.png']){await mkdir(`${workspace}/scripts/assets`,{recursive:true});await copyFile(`${ui}/scripts/assets/${file}`,`${workspace}/scripts/assets/${file}`);}
 await copyFile(`${ui}/scripts/icon-palettes.mjs`,`${workspace}/scripts/icon-palettes.mjs`);
 const script=`${ui}/scripts/generate-themed-icons.mjs`;
 await writeFile(`${workspace}/scripts/generate-themed-icons.mjs`,extendExistingIconGenerator(await readFile(script,'utf8')));
 await mkdir(`${workspace}/public/favicon`,{recursive:true});
 const run=spawnSync(process.execPath,[`${workspace}/scripts/generate-themed-icons.mjs`],{cwd:workspace,encoding:'utf8'});if(run.status!==0)throw new Error(run.stderr||'Upstream icon generator failed');
 for(const variant of Object.keys(themes)){
  // Existing resolutions must still match the committed upstream artwork pixel-for-pixel.
  for(const file of ['favicon-16x16.png','favicon-32x32.png','apple-touch-icon.png','android-chrome-192x192.png','android-chrome-512x512.png']){
   const upstream=`${ui}/public/favicon/themes/${variant}/${file}`;
   const generated=await sharp(`${workspace}/public/favicon/themes/${variant}/${file}`).raw().toBuffer();
   if(!generated.equals(await sharp(upstream).raw().toBuffer()))throw new Error(`Generator no longer matches existing ${variant}/${file}`);
  }
  const artwork=`${ui}/public/favicon/themes/${variant}/android-chrome-512x512.png`;
  for(const size of [24,48,64,128,256]){
   const data=await readFile(`${workspace}/public/favicon/themes/${variant}/icon-${size}.png`);
   await save(`assets/app-icons/additional/${variant}/icon-${size}.png`,data,{id:`app-icon-${variant}`,name:`Existing app icon · ${variant}`,category:'app-icons',variant,format:'png',width:size,height:size,quality:'lossless',status:'existing-script-size-export',source:artwork,sourceUrl:byPath.get(artwork).url,alt:`Existing Lanis ${variant} app icon`,transformation:{type:'upstream-script',script,adapter:'scripts/lib.mjs#extendExistingIconGenerator',size,inputs:[`${ui}/scripts/icon-palettes.mjs`,`${ui}/scripts/assets/icon-source.png`,`${ui}/scripts/assets/icon-source-cyan.png`]}});
  }
 }
}finally{await rm(workspace,{recursive:true,force:true});}
// Original social artwork is kept whole; no extracted caps, new lockups or new layouts.
for(const format of ['svg','png'])await original(`${ui}/public/opengraph.${format}`,`assets/social/opengraph.${format}`,{id:'opengraph',name:'Existing social preview',category:'social',alt:'Existing Lanis Open Graph artwork'});
await original('sources/lanis_admin/public/lanis-logo.png','assets/admin/lanis-logo.png',{id:'admin-logo',name:'Existing admin portal logo',category:'admin',alt:'Existing Lanis admin portal logo'});
for(const source of provenance.filter(s=>s.path.startsWith('sources/lanis_ui_android/android/'))){
 const filename=path.basename(source.path);const theme=filename.match(/^ic_lanis_(\w+)\.png$/)?.[1];
 await original(source.path,`assets/android/${source.upstreamPath.slice('android/app/src/main/res/'.length)}`,{id:theme?`android-${theme}`:'android-resources',name:theme?`Existing Android launcher · ${theme}`:'Existing Android vector and adaptive resources',category:'android',variant:theme,alt:theme?`Existing Lanis Android ${theme} launcher icon`:'Existing Android resource'});
}
// Resize/encode existing raster artwork only. No new geometry, colours or text.
for(const [name,category] of [['lanis-dashboard','screenshots'],['themes','screenshots'],['opengraph','social']]){
 const src=`${ui}/public/${category==='screenshots'?'landing/':''}${name}.png`;const metadata=await sharp(src).metadata();
 if(category==='screenshots')await original(src,`assets/screenshots/${name}-original.png`,{id:`screenshot-${name}`,name:`${name} · historical`,category,alt:`Existing historical ${name} screenshot`,status:'historical-original'});
 for(const width of rasterWidths(metadata.width))for(const format of ['webp','jpeg'])for(const [qualityName,quality] of [['web',80],['high',95]]){
  const pipe=sharp(src).resize(width,null,{withoutEnlargement:true});const data=await (format==='webp'?pipe.webp({quality}):pipe.jpeg({quality,mozjpeg:true})).toBuffer();
  await save(`assets/${category}/${name}-${width}-${qualityName}.${format==='jpeg'?'jpg':format}`,data,{id:category==='social'?'opengraph':`screenshot-${name}`,name:category==='social'?'Existing social preview':`${name} · historical`,category,format,width,height:Math.round(metadata.height*width/metadata.width),quality:qualityName,status:'existing-image-export',source:src,sourceUrl:byPath.get(src).url,alt:`Existing Lanis ${name} artwork`,transformation:{type:'resize-encode',width,quality,format}});
 }
}
for(const category of [...new Set(copy.items.map(i=>i.category))]){
 const file=`copy/de/${category.toLowerCase().replaceAll(' ','-')}.md`;await mkdir('copy/de',{recursive:true});
 await writeFile(file,`# ${category} · de\n\nVerbatim source excerpts. Existing claims are preserved, not revalidated.\n\n${copy.items.filter(i=>i.category===category).map(i=>`## ${i.id}\n\n${i.text.de}\n\nSource: [${i.source.upstreamPath}:${i.source.line}](${i.source.url}) · ${i.status}\n`).join('\n')}`);
}
records.sort((a,b)=>a.path.localeCompare(b.path,'en'));await writeFile('assets/manifest.json',JSON.stringify({schemaVersion:2,sourceCommit:tokens.sourceCommit,policy:'Existing assets only; permitted transformations are documented per file.',assets:records},null,2)+'\n');
await writeFile('catalog/data.js',`// Generated index of existing source material. No fetch required.\nwindow.LANIS_BRAND = ${JSON.stringify({tokens,copy,assets:records})};\n`);
async function files(dir){const out=[];for(const f of(await readdir(dir)).sort()){const p=`${dir}/${f}`;if((await stat(p)).isDirectory())out.push(...await files(p));else out.push(p);}return out;}
async function bundle(name,paths){const entries={};for(const p of[...new Set(paths)].sort())entries[p]=[new Uint8Array(await readFile(p)),{mtime:new Date(2026,0,1)}];await mkdir('downloads',{recursive:true});await writeFile(`downloads/${name}.zip`,zipSync(entries,{level:6}));}
const common=['README.md','docs/BRAND.md','docs/RIGHTS.md','sources/provenance.json'];
await bundle('lanis-icons',[...common,...records.filter(a=>['app-icons','android','admin'].includes(a.category)).map(a=>a.path)]);
await bundle('lanis-copy',[...common,...await files('copy')]);
await bundle('lanis-brand-kit',[...common,...await files('assets'),...await files('copy'),...await files('brand'),'index.html','package.json','package-lock.json',...await files('catalog'),...await files('sources'),...await files('docs'),...await files('scripts')]);
console.log(`Collected ${records.length} existing assets and documented exports, ${copy.items.length} verbatim text excerpts.`);
