/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Chrome QA. */
const fs=require('node:fs'),assert=require('node:assert/strict');
require('tsx/cjs');
const { SITE_VERSION }=require('../src/components/layout/siteVersion.ts');
(async()=>{
const tabs=await fetch('http://localhost:9242/json').then(r=>r.json());const socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r));let id=0;const pending=new Map();socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(m.error);else p.resolve(m.result);}});
const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;};
const wait=async expression=>{for(let i=0;i<150;i++){if(await evaluate(`Boolean(${expression})`))return;await new Promise(r=>setTimeout(r,150));}throw Error('Timeout '+expression);};
const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await new Promise(r=>setTimeout(r,120));};

let checks=0;
const check=async expression=>{assert.ok(await evaluate(expression),expression);checks++;};
for(const width of [390,1440]){
 await call('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width<600});
 await call('Page.navigate',{url:'http://localhost:3000/'});await wait("document.readyState==='complete'");
 await evaluate("localStorage.setItem('disco-zoo-guide.progress',JSON.stringify({version:1,maxEarthRegionId:'mountain',maxSpaceRegionId:'moon',showTimeless:false}))");
 for(const path of ['/regions/mountain','/regions/mountain/goat','/rescue?region=mountain&animal=goat']){
  await call('Page.navigate',{url:'http://localhost:3000'+path});
  await wait(`location.pathname===${JSON.stringify(path.split("?")[0])}&&document.readyState==='complete'&&!!document.querySelector('.site-shell')`);
  await wait(path.startsWith('/rescue')?"!!document.querySelector('.rescue-setup')":"!!document.querySelector('.region-mountain #page-title')");
  await wait(`document.body.textContent.includes(${JSON.stringify(SITE_VERSION)})`);
  await check("document.documentElement.scrollWidth<=innerWidth");
  if(path.includes('/goat')){
   await check("document.querySelector('a.rescue-header-link').getAttribute('href')==='/rescue?region=mountain&animal=goat'");
   await check("[...document.querySelectorAll('img')].some(i=>i.src.includes('animals-hq/mountain/goat.png')&&i.complete&&i.naturalWidth===136)");
  }else if(path.startsWith('/rescue')){
   await check("!!document.querySelector('.rescue-region.region-mountain[aria-pressed=true]')");
   await check("!!document.querySelector('[data-animal-id=goat][aria-pressed=true]')&&!document.querySelector('.dynamic-rescue-grid')");
  }else{
   await check("document.querySelector('a.rescue-header-link').getAttribute('href')==='/rescue?region=mountain'");
   await check(`document.querySelectorAll('.animal-card').length===6&&!!document.querySelector('.vector-mountain')&&document.body.textContent.includes(${JSON.stringify(SITE_VERSION)})`);
   await evaluate("[...document.querySelectorAll('img')].forEach(i=>i.loading='eager')");
   await wait("[...document.querySelectorAll('img')].filter(i=>i.src.includes('animals-hq/mountain')).every(i=>i.complete&&i.naturalWidth>0)");
   await check("[...document.querySelectorAll('img')].filter(i=>i.src.includes('animals-hq/mountain')).every(i=>i.complete&&i.naturalWidth>0)");
  }
  if(path==='/regions/mountain'||(path==='/regions/mountain/goat'&&width===1440)){
   await evaluate("const p=document.querySelector('nextjs-portal');if(p)p.style.display='none'");
   const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
   fs.mkdirSync('public/game/experiments/alpha17-mountain',{recursive:true});fs.writeFileSync('public/game/experiments/alpha17-mountain/'+(path.includes('/goat')?'animal-':'region-')+width+'.png',Buffer.from(shot.data,'base64'));
  }
 }
 await call('Page.navigate',{url:'http://localhost:3000/rescue?region=mountain'});
 await wait("!!document.querySelector('.rescue-setup')");
 await check("!!document.querySelector('.rescue-region.region-mountain[aria-pressed=true]')&&!document.querySelector('[data-animal-id][aria-pressed=true]')&&!document.querySelector('.dynamic-rescue-grid')");
 await evaluate("localStorage.setItem('disco-zoo-guide.progress',JSON.stringify({version:1,maxEarthRegionId:'city',maxSpaceRegionId:null,showTimeless:false}))");
 await call('Page.navigate',{url:'http://localhost:3000/rescue?region=mountain&animal=goat'});
 await wait("!!document.querySelector('.rescue-setup')");
 await check("!document.querySelector('.rescue-region.region-mountain')&&!document.querySelector('[data-animal-id=goat]')");
 await call('Page.navigate',{url:'http://localhost:3000/regions/mountain'});
 await wait("!!document.querySelector('.progress-barrier')");
 await check("!document.querySelector('.vector-mountain')");
 await call('Page.navigate',{url:'http://localhost:3000/regions/mountain/goat'});
 await wait("!!document.querySelector('.progress-barrier')");
 await check("!document.querySelector('.animal-guide-art')&&document.body.textContent.includes('Hidden by your spoiler settings')");
 await click('.progress-barrier .rescue-primary');await wait("!!document.querySelector('.region-mountain #page-title')");
 await check("JSON.parse(localStorage.getItem('disco-zoo-guide.progress')).maxEarthRegionId==='mountain'");
 console.log(width+'px guide, animal, context, hidden route and reveal passed');
}
console.log(checks+' browser assertions passed');
socket.close();
})().catch(e=>{console.error(e);process.exit(1);});
