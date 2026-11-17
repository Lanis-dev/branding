// Package the manually maintained library for hosting. No assets are generated or imported.
import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const site=path.join(root,'.site');
await rm(site,{recursive:true,force:true});await mkdir(site,{recursive:true});
for(const file of ['index.html','README.md','assets','brand','catalog','copy','fonts']){
 await cp(path.join(root,file),path.join(site,file),{recursive:true});
}
console.log('Packaged the catalog and existing assets in .site/');
