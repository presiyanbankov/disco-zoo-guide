/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Chrome CDP QA. */
const fs = require('node:fs');
require('tsx/cjs');
const { REGION_PRESENTATION } = require('../src/components/regions/regionPresentation.ts');
const assert = require('node:assert/strict');
const { ANIMALS } = require('../.next/dynamic-component-check/data/animals.js');
const solver = require('../.next/dynamic-component-check/solver/dynamic/dynamicRescueSolver.js');
const createState = animals => solver.createDynamicRescueState(animals.map(a => ({id: `animal:${a.regionId}:${a.id}`, kind: 'animal', pattern: a.pattern})));
const { SITE_VERSION } = require('../.next/dynamic-component-check/components/layout/siteVersion.js');
const base = process.env.HQ_QA_URL || 'http://localhost:3108';
const debug = process.env.HQ_QA_CDP || 'http://localhost:9241';
const output = 'public/game/experiments/dynamic-rescue';
fs.mkdirSync(output, {recursive:true});

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
      if (await evaluate(expression)) return;
      await new Promise(r => setTimeout(r, 100));
    }
    throw Error('Timed out: ' + expression);
  };
  const go = async () => {
    await call('Page.navigate', {url:base+'/rescue'});
    await waitFor(`location.pathname==='/rescue' && document.readyState==='complete' && document.querySelectorAll('.rescue-region').length===${REGION_PRESENTATION.length}`);
    // Hydration is confirmed by the first real region click below.
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
  const screenshot = async filename => {
    await waitFor(`!document.querySelector('.rescue-result-selector') || document.querySelector('.rescue-result-selector').getAnimations().every(a=>a.playState==='finished')`);
    const shot = await call('Page.captureScreenshot', {format:'png'});
    fs.writeFileSync(output+'/'+filename, Buffer.from(shot.data,'base64'));
  };
  const verify = async state => {
    const expected = solver.analyzeDynamicRescue(state);
    await waitFor(`document.querySelector('.rescue-live')?.dataset.rescueStatus===${JSON.stringify(expected.status)} && Number(document.querySelectorAll('.rescue-metrics dd')[2]?.textContent)===${state.observations.length}`);
    const actual = await evaluate(`({status:document.querySelector('.rescue-live').dataset.rescueStatus, worlds:Number(document.querySelectorAll('.rescue-metrics dd')[1].textContent.replaceAll(',','')), recommended:document.querySelector('[data-recommended="true"]')?.dataset.cellIndex ?? null, overflow:document.documentElement.scrollWidth>innerWidth, opened:[...document.querySelectorAll('.dynamic-cell:disabled')].map(e=>Number(e.dataset.cellIndex))})`);
    assert.equal(actual.status, expected.status);
    assert.equal(actual.worlds, expected.worldCount);
    assert.equal(actual.recommended, expected.recommendation ? String(expected.recommendation.cellIndex) : null);
    assert.equal(actual.overflow, false);
    for (const observation of state.observations) assert.ok(actual.opened.includes(observation.cellIndex));
    if (expected.recommendation) assert.ok(!actual.opened.includes(expected.recommendation.cellIndex));
    return actual;
  };
  await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable');
  await call('Emulation.setFocusEmulationEnabled', {enabled:true});
  await call('Emulation.setDeviceMetricsOverride', {width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate', {url:base+'/'});
  await waitFor(`document.readyState==='complete' && !!document.querySelector('.rescue-teaser a[href="/rescue"]')`);
  await click('.rescue-teaser a[href="/rescue"]');
  await waitFor(`location.pathname==='/rescue' && document.querySelectorAll('.rescue-region').length===${REGION_PRESENTATION.length} && document.documentElement.dataset.routeTransition!=='active'`);
  for (const width of [375,390,768,1440]) {
    await call('Emulation.setDeviceMetricsOverride', {width,height:1000,deviceScaleFactor:1,mobile:width<768});
    for (const region of ['farm','outback','savanna','northern','polar','jungle','moon']) {
      await go();
      await click('.rescue-region.region-'+region);
      await waitFor(`document.querySelectorAll('.rescue-animal-option').length===6`);
      assert.ok(await evaluate(`[...document.querySelectorAll('.rescue-region')].every(e=>{const r=e.getBoundingClientRect(),n=e.querySelector('.rescue-region-number').getBoundingClientRect();return n.top>=r.top&&n.bottom<=r.bottom&&n.left>=r.left&&n.right<=r.right;})`),'Region numbers must remain inside their cards');
      const animals = ANIMALS.filter(a=>a.regionId===region&&!a.hidden&&a.rarity!=='timeless').slice(0,3);
      for (let count = 1; count <= 3; count++) {
        await click(`[data-animal-id="${animals[count-1].id}"]`);
        await waitFor(`document.querySelectorAll('.rescue-animal-option[aria-pressed="true"]').length===${count}`);
        if (count === 3) assert.equal(await evaluate(`document.querySelectorAll('.rescue-animal-option:disabled').length`),3);
        if (count===3 && region==='farm' && (width===390||width===1440)) {
          await waitFor(`[...document.querySelectorAll('.rescue-animal-options img')].every(i=>i.complete&&i.naturalWidth>0)`);
          assert.ok(await evaluate(`[...document.querySelectorAll('.rescue-animal-options img')].every(i=>{const r=i.getBoundingClientRect(),p=i.parentElement.getBoundingClientRect();return i.dataset.artSource==='hq'&&r.left>=p.left&&r.right<=p.right&&r.height<=p.height;})`));
          await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
          await screenshot('setup-'+width+'.png');
        }
        await click('.rescue-primary');
        await waitFor(`!!document.querySelector('.rescue-live')`);
        await verify(createState(animals.slice(0,count)));
        if (count < 3) { await clickText('Change setup'); await waitFor(`!!document.querySelector('.rescue-setup')`); }
      }
      let state = createState(animals);
      const score = solver.analyzeDynamicRescue(state).scores.find(s=>s.hitProbability<1 && s.hitProbability>0);
      await click(`[data-cell-index="${score.cellIndex}"]`);
      await waitFor(`!!document.querySelector('[role="dialog"]')`);
      await waitFor(`document.querySelector('.rescue-result-selector').getBoundingClientRect().bottom <= innerHeight + 1`);
      const panel = await evaluate(`(()=>{const d=document.querySelector('.rescue-result-selector');const r=d.getBoundingClientRect();return{position:getComputedStyle(d).position,bottom:r.bottom,left:r.left,right:r.right,top:r.top,active:document.activeElement.className};})()`);
      assert.equal(panel.position,'fixed'); assert.ok(panel.left>=0 && panel.right<=width+1 && panel.top>=0);
      if(width<768) assert.ok(Math.abs(panel.bottom-1000)<=1,JSON.stringify({width,panel,error:'Mobile result tray must be anchored to the bottom'}));
      assert.ok(panel.active.includes('rescue-result-empty'));
      if(width===1440) await key('e','KeyE',69); else await click('.rescue-result-empty');
      state=solver.applyObservation(state,{type:'empty',cellIndex:score.cellIndex});
      await verify(state);
      const afterEmpty=state;
      const world=solver.getPossibleWorlds(state)[0];
      const hit=world.participants.find(a=>a.cells.some(c=>!state.observations.some(o=>o.cellIndex===c)));
      const hitCell=hit.cells.find(c=>!state.observations.some(o=>o.cellIndex===c));
      await click(`[data-cell-index="${hitCell}"]`);
      await waitFor(`!!document.querySelector('[role="dialog"]')`);
      if(width===1440) {
        const number=animals.findIndex(a=>`animal:${a.regionId}:${a.id}`===hit.participantId)+1;
        await key(String(number),'Digit'+number,48+number);
      } else await click(`.rescue-result-animal[data-animal-id="${hit.participantId}"]`);
      state=solver.applyObservation(state,{type:'hit',cellIndex:hitCell,participantId:hit.participantId});
      await verify(state);
      assert.equal(await evaluate(`document.querySelector('[data-cell-index="${hitCell}"]').dataset.cellState`),'animal');
      await waitFor(`[...document.querySelectorAll('.rescue-live img')].every(i=>i.complete&&i.naturalWidth>0)`);
      assert.ok(await evaluate(`[...document.querySelectorAll('.rescue-live img')].every(i=>i.dataset.artSource==='hq'&&getComputedStyle(i).imageRendering==='pixelated')`));
      if(width===390||width===1440) {
        await evaluate(`document.querySelector('.rescue-live-board-panel').scrollIntoView({block:'center',behavior:'instant'})`);
        await screenshot(region+'-live-'+width+'.png');
        const unopened=solver.analyzeDynamicRescue(state).recommendation.cellIndex;
        await click(`[data-cell-index="${unopened}"]`);
        await waitFor(`!!document.querySelector('[role="dialog"]')`);
        await screenshot(region+'-selector-'+width+'.png');
        await key('Escape','Escape',27);
        await waitFor(`!document.querySelector('[role="dialog"]')`);
      }
      await clickText('↶ Undo last result'); await verify(afterEmpty);
      await clickText('Reset rescue'); await verify(createState(animals));
      results.push({width,region,selectionCounts:[1,2,3],empty:true,animalHit:true,undo:true,reset:true,panel});
    }
  }
  // Switching regions clears selection, rather than carrying cross-region animals.
  await go(); await click('.rescue-region.region-farm');
  await waitFor(`document.querySelectorAll('.rescue-animal-option').length===6`);
  await click('.rescue-animal-option'); await click('.rescue-region.region-moon');
  await waitFor(`document.querySelectorAll('.rescue-animal-option[aria-pressed="true"]').length===0 && document.querySelector('.rescue-primary').disabled`);
  assert.ok(await evaluate(`[...document.querySelectorAll('.rescue-animal-option')].every(e=>['moonkey','lunar-tick','tribble','moonicorn','luna-moth','jade-rabbit'].includes(e.dataset.animalId))`));
  // Inconsistent reports must recover via undo without losing the rescue.
  await click('.rescue-region.region-farm'); await waitFor(`!!document.querySelector('[data-animal-id="pig"]')`);
  await click('[data-animal-id="pig"]'); await click('.rescue-primary');
  await waitFor(`!!document.querySelector('.rescue-live')`);
  for(const cell of [0,24]) {
    await click(`[data-cell-index="${cell}"]`);
    await waitFor(`!!document.querySelector('[role="dialog"]')`);
    await click('.rescue-result-animal');
    await waitFor(`!document.querySelector('[role="dialog"]')`);
  }
  await waitFor(`document.querySelector('.rescue-live').dataset.rescueStatus==='contradiction' && !!document.querySelector('[role="alert"]')`);
  await screenshot('contradiction-desktop.png');
  await clickText('↶ Undo last result');
  await waitFor(`document.querySelector('.rescue-live').dataset.rescueStatus==='ready'`);
  // Keyboard dialog focus trap, Escape restoration and reduced motion.
  await evaluate(`document.querySelector('[data-recommended="true"]').focus()`);
  await key('Enter','Enter',13); await waitFor(`!!document.querySelector('[role="dialog"]')`);
  await evaluate(`document.querySelector('.rescue-result-animal').focus()`);
  await key('Tab','Tab',9);
  assert.equal(await evaluate(`document.activeElement.className`),'rescue-close');
  await key('Escape','Escape',27); await waitFor(`!document.querySelector('[role="dialog"]')`);
  assert.ok(await evaluate(`document.activeElement.matches('.dynamic-cell[data-recommended="true"]')`));
  const pig = ANIMALS.find(a=>a.id==='pig');
  for(const cell of pig.pattern.cells.map(c=>c.row*5+c.col).filter(c=>c!==0)) {
    await click(`[data-cell-index="${cell}"]`);
    await waitFor(`!!document.querySelector('[role="dialog"]')`);
    await click('.rescue-result-animal');
    await waitFor(`!document.querySelector('[role="dialog"]')`);
  }
  await waitFor(`document.querySelector('.rescue-live').dataset.rescueStatus==='complete' && !document.querySelector('[data-recommended="true"]')`);
  await clickText('↶ Undo last result');
  await waitFor(`document.querySelector('.rescue-live').dataset.rescueStatus==='ready'`);
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[data-recommended="true"]')).animationName`),'none');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[data-recommended="true"]')).transitionDuration`),'0s');
  assert.equal(await evaluate(`document.querySelector('.alpha-tag').textContent`),SITE_VERSION);
  assert.equal(errors.length,0,JSON.stringify(errors));
  const report={layouts:results.length,startedRescues:results.length*3,results,homepageNavigation:true,sameRegion:true,contradictionUndo:true,completion:true,keyboardFocusTrap:true,escapeFocusRestore:true,reducedMotion:true,version:SITE_VERSION,errors};
  fs.writeFileSync(output+'/browser-checks.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify({layouts:report.layouts,startedRescues:report.startedRescues,sameRegion:true,contradictionUndo:true,keyboard:true,reducedMotion:true,errors}));
  await call('Browser.close'); socket.close();
})().catch(e=>{console.error(e);process.exit(1);});
