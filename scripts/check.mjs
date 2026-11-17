import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { unzipSync } from 'fflate';
import { digest, verifyCopyExcerpt } from './lib.mjs';
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const manifest=JSON.parse(await readFile('assets/manifest.json'));
const provenance=JSON.parse(await readFile('sources/provenance.json'));const sourceMap=new Map(provenance.map(s=>[s.path,s]));
assert.equal(sourceMap.size,provenance.length,'Duplicate source records');
for(const source of provenance)assert.equal(digest(await readFile(source.path)),source.sha256,`Source changed: ${source.path}`);
const names=new Set();
for(const asset of manifest.assets){
 assert(!names.has(asset.path),`Duplicate ${asset.path}`);names.add(asset.path);
 assert(!asset.path.includes('..')&&!path.isAbsolute(asset.path));
 const source=sourceMap.get(asset.source);assert(source,`Unproven source: ${asset.path}`);assert.equal(asset.sourceUrl,source.url);
 const data=await readFile(asset.path);assert.equal(data.length,asset.bytes);assert.equal(digest(data),asset.sha256,asset.path);
 assert(['exact-copy','upstream-script','resize-encode'].includes(asset.transformation?.type),`Unsupported transformation: ${asset.path}`);
 if(asset.transformation.type==='exact-copy')assert.equal(asset.sha256,source.sha256,`Original modified: ${asset.path}`);
 if(['svg','xml','webmanifest','ico'].includes(asset.format))assert.equal(asset.transformation.type,'exact-copy','Native/vector resources must remain unchanged');
 if(['png','webp','jpeg','svg'].includes(asset.format)){
  const meta=await sharp(data).metadata();assert.equal(meta.width,asset.width,asset.path);assert.equal(meta.height,asset.height,asset.path);
 }
 if(asset.transformation.type==='upstream-script'){
  assert(sourceMap.has(asset.transformation.script));for(const input of asset.transformation.inputs)assert(sourceMap.has(input));
  assert([24,48,64,128,256].includes(asset.width));assert.equal(asset.width,asset.height);
  assert.deepEqual(await sharp(data).raw().toBuffer(),await sharp(asset.source).resize(asset.width,asset.height).raw().toBuffer(),`Additional size changed artwork: ${asset.path}`);
 }
 if(asset.transformation.type!=='exact-copy'){
  const original=await sharp(asset.source).metadata();assert(asset.width<=original.width&&asset.height<=original.height,`Upscaled ${asset.path}`);
 }
}
async function files(dir){const out=[];for(const file of await readdir(dir)){const p=`${dir}/${file}`;if((await stat(p)).isDirectory())out.push(...await files(p));else out.push(p);}return out;}
assert.deepEqual((await files('assets')).filter(p=>p!=='assets/manifest.json').sort(),[...names].sort(),'Unindexed or leftover assets');
for(const forbidden of ['logos','templates'])assert(!manifest.assets.some(a=>a.path.includes(`/${forbidden}/`)),'Invented brand assets remain');
// Every imported public/native image or resource must have its exact original represented.
for(const source of provenance.filter(s=>s.path.includes('/public/favicon/')||s.path.startsWith('sources/lanis_ui_android/android/')||/\/(opengraph\.(svg|png)|icon\.webp|lanis-logo\.png)$/.test(s.path)))assert(manifest.assets.some(a=>a.source===source.path&&a.transformation.type==='exact-copy'),`Missing original: ${source.path}`);
const library=JSON.parse(await readFile('copy/library.json'));const ids=new Set();assert.deepEqual(library.locales,['de'],'No unproven translations');
for(const item of library.items){
 assert(!ids.has(item.id));ids.add(item.id);assert(['verbatim','historical-verbatim'].includes(item.status));
 const source=sourceMap.get(item.source.path);assert(source,`Unproven copy: ${item.id}`);assert.equal(item.source.commit,source.commit);assert.equal(item.source.url,`${source.url}#L${item.source.line}`);
 verifyCopyExcerpt(item,await readFile(item.source.path,'utf8'));
}
for(const file of await readdir('downloads')){
 const zip=unzipSync(await readFile(`downloads/${file}`));assert(zip['docs/RIGHTS.md']);assert(zip['README.md']);
 assert(!Object.keys(zip).some(p=>p.startsWith('templates/')||p.startsWith('assets/logos/')||p.startsWith('assets/templates/')),'Invented assets in archive');
 if(file==='lanis-brand-kit.zip'){
  for(const asset of manifest.assets)assert.equal(digest(zip[asset.path]),asset.sha256,`Archive mismatch: ${asset.path}`);
  assert.deepEqual(Object.keys(zip).filter(p=>p.startsWith('assets/')&&p!=='assets/manifest.json').sort(),[...names].sort(),'Unexpected archive assets');
  assert.equal(digest(zip['copy/library.json']),digest(await readFile('copy/library.json')));
 }
}
console.log(`Verified ${manifest.assets.length} sourced assets/exports, ${provenance.length} source hashes, exact copy excerpts, icon pixels and complete archive/asset trees.`);
