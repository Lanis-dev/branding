import { readFile, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { unzipSync } from 'fflate';
import { digest } from './lib.mjs';
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const manifest=JSON.parse(await readFile('assets/manifest.json'));
const provenance=JSON.parse(await readFile('sources/provenance.json'));
for(const source of provenance)assert.equal(digest(await readFile(source.path)),source.sha256,`Source changed: ${source.path}`);
const names=new Set();
for(const asset of manifest.assets){
 assert(!names.has(asset.path),`Duplicate ${asset.path}`);names.add(asset.path);
 assert(!asset.path.includes('..')&&!path.isAbsolute(asset.path));
 const data=await readFile(asset.path);assert.equal(data.length,asset.bytes);assert.equal(digest(data),asset.sha256,asset.path);await access(asset.source);
 if(asset.format==='ico')continue;
 const meta=await sharp(data).metadata();assert.equal(meta.width,asset.width,asset.path);assert.equal(meta.height,asset.height,asset.path);
 if(asset.category==='screenshots'||asset.category==='app-icons'){
  const source=await sharp(asset.source).metadata();assert(asset.width<=source.width&&asset.height<=source.height,`Upscaled ${asset.path}`);
 }
 if(asset.format==='svg'){
  const text=data.toString();assert(!/<text\b|<script\b|https?:\/\/(?!www.w3.org)/.test(text),`SVG must be self-contained outlines: ${asset.path}`);
 }
}
const library=JSON.parse(await readFile('copy/library.json'));const ids=new Set();
for(const item of library.items){assert(!ids.has(item.id));ids.add(item.id);assert(['draft','source-adapted','approved'].includes(item.status));for(const locale of library.locales)assert(item.text[locale]?.trim());}
for(const locale of library.locales){
 const text=id=>library.items.find(i=>i.id===id).text[locale];
 assert([...text('store-short')].length<=80,'Store short text exceeds 80 characters');
 assert([...text('store-full')].length<=4000,'Store full text exceeds 4000 characters');
 assert([...text('seo-title')].length<=60,'SEO title exceeds kit guideline');
 assert([...text('seo-description')].length<=160,'SEO description exceeds kit guideline');
 assert([...text('social-bio')].length<=150,'Bio exceeds kit guideline');
}
for(const file of await readdir('downloads')){
 const zip=unzipSync(await readFile(`downloads/${file}`));assert(zip['docs/RIGHTS.md']);assert(zip['README.md']);
 if(file==='lanis-brand-kit.zip')for(const asset of manifest.assets)assert.equal(digest(zip[asset.path]),asset.sha256,`Archive mismatch: ${asset.path}`);
}
const original=await readFile('sources/upstream/android-chrome-512x512.png');const exported=await readFile('assets/app-icons/lanis-app-icon-512.png');
assert.deepEqual(await sharp(exported).raw().toBuffer(),await sharp(original).raw().toBuffer(),'Native icon pixels must be unchanged');
console.log(`Verified ${manifest.assets.length} assets, ${provenance.length} source hashes, copy limits, raster sizes and all ZIP bundles.`);
