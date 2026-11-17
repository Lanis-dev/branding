/* No fetch or network dependencies: this library works directly from disk. */
'use strict';
const assets = window.LANIS_ASSETS;
const copy = window.LANIS_COPY;
const tokens = window.LANIS_TOKENS;
const $ = id => document.getElementById(id);
function element(tag, cls, text) { const el=document.createElement(tag); if(cls) el.className=cls; if(text!==undefined) el.textContent=text; return el; }
let toastTimer;
function toast(message) { $('toast').textContent=message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2500); }
async function copyText(text) {
  try {
    if(navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const field=element('textarea'); field.value=text; field.style.cssText='position:fixed;left:-10000px';document.body.append(field); field.select();
      const result=document.execCommand('copy');field.remove(); if(!result) throw new Error('Clipboard unavailable');
    }
    toast('Copied to clipboard');
  } catch { toast('Clipboard unavailable. Select the text and copy it manually.'); }
}
const groups=[...Map.groupBy(assets,a=>a.id).values()];
function renderAssets() {
  const category=$('category').value; const query=$('search').value.toLowerCase().trim();
  const filtered=groups.filter(group=>(category==='all'||group[0].category===category)&&[group[0].name,group[0].variant,group[0].category,group[0].kind].join(' ').toLowerCase().includes(query));
  $('assets').replaceChildren();
  $('asset-count').textContent=`${filtered.length} asset families · ${filtered.reduce((n,g)=>n+g.length,0)} ready-to-use files`;
  for(const group of filtered) {
    const base=group[0]; const card=element('article','asset-card'); const preview=element('div','asset-preview');
    const preferred=group.find(a=>a.quality==='original'&&a.width===512&&a.format==='png')||group.find(a=>a.quality==='original'&&a.format==='png')||group.find(a=>a.width===256&&a.format==='png')||group.find(a=>a.width===480&&a.format==='webp')||group[0];
    const img=element('img',base.category==='icons'?'icon':base.category==='screenshots'?'screenshot':''); img.src=preferred.path;if(base.format==='ico'){img.style.width='32px';img.style.height='32px';}img.alt=base.alt; img.loading='lazy';if(['png','webp','jpeg','jpg','svg','ico'].includes(preferred.format))preview.append(img);else preview.append(element('span','resource-preview',`${preferred.format.toUpperCase()} resources`));
    const body=element('div','asset-card-body');body.append(element('h3','',base.name),element('p','',`${group.length} ${group.length===1?'file':'sizes & formats'}`));
    const select=element('select'); select.setAttribute('aria-label',`Format and size for ${base.name}`);
    for(const a of group) { const option=element('option','',`${a.format.toUpperCase()} · ${a.format==='svg'?'scalable':a.width?`${a.width} × ${a.height}`:'multi-size'} · ${a.quality}`);option.value=a.path;option.selected=a===preferred;select.append(option); }
    const link=element('a','asset-download'); link.download=''; const label=element('span');link.append(label,element('span','','↓'));
    const update=()=>{const a=group.find(a=>a.path===select.value);link.href=a.path;label.textContent=`Download ${a.format.toUpperCase()} · ${a.bytes<1024?`${a.bytes} B`:`${Math.round(a.bytes/1024)} KB`}`;};
    select.addEventListener('change',update);update();body.append(select,link);card.append(preview,body);$('assets').append(card);
  }
  if(!filtered.length) $('assets').append(element('p','empty','No matching assets. Try a colour name or another category.'));
  document.querySelectorAll('[data-category]').forEach(a=>{ if(a.dataset.category===category)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current'); });
}
function renderCopy() {
  const locale=$('locale').value;const query=$('copy-search').value.toLowerCase().trim();const channel=$('copy-category').value;
  const selected=copy.items.filter(i=>(channel==='all'||i.category===channel)&&`${i.id} ${i.category} ${i.text[locale]}`.toLowerCase().includes(query));$('copy-items').replaceChildren();
  $('copy-count').textContent=`${selected.length} entries · ${locale==='de'?'German':'English'}`;
  for(const item of selected) {
    const card=element('article','copy-card');const head=element('div','copy-card-header');head.append(element('span','',item.category));const button=element('button','','Copy text');button.type='button';button.setAttribute('aria-label',`Copy ${item.id}`);button.addEventListener('click',()=>copyText(item.text[locale]));head.append(button);
    const text=element('p','copy-text',item.text[locale]);text.lang=locale;
    card.append(head,text,element('span','copy-meta',`${[...item.text[locale]].length} characters`));$('copy-items').append(card);
  }
  if(!selected.length)$('copy-items').append(element('p','empty','No matching text. Try a different channel or search.'));
}
for(const category of [...new Set(copy.items.map(i=>i.category))]) {const option=element('option','',category);option.value=category;$('copy-category').append(option);}
for(const key of Object.keys(tokens.colors)) {
  const value=tokens.colors[key];const swatch=element('div','swatch');const color=element('div','swatch-color');color.style.backgroundColor=value;const body=element('div','swatch-body');const button=element('button','',value);button.type='button';button.setAttribute('aria-label',`Copy ${key} colour ${value}`);button.addEventListener('click',()=>copyText(value));body.append(element('p','',key.replace(/[A-Z]/g,c=>' '+c.toLowerCase())),button);swatch.append(color,body);$('swatches').append(swatch);
}
$('search').addEventListener('input',renderAssets);$('category').addEventListener('change',renderAssets);
for(const id of ['copy-search','locale','copy-category']) $(id).addEventListener(id==='copy-search'?'input':'change',renderCopy);
document.querySelectorAll('[data-category]').forEach(a=>a.addEventListener('click',()=>{$('category').value=a.dataset.category;$('search').value='';renderAssets();}));
renderAssets();renderCopy();
