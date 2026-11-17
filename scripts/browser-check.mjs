import puppeteer from 'puppeteer-core';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(path.join(root,'verification'),{recursive:true});
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',req=>errors.push(`${req.url()} ${req.failure()?.errorText}`));
 await page.setViewport({width:1440,height:1000,deviceScaleFactor:1});await page.goto(pathToFileURL(path.join(root,'index.html')).href);await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(async()=>{for(const img of document.images){img.loading='eager';try{await img.decode();}catch{}}});
 assert.equal(await page.$$eval('#assets .asset-card',a=>a.length),25);
 assert.deepEqual(await page.$$eval('img',imgs=>imgs.filter(i=>!i.naturalWidth).map(i=>i.src)),[]);
 await page.screenshot({path:path.join(root,'verification/catalog-desktop.png'),fullPage:true});
 await page.screenshot({path:path.join(root,'verification/catalog-overview.png')});
 await page.select('#category','app-icons');assert.equal(await page.$$eval('#assets .asset-card',a=>a.length),11);
 await page.type('#search','sapphire');assert.equal(await page.$$eval('#assets .asset-card',a=>a.length),1);
 await page.select('#assets select','assets/app-icons/additional/sapphire/icon-256.png');assert.equal(await page.$eval('#assets .asset-download',a=>a.getAttribute('href')),'assets/app-icons/additional/sapphire/icon-256.png');
 await page.type('#search','no-such-asset');assert(await page.$('#assets .empty'));
 await page.click('nav [data-category="app-icons"]');assert.equal(await page.$$eval('#assets .asset-card',a=>a.length),11);
 assert.deepEqual(await page.$$eval('#locale option',options=>options.map(o=>o.value)),['de']);await page.select('#copy-category','Landing page');assert.equal(await page.$$eval('#copy-items .copy-card',a=>a.length),8);assert((await page.$eval('#copy-items',a=>a.textContent)).includes('Demo ansehen'));assert((await page.$eval('#copy-items .copy-source',a=>a.href)).includes('/blob/66ea0e47'));
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.testClipboard=text;}}});});await page.click('[aria-label="Copy cta-start"]');assert.equal(await page.evaluate(()=>window.testClipboard),'Jetzt nutzen');
 await page.click('[aria-label="Copy ruby colour #f43f5e"]');assert.equal(await page.evaluate(()=>window.testClipboard),'#f43f5e');
 await page.select('#copy-category','all');await page.type('#copy-search','no-such-copy');assert(await page.$('#copy-items .empty'));
 await page.click('nav [data-category="all"]');await page.select('#locale','de');await page.$eval('#copy-search',i=>{i.value='';i.dispatchEvent(new Event('input'));});
 for(const width of [390,320]){await page.setViewport({width,height:844,deviceScaleFactor:1});await page.evaluate(()=>window.scrollTo(0,0));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`Horizontal overflow at ${width}px`);if(width===390){await page.screenshot({path:path.join(root,'verification/catalog-mobile.png'),fullPage:true});await page.screenshot({path:path.join(root,'verification/catalog-mobile-overview.png')});}}
 assert.deepEqual(errors,[]);console.log('Offline catalog passed: assets, downloads, search, filters, verbatim source links, clipboard, images, and mobile layouts at 320/390 px.');
}finally{await browser.close();}
