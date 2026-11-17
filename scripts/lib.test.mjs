import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { rasterWidths, extendExistingIconGenerator, verifyCopyExcerpt } from './lib.mjs';
test('raster exports never enlarge source images',()=>{assert.deepEqual(rasterWidths(320),[320]);assert.deepEqual(rasterWidths(960),[480,960]);assert.deepEqual(rasterWidths(1680),[480,960,1440,1680]);});
test('copy validation rejects invented wording even when provenance points at a real file',()=>{
 const source='Header\nExisting exact text.\n';const item={id:'example',text:{de:'Existing exact text.'},source:{start:7,end:27,line:2}};
 assert(verifyCopyExcerpt(item,source));assert.throws(()=>verifyCopyExcerpt({...item,text:{de:'A new slogan.'}},source),/not a verbatim/);
 assert.throws(()=>verifyCopyExcerpt({...item,source:{...item.source,line:1}},source),/not a verbatim/);
});
test('existing generator adapter preserves its recolour function and palettes while adding sizes',async()=>{
 const source=await readFile(new URL('../sources/lanis_ui/scripts/generate-themed-icons.mjs',import.meta.url),'utf8');const extended=extendExistingIconGenerator(source);
 const algorithm=source.slice(source.indexOf('function recolor('),source.indexOf('const { data: source'));
 assert(extended.includes(algorithm));assert(extended.includes("import { themes } from './icon-palettes.mjs'"));assert(extended.includes("'icon-256.png': 256"));assert(!extended.includes('toIco'));
 assert.throws(()=>extendExistingIconGenerator('// different script'),/review the size adapter/);
});
