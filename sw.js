const V='gokturk-v1', FONTS='https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Hanken+Grotesk:wght@400;500;600;700&family=Noto+Sans+Old+Turkic&display=swap';
const LOCAL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(V); await c.addAll(LOCAL);
  try{ // yazı tiplerini de önceden indir
    const r=await fetch(FONTS); const css=await r.clone().text(); await c.put(FONTS,r);
    const urls=[...css.matchAll(/url\(([^)]+)\)/g)].map(m=>m[1].replace(/['"]/g,''));
    await Promise.all(urls.map(u=>fetch(u).then(x=>x.ok&&c.put(u,x)).catch(()=>{})));
  }catch(_){}
  self.skipWaiting();
})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==V)await caches.delete(k);await clients.claim();})())});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith((async()=>{
    const c=await caches.open(V), hit=await c.match(e.request,{ignoreSearch:false});
    if(hit)return hit;
    try{const r=await fetch(e.request); if(r.ok&&/fonts\.(googleapis|gstatic)\.com/.test(e.request.url))c.put(e.request,r.clone()); return r;}
    catch(_){ if(e.request.mode==='navigate')return (await c.match('./index.html'))||Response.error(); return Response.error(); }
  })());
});
