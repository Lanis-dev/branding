import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('local catalog server serves assets while denying repository internals and traversal',async()=>{
 const child=spawn(process.execPath,[fileURLToPath(new URL('./serve.mjs',import.meta.url))],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
 try {
  const base=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Server did not start')),5000);child.once('error',reject);child.stdout.on('data',data=>{const match=String(data).match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0]);}});});
  assert.equal((await fetch(base)).status,200);
  assert.equal((await fetch(base+'/assets/app-icons/additional/ruby/icon-64.png')).headers.get('content-type'),'image/png');
  for(const route of ['/.git/HEAD','/node_modules/fontkit/package.json','/%2e%2e%2fpackage.json','/missing-file'])assert.equal((await fetch(base+route)).status,404,route);
  assert.equal((await fetch(base,{method:'POST'})).status,405);
 }finally{child.kill();}
});
