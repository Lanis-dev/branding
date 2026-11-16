import puppeteer from 'puppeteer-core';
import { mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const executablePath=process.env.CHROME_PATH||'/usr/bin/chromium';
try { await access(executablePath); } catch { throw new Error('Local Chromium not found. Set CHROME_PATH to your browser executable.'); }
await mkdir(path.join(root,'assets/templates'),{recursive:true});
const browser=await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try {
  for(const [name,width,height] of [['social-landscape',1200,630],['social-square',1080,1080],['social-story',1080,1920],['store-feature',1024,500]]) {
    const page=await browser.newPage();await page.setViewport({width,height,deviceScaleFactor:1});await page.goto(pathToFileURL(path.join(root,`templates/${name}.html`)).href);await page.evaluate(()=>document.fonts.ready);
    const errors=await page.evaluate(()=>[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src));if(errors.length)throw new Error(`Missing template images: ${errors.join(', ')}`);
    await page.screenshot({path:path.join(root,`assets/templates/${name}.png`)});await page.close(); console.log(`Rendered HTML/CSS: ${name} ${width} × ${height}`);
  }
} finally { await browser.close(); }
