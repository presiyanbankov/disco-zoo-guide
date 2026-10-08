/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Chrome CDP QA. */
const fs = require('node:fs');
require('tsx/cjs');
const { ANIMALS } = require('../src/data/animals.ts');
const { PET_SPECIES } = require('../src/data/pets.ts');
const { animalParticipant, petParticipant } = require('../src/components/rescue/rescueParticipants.ts');
const { analyzeDynamicRescue, createDynamicRescueState, applyObservation, undoObservation, resetObservations, getPossibleWorlds } = require('../src/solver/dynamic/dynamicRescueSolver.ts');
const assert = require('node:assert/strict');
const version = fs.readFileSync('src/components/layout/siteVersion.ts','utf8').match(/SITE_VERSION = "([^"]+)"/)[1];
const base = process.env.ALPHA10_QA_URL || 'http://localhost:3000';
const debug = 'http://localhost:9242';
const output = process.env.ALPHA10_QA_OUTPUT || 'public/game/experiments/alpha10';
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
  const shot = async name => { await waitFor(`[...document.querySelectorAll('.strategy-control,.dynamic-rescue-grid')].every(e=>e.getAnimations({subtree:true}).every(a=>a.playState==='finished'))`); await waitFor(`!document.querySelector('[role=dialog]') || document.querySelector('[role=dialog]').getAnimations().every(a=>a.playState==='finished')`); const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:name.startsWith('home') || name.startsWith('pets')});fs.writeFileSync(output+'/'+name+'.png',Buffer.from(r.data,'base64')); };
  const check = async (name,expression) => { assert.ok(await evaluate(`Boolean(${expression})`),name);results.push(name); };
  const navigate = async path => {await call('Page.navigate',{url:base+path});await waitFor(`location.pathname===${JSON.stringify(path)} && document.readyState==='complete' && document.querySelector('.alpha-tag')?.textContent===${JSON.stringify(version)}`);};
  await call('Runtime.enable');await call('Network.enable');await call('Page.enable');

  for (const width of [375,390,768,1440]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width<600});
    await navigate('/rescue');
    await check(`${width}: all four strategies and Balanced default`, `document.querySelectorAll('[data-strategy]').length===4 && document.querySelector('[data-strategy=balanced]').getAttribute('aria-pressed')==='true'`);
    await click('.rescue-region.region-farm');
    for (const id of ['pig','unicorn']) await click(`[data-animal-id="${id}"]`);
    await click('.pet-disclosure-summary');await click('[data-pet-id=rabbit]');
    const participants = [animalParticipant(ANIMALS.find(a=>a.regionId==='farm' && a.id==='pig')),animalParticipant(ANIMALS.find(a=>a.regionId==='farm' && a.id==='unicorn')),petParticipant(PET_SPECIES.find(p=>p.id==='rabbit'))];
    let state = createDynamicRescueState(participants), strategy={type:'balanced'};
    await evaluate(`document.querySelector('[data-strategy=target]').focus()`);await key('Enter','Enter',13);
    await check(`${width}: keyboard strategy activation`, `document.querySelector('[data-strategy=target]').getAttribute('aria-pressed')==='true' && document.activeElement.dataset.strategy==='target'`);
    await check(`${width}: setup target requires explicit selection`, `document.querySelector('.rescue-start-cta').disabled && document.querySelectorAll('[data-target-id]').length===3 && !document.querySelector('[data-target-id][aria-pressed=true]')`);
    await click('[data-target-id="pet:rabbit"]');
    await check(`${width}: setup pet target enables Start`, `!document.querySelector('.rescue-start-cta').disabled && document.querySelector('[data-target-id="pet:rabbit"]').getAttribute('aria-pressed')==='true'`);
    await evaluate(`document.querySelector('.strategy-control').scrollIntoView({block:'center',behavior:'instant'})`);await shot('strategy-setup-'+width);
    await click('[data-strategy=balanced]');await click('.rescue-start-cta');await waitFor(`document.querySelector('.rescue-live')`);
    const verify = async label => {
      const expected=analyzeDynamicRescue(state,strategy);
      await waitFor(`document.querySelector('.rescue-live').dataset.rescueStatus===${JSON.stringify(expected.status)} && ${expected.recommendation ? `document.querySelector('[data-recommended=true]')?.dataset.cellIndex==='${expected.recommendation.cellIndex}'` : `!document.querySelector('[data-recommended=true]')`}`);
      await check(`${width}: ${label} agrees with real scoring`, `Number(document.querySelectorAll('.rescue-metrics dd')[1].textContent.replaceAll(',',''))===${expected.worldCount} && Number(document.querySelectorAll('.rescue-metrics dd')[2].textContent)===${state.observations.length}`);
      await check(`${width}: ${label} preserves participants`, `document.querySelectorAll('.rescue-roster-animal').length===3 && ['Pig','Unicorn','Rabbit'].every(n=>document.querySelector('.rescue-selected-roster').textContent.includes(n))`);
      if(expected.recommendation) await check(`${width}: ${label} shows real any-hit probability`, `document.querySelector('.rescue-metrics dd').textContent==='${(expected.recommendation.hitProbability*100).toFixed(1)}%'`);
    };
    const mode = async type => {
      strategy=type==='target'?{type,participantId:lastTarget}:{type};
      await click(`[data-strategy=${type}]`);await verify(type);
      await check(`${width}: ${type} keeps control focus`, `document.activeElement.dataset.strategy===${JSON.stringify(type)}`);
    };
    let lastTarget='pet:rabbit';
    const target = async id => {lastTarget=id;strategy={type:'target',participantId:id};await click(`[data-target-id="${id}"]`);await verify('target '+id);};
    const report = async (cellIndex,participantId) => {
      await click(`[data-cell-index="${cellIndex}"]`);await waitFor(`document.querySelector('[role=dialog]')`);
      await click(participantId ? `[data-animal-id="${participantId}"]` : '.rescue-result-empty');
      state=applyObservation(state,participantId?{type:'hit',cellIndex,participantId}:{type:'empty',cellIndex});
      await waitFor(`!document.querySelector('[role=dialog]')`);await verify('report');
    };
    await verify('default Balanced');
    await mode('finish-found');await check(`${width}: no initial priority`, `!document.querySelector('[data-prioritized=true]') && document.querySelector('.strategy-feedback').textContent.includes('0 participants')`);
    await mode('target');await target(participants[0].id);await target('pet:rabbit');
    await mode('rarity-first');await check(`${width}: rarity helper`, `document.querySelector('.strategy-legend').textContent.includes('Common') && document.querySelector('.strategy-legend').textContent.includes('Pets')`);
    await mode('balanced');
    const cell = analyzeDynamicRescue(state).recommendation.cellIndex;
    const world = getPossibleWorlds(state)[0];
    const occupant = world.participants.find(p=>p.cells.includes(cell));
    await report(cell,occupant?.participantId);
    await mode('finish-found');
    await check(`${width}: found marker follows named hits`, `document.querySelectorAll('[data-prioritized=true]').length===${occupant?1:0} && ${occupant?`document.querySelector('.participant-priority').textContent.includes('FOUND')`:'true'}`);
    await evaluate(`document.querySelector('.strategy-live').scrollIntoView({block:'start',behavior:'instant'})`);await shot('strategy-found-'+width);
    await mode('target');await target(participants[0].id);await mode('rarity-first');await mode('balanced');
    await check(`${width}: observations survive all mode switches`, `Number(document.querySelectorAll('.rescue-metrics dd')[2].textContent)===1 && document.querySelector('[data-cell-index="${cell}"]').disabled`);
    await mode('finish-found');await click('.rescue-board-actions button:first-child');state=undoObservation(state);await verify('undo');
    await check(`${width}: undo removes found priority but keeps mode`, `!document.querySelector('[data-prioritized=true]') && document.querySelector('[data-strategy=finish-found]').getAttribute('aria-pressed')==='true'`);
    await mode('target');await target('pet:rabbit');
    const petCells=getPossibleWorlds(state)[0].participants.find(p=>p.participantId==='pet:rabbit').cells;
    for(const cellIndex of petCells) await report(cellIndex,'pet:rabbit');
    await check(`${width}: resolved target pauses without switching`, `document.querySelector('.rescue-live').dataset.rescueStatus==='target-resolved' && !document.querySelector('[data-recommended=true]') && document.querySelector('[data-target-id="pet:rabbit"]').getAttribute('aria-pressed')==='true' && document.querySelector('.rescue-status-note').textContent.includes('Target resolved')`);
    await evaluate(`document.querySelector('.strategy-live').scrollIntoView({block:'start',behavior:'instant'})`);await shot('strategy-resolved-'+width);
    await target(participants[1].id);await check(`${width}: another target resumes`, `document.querySelector('[data-recommended=true]')`);
    await mode('finish-found');await check(`${width}: pet priority marker`, `document.querySelector('.rescue-roster-animal[data-participant-kind=pet][data-prioritized=true] .participant-priority')`);
    await mode('rarity-first');
    await clickText('Reset rescue');state=resetObservations(state);await verify('reset');
    await check(`${width}: reset keeps current strategy`, `document.querySelector('[data-strategy=rarity-first]').getAttribute('aria-pressed')==='true'`);
    await mode('target');await check(`${width}: previous target restored explicitly`, `document.querySelector('[data-target-id="${participants[1].id}"]').getAttribute('aria-pressed')==='true'`);
    await mode('balanced');
    await check(`${width}: live overflow`, `document.documentElement.scrollWidth<=innerWidth`);
    await evaluate(`document.querySelector('[data-strategy=target]').focus()`);await key('Enter','Enter',13);
    strategy={type:'target',participantId:lastTarget};await verify('keyboard live change');
    await check(`${width}: visible focus on strategy`, `document.activeElement.dataset.strategy==='target' && getComputedStyle(document.activeElement).outlineStyle!=='none'`);
    await evaluate(`document.querySelector('.strategy-live').scrollIntoView({block:'start',behavior:'instant'})`);await shot('strategy-live-'+width);
    await check(`${width}: no broken displayed artwork`, `[...document.querySelectorAll('.strategy-targets img')].every(i=>i.complete && i.naturalWidth>0)`);
  }
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await check('strategy reduced motion', `getComputedStyle(document.querySelector('.strategy-options button')).transitionDuration==='0s'`);
  fs.writeFileSync(output+'/strategy-browser-results.json',JSON.stringify({version,checks:results.length,results,errors},null,2));
  socket.close();assert.deepEqual(errors,[]);console.log('Passed '+results.length+' strategy browser checks.');
})().catch(error=>{console.error(error);process.exit(1);});
