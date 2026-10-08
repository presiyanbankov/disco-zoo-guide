/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Chrome CDP QA. */
const fs = require('node:fs');
const assert = require('node:assert/strict');
const version = fs.readFileSync('src/components/layout/siteVersion.ts','utf8').match(/SITE_VERSION = "([^"]+)"/)[1];
const base = process.env.ALPHA09_QA_URL || 'http://localhost:3000';
const debug = 'http://localhost:9242';
const output = process.env.ALPHA09_QA_OUTPUT || 'public/game/experiments/alpha09';
fs.mkdirSync(output,{recursive:true});
(async () => {
  const targets = await fetch(debug + '/json').then(r => r.json());
  const socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve));
  let id = 0;
  const pending = new Map(), errors = [], results = [];
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, {resolve, reject});
    socket.send(JSON.stringify({id, method, params}));
  });
  socket.addEventListener('message', event => {
    const m = JSON.parse(event.data);
    if (m.id) {
      const p = pending.get(m.id); pending.delete(m.id);
      if (m.error) p.reject(m.error); else p.resolve(m.result);
    }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
    if (m.method === 'Network.responseReceived' && m.params.type === 'Image' && m.params.response.status >= 400) errors.push(m.params.response.url);
  });
  const evaluate = async expression => {
    const r = await call('Runtime.evaluate', {expression, returnByValue:true});
    if (r.exceptionDetails) throw Error(r.exceptionDetails.text + ': ' + expression);
    return r.result.value;
  };
  const waitFor = async expression => {
    for (let i = 0; i < 100; i++) {
      if (await evaluate(`Boolean(${expression})`)) return;
      await new Promise(r => setTimeout(r, 100));
    }
    throw Error('Timed out: ' + expression);
  };
  const click = async selector => {
    const point = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}); if(!e||e.disabled)throw Error('Missing/disabled control'); e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    await call('Input.dispatchMouseEvent', {type:'mousePressed',button:'left',clickCount:1,...point});
    await call('Input.dispatchMouseEvent', {type:'mouseReleased',button:'left',clickCount:1,...point});
  };
  const key = async (name, code, virtualKey) => {
    await call('Input.dispatchKeyEvent', {type:'keyDown',key:name,code,windowsVirtualKeyCode:virtualKey,text:name==='Enter'?'\r':undefined});
    await call('Input.dispatchKeyEvent', {type:'keyUp',key:name,code,windowsVirtualKeyCode:virtualKey});
  };
  const clickText = async text => {
    const selector = await evaluate(`(()=>{const buttons=[...document.querySelectorAll('button')];const b=buttons.find(e=>e.textContent.trim()===${JSON.stringify(text)});b.dataset.qaAction='target';return '[data-qa-action="target"]';})()`);
    await click(selector);
    await evaluate(`document.querySelector('[data-qa-action="target"]')?.removeAttribute('data-qa-action')`);
  };
  const shot = async name => { await waitFor(`!document.querySelector('[role=dialog]') || document.querySelector('[role=dialog]').getAnimations().every(a=>a.playState==='finished')`); const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:name.startsWith('home') || name.startsWith('pets')});fs.writeFileSync(output+'/'+name+'.png',Buffer.from(r.data,'base64')); };
  const check = async (name,expression) => { assert.ok(await evaluate(`Boolean(${expression})`),name);results.push(name); };
  const navigate = async path => {await call('Page.navigate',{url:base+path});await waitFor(`location.pathname===${JSON.stringify(path)} && document.readyState==='complete' && document.querySelector('.alpha-tag')?.textContent===${JSON.stringify(version)}`);};
  await call('Runtime.enable');await call('Network.enable');await call('Page.enable');
  for(const width of [375,390,768,1440]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width<600});
    await navigate('/');
    await check(`${width}: pet patterns wording`, `document.querySelector('#pets-reference-title').textContent==='Pet patterns'`);
    await check(`${width}: homepage hierarchy`, `document.querySelector('main').firstElementChild.classList.contains('rescue-hero') && document.querySelector('#earth-title') && document.querySelector('#space-title')`);
    await check(`${width}: seven locked cards`, `document.querySelectorAll('[data-region-locked]').length===7 && !document.querySelector('[data-region-locked] a')`);
    await check(`${width}: version visible`, `getComputedStyle(document.querySelector('.alpha-tag')).display!=='none' && document.querySelector('.alpha-tag').getBoundingClientRect().width>0`);
    await check(`${width}: homepage overflow`, `document.documentElement.scrollWidth<=innerWidth`);await shot('home-'+width);
    await evaluate(`document.querySelector('.pets-reference').scrollIntoView({block:'center',behavior:'instant'})`);await shot('pet-home-area-'+width);
    await navigate('/pets');
    await check(`${width}: pets page patterns`, `document.querySelectorAll('[data-pet-species]').length===8 && document.querySelectorAll('[data-pattern-occupied="true"]').length===40`);
    await check(`${width}: coherent pattern spacing`, `(()=>{const cells=document.querySelectorAll('.pet-pattern span');const a=cells[0].getBoundingClientRect(),b=cells[1].getBoundingClientRect();return Math.abs(b.left-a.right-2)<.1 && Math.abs(a.width-a.height)<.1;})()`);
    await check(`${width}: source tile styling`, `(()=>{const f=document.querySelector('.pet-tile-frame'),img=f.querySelector('img');return getComputedStyle(f).backgroundColor==='rgba(0, 0, 0, 0)' && getComputedStyle(f).borderTopWidth==='0px' && getComputedStyle(img).padding==='0px' && getComputedStyle(img).filter==='none' && img.naturalWidth===116 && img.naturalHeight===116;})()`);
    await check(`${width}: pet page link palette`, `getComputedStyle(document.querySelector('.pets-page .back-link')).color==='rgb(210, 174, 223)'`);
    await check(`${width}: purple pattern palette`, `getComputedStyle(document.querySelector('[data-pattern-occupied=true]')).backgroundColor==='rgb(172, 131, 190)' && getComputedStyle(document.querySelector('.pet-reference-card')).backgroundColor==='rgb(20, 17, 22)'`);
    await check(`${width}: tiles loaded`, `[...document.querySelectorAll('[data-pet-art=tile]')].length===8 && [...document.querySelectorAll('[data-pet-art=tile]')].every(img=>img.complete && img.naturalWidth>0)`);
    await check(`${width}: pets overflow`, `document.documentElement.scrollWidth<=innerWidth`);await shot('pets-'+width);
    await navigate('/rescue');
    await check(`${width}: pet initially collapsed`, `!document.querySelector('.pet-disclosure').open && document.querySelector('.pet-current strong').textContent==='None'`);
    await evaluate(`document.querySelector('.pet-disclosure-summary').focus()`);await key('Enter','Enter',13);
    await check(`${width}: keyboard disclosure opens`, `document.querySelector('.pet-disclosure').open`);
    await check(`${width}: pet keyboard focus violet`, `document.querySelector('.pet-disclosure-summary').matches(':focus-visible') && getComputedStyle(document.querySelector('.pet-disclosure-summary')).outlineColor==='rgb(210, 174, 223)'`);
    await key('Enter','Enter',13);
    await click('.rescue-region.region-farm');await waitFor(`document.querySelectorAll('.rescue-animal-option').length===6`);
    await check(`${width}: compact pet row`, `document.querySelector('.optional-pet-section').getBoundingClientRect().height<=76`);
    await shot('pet-collapsed-none-'+width);await click('.pet-disclosure-summary');await evaluate(`document.querySelector('.pet-disclosure-content').scrollIntoView({block:'center',behavior:'instant'})`);await shot('pet-options-'+width);await click('[data-pet-id="rabbit"]');
    await check(`${width}: pet-only rescue is valid`, `!document.querySelector('.rescue-primary').disabled`);
    await click('.pet-disclosure-summary');await click('.rescue-pet-option');
    const animalIds=await evaluate(`[...document.querySelectorAll('.rescue-animal-option')].map(e=>e.dataset.animalId)`);
    for(const id of animalIds.slice(0,3)) await click(`[data-animal-id="${id}"]`);
    await check(`${width}: pets disabled with three animals`, `[...document.querySelectorAll('[data-pet-id]')].every(e=>e.disabled)`);
    await click(`[data-animal-id="${animalIds[2]}"]`);await click('.pet-disclosure-summary');await click('[data-pet-id="rabbit"]');
    await check(`${width}: pet choice collapses and returns focus`, `!document.querySelector('.pet-disclosure').open && document.querySelector('.pet-current strong').textContent==='Rabbit' && document.activeElement.matches('.pet-disclosure-summary')`);
    await check(`${width}: animal count wording follows pet selection`, `document.querySelector('#rescue-animals-heading').parentElement.nextElementSibling.textContent.includes('0-2')`);
    await check(`${width}: third animal disabled with pet`, `document.querySelector('[data-animal-id="${animalIds[2]}"]').disabled`);
    await check(`${width}: pet focus and selected identity`, `getComputedStyle(document.querySelector('.pet-current')).color==='rgb(210, 174, 223)' && document.querySelector('.pet-disclosure').dataset.petSelected==='true'`);
    await evaluate(`document.querySelector('.rescue-start-row').scrollIntoView({block:'end',behavior:'instant'})`);await shot('setup-'+width);
    await click('.pet-disclosure-summary');await check(`${width}: selected pet checkmark`, `document.querySelector('[data-pet-id=rabbit][aria-pressed=true] .pet-choice-check')`);await evaluate(`document.querySelector('.pet-disclosure-content').scrollIntoView({block:'center',behavior:'instant'})`);await shot('pet-selected-options-'+width);await click('.pet-disclosure-summary');
    await check(`${width}: primary CTA size`, `document.querySelector('.rescue-start-cta').getBoundingClientRect().height>=58 && getComputedStyle(document.querySelector('.rescue-start-cta')).fontSize==='14px'`);
    await evaluate(`document.querySelector('.rescue-start-cta').focus()`);await key('Enter','Enter',13);await waitFor(`document.querySelector('[data-recommended=true]')`);
    await check(`${width}: pet roster`, `document.querySelectorAll('.rescue-roster-animal').length===3 && document.querySelector('.rescue-selected-roster').textContent.includes('Rabbit')`);
    await check(`${width}: live overflow`, `document.documentElement.scrollWidth<=innerWidth`);
    const first=await evaluate(`Number(document.querySelector('[data-recommended=true]').dataset.cellIndex)`);
    await click('[data-recommended=true]');await waitFor(`document.querySelector('[role=dialog]')`);
    await check(`${width}: pet result option`, `!!document.querySelector('[data-animal-id="pet:rabbit"]')`);
    await check(`${width}: pet result theme is scoped`, `document.querySelector('[data-animal-id=\"pet:rabbit\"]').dataset.participantKind==='pet' && getComputedStyle(document.querySelector('[data-animal-id=\"pet:rabbit\"]')).backgroundColor==='rgb(20, 17, 22)' && getComputedStyle(document.querySelector('.rescue-result-empty')).backgroundColor==='rgb(26, 37, 28)'`);
    await check(`${width}: empty receives focus`, `document.activeElement.classList.contains('rescue-result-empty')`);
    await evaluate(`document.querySelector('[data-animal-id=\"pet:rabbit\"]').focus()`);await check(`${width}: pet result keyboard focus violet`, `document.activeElement.dataset.participantKind==='pet' && getComputedStyle(document.activeElement).outlineColor==='rgb(210, 174, 223)'`);await shot('selector-'+width);
    if(width<600) await check(`${width}: mobile tray anchored`, `Math.abs(document.querySelector('[role=dialog]').getBoundingClientRect().bottom-innerHeight)<2`);
    await key('Tab','Tab',9);await key('Tab','Tab',9);await key('Tab','Tab',9);await key('Tab','Tab',9);
    await check(`${width}: focus trapped`, `document.querySelector('[role=dialog]').contains(document.activeElement)`);
    await key('Escape','Escape',27);await waitFor(`!document.querySelector('[role=dialog]')`);
    await check(`${width}: focus restored`, `document.activeElement.dataset.cellIndex==='${first}'`);
    await click('[data-recommended=true]');await click('.rescue-result-empty');await waitFor(`document.querySelector('[data-cell-index="${first}"]').dataset.cellState==='empty'`);
    await check(`${width}: opened excluded`, `document.querySelector('[data-cell-index="${first}"]').disabled && document.querySelector('[data-recommended=true]').dataset.cellIndex!=='${first}'`);
    await click('.rescue-board-actions button:first-child');await waitFor(`document.querySelector('[data-recommended=true]')?.dataset.cellIndex==='${first}'`);
    await click('[data-recommended=true]');await waitFor(`document.querySelector('[role=dialog]')`);await key('3','Digit3',51);
    await waitFor(`document.querySelector('[data-cell-index="${first}"]').dataset.cellState==='animal'`);
    await check(`${width}: exact pet hit`, `document.querySelector('[data-cell-index="${first}"]').getAttribute('aria-label').includes('Rabbit')`);
    await waitFor(`getComputedStyle(document.querySelector('[data-cell-index="${first}"]')).backgroundColor==='rgb(40, 29, 47)'`);
    await check(`${width}: pet hit and roster theme`, `document.querySelector('[data-cell-index=\"${first}\"]').dataset.participantKind==='pet' && getComputedStyle(document.querySelector('[data-cell-index=\"${first}\"]')).backgroundColor==='rgb(40, 29, 47)' && document.querySelector('.rescue-roster-animal[data-participant-kind=pet]') && document.querySelector('.rescue-history li[data-participant-kind=pet]')`);
    await evaluate(`document.querySelector('.rescue-history').open=true`);await shot('pet-hit-'+width);
    await clickText('Reset rescue');await waitFor(`document.querySelector('[data-recommended=true]')?.dataset.cellIndex==='${first}'`);
    await clickText('Change setup');await waitFor(`document.querySelector('.rescue-setup')`);await click('.rescue-region.region-moon');
    await check(`${width}: region change clears animals and retains independent pet`, `!document.querySelector('.rescue-animal-option[aria-pressed=true]') && document.querySelector('[data-pet-id=rabbit]').getAttribute('aria-pressed')==='true' && !document.querySelector('.rescue-primary').disabled`);
    await shot('cleared-'+width);
  }
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await navigate('/');
  await check('reduced motion: hero animation disabled', `getComputedStyle(document.querySelector('.demo-recommended')).animationName==='none'`);
  await evaluate(`document.querySelector('.hero-start').focus()`);await key('Enter','Enter',13);await waitFor(`location.pathname==='/rescue'`);
  await check('hero CTA keyboard navigation', `location.pathname==='/rescue'`);
  await navigate('/pets');await evaluate(`document.querySelector('[data-pet-art=tile]').dispatchEvent(new Event('error'))`);await waitFor(`document.querySelector('.pet-art-placeholder')`);
  await check('failed tile gracefully falls back', `document.querySelector('.pet-art-placeholder').getAttribute('aria-label').includes('artwork unavailable')`);
  await check('fallback uses pet palette', `getComputedStyle(document.querySelector('.pet-art-placeholder')).color==='rgb(181, 166, 189)'`);await shot('pet-fallback');
  fs.writeFileSync(output+'/browser-results.json',JSON.stringify({checks:results.length,results,errors},null,2));
  socket.close();assert.deepEqual(errors,[]);console.log('Passed '+results.length+' browser checks.');
})().catch(error=>{console.error(error);process.exit(1);});
