import fs from 'fs'; import path from 'path';
const base = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]):/, '$1:');
const products = JSON.parse(fs.readFileSync(path.join(base,'products.json'),'utf8')).products;
const out = path.join(base,'..','images'); fs.mkdirSync(out,{recursive:true});
const jobs = [];
for (const p of products) {
  p.images.forEach((im,i) => {
    const u = im.src.split('?')[0]; const ext = (u.match(/\.(jpe?g|png|webp)$/i)||['','jpg'])[1];
    jobs.push({url: u + '?width=1600', file: path.join(out, `${p.handle}-${i+1}.${ext}`)});
  });
}
const extra = ['files/BS1A0457.jpg','files/MIN_0031_E.jpg'];
let done=0, fail=0;
async function run(j){ if (fs.existsSync(j.file)) {done++; return;} try{ const r=await fetch(j.url,{headers:{'User-Agent':'Mozilla/5.0'}}); if(!r.ok) throw new Error(r.status); fs.writeFileSync(j.file, Buffer.from(await r.arrayBuffer())); done++; }catch(e){ fail++; fs.appendFileSync(path.join(base,'download-errors.log'), j.url+' '+e.message+'\n'); } }
const q=[...jobs]; const workers=Array.from({length:4}, async()=>{ while(q.length){ await run(q.shift()); await new Promise(r=>setTimeout(r,150)); } });
await Promise.all(workers);
fs.writeFileSync(path.join(base,'download-summary.txt'), `jobs ${jobs.length} done ${done} fail ${fail}\n`);
console.log(`jobs ${jobs.length} done ${done} fail ${fail}`);
