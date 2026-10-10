/* eslint-disable @typescript-eslint/no-require-imports -- Targeted local release QA. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
require('tsx/cjs');
const { ANIMALS } = require('../src/data/animals.ts');
const { animalParticipant } = require('../src/components/rescue/rescueParticipants.ts');
const { createDynamicRescueState, getPossibleWorlds } = require('../src/solver/dynamic/dynamicRescueSolver.ts');
(async () => {
 const out = path.join(require('node:os').tmpdir(), 'prebeta-review'); fs.mkdirSync(out,{recursive:true});
 const tabs = await fetch('http://localhost:9242/json').then(r=>r.json());
 const socket = new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise(r=>socket.addEventListener('open',r));
 let id=0, checks=0, shots=0; const pending=new Map();
 socket.addEventListener('message',e=>{const m=JSON.parse(e.data); if(m.id){const p=pending.get(m.id);pending.delete(m.id); if(m.error)p.reject(m.error);else p.resolve(m.result);}});
 const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(expression);return r.result.value;};
 const wait=async expression=>{for(let n=0;n<150;n++){if(await ev(`Boolean(${expression})`))return;await new Promise(r=>setTimeout(r,100));}throw Error('Timeout '+expression);};
 const check=async expression=>{assert.ok(await ev(`Boolean(${expression})`),expression);checks++;};
 const click=async sel=>{await ev(`document.querySelector(${JSON.stringify(sel)}).click()`);await new Promise(r=>setTimeout(r,100));};
 const nav=async route=>{await call('Page.navigate',{url:'http://localhost:3109'+route});await wait(`location.pathname===${JSON.stringify(route.split('?')[0])}&&document.readyState==='complete'&&document.querySelector('.site-shell')`);};
 const art=async()=>{await ev("document.querySelectorAll('img').forEach(i=>i.loading='eager')");await wait("[...document.images].every(i=>i.complete&&i.naturalWidth)");await check('document.documentElement.scrollWidth<=innerWidth');};
 const shot=async name=>{const r=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));shots++;};
 const prefs={version:1,maxEarthRegionId:'nocturnal',maxSpaceRegionId:'constellation',showTimeless:true};
 await call('Page.navigate',{url:'http://localhost:3109'});await wait("document.readyState==='complete'");
 await ev(`localStorage.setItem('disco-zoo-guide.progress',${JSON.stringify(JSON.stringify(prefs))})`);
 for(const width of [390,1440]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width<600});
  await nav('/');await art();await check("document.querySelectorAll('.group-earth .region-card').length===11&&document.querySelectorAll('.group-space .region-card').length===3&&document.querySelectorAll('.locked-card').length===0");await shot('home-'+width);
  for(const group of ['earth','space']){await ev(`document.querySelector('.group-${group}').scrollIntoView({block:'start',behavior:'instant'})`);if(width===1440)await shot(group+'-full');}
  await click('.progress-control');await wait("document.querySelector('dialog[open]')");await check("document.querySelector('dialog').textContent.includes('Spoiler settings')");await call('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await wait("!document.querySelector('dialog[open]')");
  await nav('/regions/farm');await art();await check("document.querySelectorAll('.animal-card').length===7&&document.querySelector('.group-timeless')");
  await ev("document.querySelector('.group-timeless').scrollIntoView({block:'center',behavior:'instant'})");if(width===1440)await shot('timeless-shown');
  for(const route of ['/regions/constellation/pegasus','/regions/polar/snowy-owl','/pets']){await nav(route);await art();if(route!=='/pets')await shot(route.includes('snowy')?'timeless-guide-'+width:'normal-guide-'+width);}
  await nav('/rescue?region=northern&animal=sasquatch');await art();await check("document.querySelector('[data-animal-id=sasquatch][aria-pressed=true]')&&document.querySelector('.rescue-start-cta')&&!document.querySelector('.dynamic-rescue-grid')");if(width===1440){await ev("document.querySelector('.rescue-animal-options').scrollIntoView({block:'start',behavior:'instant'})");await shot('rescue-setup');}
  await click('.rescue-start-cta');await wait("document.querySelector('.dynamic-rescue-grid')");await ev("document.querySelector('.rescue-live-board-panel').scrollIntoView({block:'start',behavior:'instant'})");await shot('rescue-active-'+width);
  const a=ANIMALS.find(a=>a.id==='sasquatch');const cells=getPossibleWorlds(createDynamicRescueState([animalParticipant(a)]))[0].participants[0].cells;
  for(const c of cells){await click(`[data-cell-index="${c}"]`);await wait("document.querySelector('.rescue-result-selector')");await click('.rescue-result-animal');}
  await wait("document.querySelector('[data-rescue-status=complete]')");await check("document.querySelector('.rescue-next-cta')&&document.querySelectorAll('.dynamic-cell').length===25");await check("[...document.querySelectorAll('.dynamic-cell')].every(c=>{const r=c.getBoundingClientRect();return Math.abs(r.width-r.height)<1})");await ev("document.querySelector('.rescue-live-board-panel').scrollIntoView({block:'start',behavior:'instant'})");await shot('rescue-complete-'+width);
  await click('.rescue-next-cta');await wait("document.querySelector('.rescue-setup')");await check("document.querySelectorAll('.rescue-animal-option[aria-pressed=true]').length===0");
  await nav('/rescue?region=farm&animal=pig');await click('.rescue-start-cta');await wait("document.querySelector('.dynamic-rescue-grid')");
  for(const c of [0,24]){await click(`[data-cell-index="${c}"]`);await wait("document.querySelector('.rescue-result-selector')");await click('.rescue-result-animal');}
  await wait("document.querySelector('[data-rescue-status=contradiction]')");await check("document.activeElement.classList.contains('rescue-recovery-action')");await ev("document.querySelector('.rescue-live-board-panel').scrollIntoView({block:'start',behavior:'instant'})");await shot('contradiction-'+width);await click('.rescue-recovery-action');await wait("document.querySelector('[data-rescue-status=ready]')");await check("!document.querySelector('.rescue-recovery-panel')");
  await nav('/');await ev(`localStorage.setItem('disco-zoo-guide.progress',${JSON.stringify(JSON.stringify({...prefs,maxEarthRegionId:'farm',maxSpaceRegionId:null,showTimeless:false}))})`);await nav('/regions/farm');await art();await check("document.querySelectorAll('.animal-card').length===6&&!document.body.innerText.includes('Chicken')");if(width===1440){await ev("document.querySelector('.animal-collection').scrollIntoView({block:'start',behavior:'instant'})");await shot('timeless-hidden');}
  await nav('/regions/jungle/lemur');await check("document.querySelector('.progress-barrier')&&!document.querySelector('.animal-guide-hero')");
  await nav('/rescue?region=jungle&animal=lemur');await check("!document.querySelector('[data-animal-id=lemur]')&&!document.querySelector('.rescue-region.region-jungle')");
  await ev(`localStorage.setItem('disco-zoo-guide.progress',${JSON.stringify(JSON.stringify(prefs))})`);
 }
 await nav('/rescue?region=farm&animal=chicken');await click('[data-animal-id=pig]');await click('.pet-disclosure-summary');await click('[data-pet-id=rabbit]');await check("document.querySelector('[data-animal-id=chicken][aria-pressed=true]')&&document.querySelector('.pet-disclosure[data-pet-selected=true]')");await click('.rescue-start-cta');await wait("document.querySelector('.dynamic-rescue-grid')");
 for(const strategy of ['finish-found','rarity-focus','target','balanced']){await click(`[data-strategy="${strategy}"]`);if(strategy==='target')await click('[data-target-id="pet:rabbit"]');await check("document.querySelector('[data-rescue-status=ready]')&&document.querySelector('.dynamic-cell[data-recommended=true]')");await check("document.querySelector('.rescue-metrics').textContent.includes('0')");}
 await click('.dynamic-cell[data-recommended=true]');await wait("document.querySelector('.rescue-result-selector')");await check("document.querySelectorAll('.rescue-result-animal').length===3&&document.querySelector('.rescue-result-animal[data-participant-kind=pet]')");await call('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await wait("!document.querySelector('.rescue-result-selector')");
 await nav('/rescue');await click('.pet-disclosure-summary');await click('[data-pet-id=rabbit]');await check("!document.querySelector('[data-strategy=rarity-focus]')&&!document.querySelector('.rescue-start-cta').disabled");await click('.rescue-start-cta');await wait("document.querySelector('.dynamic-rescue-grid')");await check("document.querySelector('[data-rescue-status=ready]')");
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await nav('/');await check("matchMedia('(prefers-reduced-motion: reduce)').matches&&getComputedStyle(document.documentElement).scrollBehavior==='auto'");
 console.log(JSON.stringify({checks,screenshots:shots,output:out}));socket.close();
})().catch(e=>{console.error(e);process.exit(1);});





