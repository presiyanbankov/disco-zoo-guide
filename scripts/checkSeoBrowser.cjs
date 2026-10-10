/* eslint-disable @typescript-eslint/no-require-imports -- Focused local SEO/source QA. */
const assert = require('node:assert/strict');
const base = process.env.SEO_QA_URL || 'http://localhost:3110';
require('tsx/cjs');
const { configuredSiteOrigin } = require('../src/components/seo/pageMetadata.ts');
const origin = process.env.SEO_QA_ORIGIN || configuredSiteOrigin().origin;
(async () => {
 const routes = ['/', '/rescue?region=savanna&animal=giraffe', '/pets', '/regions/savanna', '/regions/mars', '/regions/savanna/giraffe', '/regions/farm/chicken'];
 let checks = 0;
 for (const route of routes) {
  const response = await fetch(base+route); assert.equal(response.status,200);
  const html=await response.text(), canonical=origin+route.split('?')[0];
  assert.equal(new URL(html.match(/<link rel="canonical" href="([^"]+)"/)[1]).href,new URL(canonical).href);
  assert.ok(html.includes('property="og:title"')&&html.includes('property="og:image"')&&html.includes('name="twitter:card"'));
  assert.ok(!html.includes('name="robots" content="noindex'));
  if(route.startsWith('/regions/')){const json=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);assert.equal(json['@type'],'BreadcrumbList');assert.equal(json.itemListElement.at(-1).item,canonical);assert.ok(html.includes('Animal pattern')||html.includes('REGION SEARCH'));}
  checks+=4;
 }
 const xml=await fetch(base+'/sitemap.xml').then(r=>r.text());assert.ok(xml.includes(origin+'/regions/farm/chicken')&&!xml.includes('?region='));checks++;
 const robots=await fetch(base+'/robots.txt').then(r=>r.text());assert.ok(robots.includes('Allow: /')&&robots.includes('Sitemap: '+origin+'/sitemap.xml')&&!robots.includes('Disallow: /regions'));checks++;
 const image=await fetch(base+'/opengraph-image');assert.equal(image.status,200);assert.match(image.headers.get('content-type'),/image\/png/);assert.ok((await image.arrayBuffer()).byteLength>1000);checks++;
 const tabs=await fetch('http://localhost:9242/json').then(r=>r.json());const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));
 let id=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(m.error);else p.resolve(m.result);}});
 const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(expression);return r.result.value;};
 const wait=async expression=>{for(let n=0;n<150;n++){if(await ev(`Boolean(${expression})`))return;await new Promise(r=>setTimeout(r,100));}throw Error(expression);};
 const nav=async route=>{await call('Page.navigate',{url:base+route});await wait(`document.readyState==='complete'&&location.pathname===${JSON.stringify(route.split('?')[0])}&&document.querySelector('.site-shell')&&!document.documentElement.dataset.spoilerRestoring`);};
 await nav('/');const previous=await ev("localStorage.getItem('disco-zoo-guide.progress')");
 try {
  for(const width of [390,1440]){
   await call('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width<600});await ev("localStorage.removeItem('disco-zoo-guide.progress')");await nav('/');
   assert.ok(await ev("document.querySelectorAll('.region-card').length===14&&!document.querySelector('dialog[open]')&&!document.querySelector('.progress-welcome')"));checks++;
   await nav('/regions/farm/chicken');assert.ok(await ev("document.querySelector('.animal-guide-hero')&&document.title.includes('Chicken Timeless Pattern')"));checks++;
   await nav('/rescue?region=farm&animal=chicken');assert.ok(await ev("document.querySelector('[data-animal-id=chicken][aria-pressed=true]')&&!document.querySelector('.dynamic-rescue-grid')"));checks++;
   const restricted=JSON.stringify({version:1,maxEarthRegionId:'farm',maxSpaceRegionId:null,showTimeless:false});await ev(`localStorage.setItem('disco-zoo-guide.progress',${JSON.stringify(restricted)})`);await nav('/regions/farm/chicken');
   assert.ok(await ev("document.querySelector('.progress-barrier')&&!document.querySelector('.animal-guide-hero')"));assert.equal(await ev("localStorage.getItem('disco-zoo-guide.progress')"),restricted);checks+=2;
   await nav('/regions/jungle');await wait("document.querySelector('.progress-barrier')&&!document.querySelector('.region-hero')");assert.ok(await ev("document.querySelector('.progress-barrier')&&!document.querySelector('.region-hero')"));checks++;
   await nav('/');assert.ok(await ev("document.querySelectorAll('.region-card').length===1&&document.documentElement.scrollWidth<=innerWidth"));checks++;
   await ev("document.querySelector('.progress-control').click()");await wait("document.querySelector('dialog[open]')");assert.ok(await ev("document.querySelector('input[value=farm]').checked&&!document.querySelector('input[aria-label=\"Show Timeless\"]').checked"));checks++;
   await call('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await wait("!document.querySelector('dialog[open]')");checks++;
  }
 } finally {if(previous===null)await ev("localStorage.removeItem('disco-zoo-guide.progress')");else await ev(`localStorage.setItem('disco-zoo-guide.progress',${JSON.stringify(previous)})`);ws.close();}
 console.log(JSON.stringify({checks,routes:routes.length,widths:[390,1440],origin,productionDomainConfirmed:true}));
})().catch(e=>{console.error(e);process.exit(1);});
