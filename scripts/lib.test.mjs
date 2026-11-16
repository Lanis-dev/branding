import test from 'node:test';
import assert from 'node:assert/strict';
import { rasterWidths, svgDocument } from './lib.mjs';
test('raster exports never enlarge small source images',()=>{assert.deepEqual(rasterWidths(320),[320]);assert.deepEqual(rasterWidths(960),[480,960]);assert.deepEqual(rasterWidths(1680),[480,960,1440,1680]);});
test('SVG titles escape XML characters',()=>{assert(svgDocument(10,10,'A & B < C','<path/>').includes('A &amp; B &lt; C'));});
