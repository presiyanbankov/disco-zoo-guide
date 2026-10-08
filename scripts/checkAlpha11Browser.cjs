/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Chrome CDP QA. */
const fs = require('node:fs');
require('tsx/cjs');
const { rarityPriorityStrategy, DEFAULT_RARITY_PRIORITIES } = require('../src/solver/dynamic/rescueStrategy.ts');
const { ANIMALS } = require('../src/data/animals.ts');
const { PET_SPECIES } = require('../src/data/pets.ts');
const { animalParticipant, petParticipant } = require('../src/components/rescue/rescueParticipants.ts');
const { analyzeDynamicRescue, createDynamicRescueState, applyObservation, undoObservation, resetObservations, getPossibleWorlds } = require('../src/solver/dynamic/dynamicRescueSolver.ts');
const assert = require('node:assert/strict');
const version = fs.readFileSync('src/components/layout/siteVersion.ts','utf8').match(/SITE_VERSION = "([^"]+)"/)[1];
const base = process.env.ALPHA11_QA_URL || 'http://localhost:3000';
const debug = 'http://localhost:9242';
const output = process.env.ALPHA11_QA_OUTPUT || 'public/game/experiments/alpha11';
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


  for(const width of [375,390,768,1440]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width<600});
    await navigate('/rescue');
    await check(`${width}: empty setup cannot start`, `document.querySelector('.rescue-start-cta').disabled`);
    await check(`${width}: no region required for pet choices`, `!document.querySelector('.rescue-region[aria-pressed=true]') && [...document.querySelectorAll('[data-pet-id]')].every(e=>!e.disabled)`);
    await click('.pet-disclosure-summary');await click('[data-pet-id=rabbit]');
    await check(`${width}: pet-only Start enabled without region`, `!document.querySelector('.rescue-start-cta').disabled && !document.querySelector('.rescue-region[aria-pressed=true]') && !document.querySelector('.rescue-animal-option')`);
    await click('.pet-disclosure-summary');await click('[data-pet-id=bird]');
    await check(`${width}: pet species selection remains singular`, `document.querySelectorAll('[data-pet-id][aria-pressed=true]').length===1 && document.querySelector('.pet-current strong').textContent==='Bird'`);
    await click('.pet-disclosure-summary');await click('[data-pet-id=rabbit]');
    await click('[data-strategy=rarity-priority]');
    await check(`${width}: production wording renamed`, `document.querySelector('[data-strategy=rarity-priority]').textContent.includes('Rarity Priority') && !document.body.textContent.includes('Rarity First')`);
    await check(`${width}: four groups sixteen discrete values`, `document.querySelectorAll('.priority-values[role=radiogroup]').length===4 && document.querySelectorAll('.priority-values [role=radio]').length===16 && !document.querySelector('input[type=range]')`);
    for (const [category,value] of Object.entries(DEFAULT_RARITY_PRIORITIES)) await check(`${width}: ${category} default ${value}`, `document.querySelector('[data-priority-category=${category}] [aria-checked=true]').dataset.priorityValue==='${value}'`);
    let priorities={...DEFAULT_RARITY_PRIORITIES}, strategy=rarityPriorityStrategy(priorities), state=null;
    const priority = async (category,value) => {
      await click(`[data-priority-category=${category}] [data-priority-value="${value}"]`);
      priorities={...priorities,[category]:value};strategy=rarityPriorityStrategy(priorities);
      await waitFor(`document.querySelector('[data-priority-category=${category}] [aria-checked=true]').dataset.priorityValue==='${value}'`);
      if(state) await verify('priority '+category+value);
    };
    for(const category of ['common','rare','mythical','pet']) for(const value of [1,2,3,4]) {
      await priority(category,value);
      await check(`${width}: ${category} selects ${value}`, `document.querySelector('[data-priority-category=${category}] [data-priority-value="${value}"]').getAttribute('aria-checked')==='true' && document.querySelector('[data-priority-category=${category}] .priority-check')`);
    }
    for(const category of ['common','rare','mythical','pet']) {
      await evaluate(`document.querySelector('[data-priority-category=${category}] [aria-checked=true]').focus()`);
      await key('Home','Home',36);await waitFor(`document.activeElement.dataset.priorityValue==='1'`);
      await key('ArrowRight','ArrowRight',39);await waitFor(`document.activeElement.dataset.priorityValue==='2'`);
      await key('End','End',35);await waitFor(`document.activeElement.dataset.priorityValue==='4'`);
      await key('ArrowRight','ArrowRight',39);await waitFor(`document.activeElement.dataset.priorityValue==='1'`);
      await key('ArrowLeft','ArrowLeft',37);await waitFor(`document.activeElement.dataset.priorityValue==='4'`);
      priorities={...priorities,[category]:4};strategy=rarityPriorityStrategy(priorities);
      await check(`${width}: ${category} keyboard wrap/home/end and focus`, `document.activeElement.getAttribute('aria-checked')==='true' && getComputedStyle(document.activeElement).outlineStyle!=='none' && document.querySelectorAll('.priority-values [tabindex="0"]').length===4`);
    }
    await evaluate(`document.querySelector('[data-priority-category=common] [aria-checked=true]').focus()`);await key('Tab','Tab',9);
    await check(`${width}: Tab advances to next priority group`, `document.activeElement.closest('[data-priority-category]').dataset.priorityCategory==='rare'`);
    for(const [category,value] of Object.entries(DEFAULT_RARITY_PRIORITIES)) await priority(category,value);
    await evaluate(`document.querySelector('.rarity-priority-controls').scrollIntoView({block:'center',behavior:'instant'})`);await shot('priority-setup-'+width);
    let participants=[petParticipant(PET_SPECIES.find(p=>p.id==='rabbit'))];
    state=createDynamicRescueState(participants);
    const verify = async label => {
      const expected=analyzeDynamicRescue(state,strategy);
      await waitFor(`document.querySelector('.rescue-live')?.dataset.rescueStatus===${JSON.stringify(expected.status)} && ${expected.recommendation?`document.querySelector('[data-recommended=true]')?.dataset.cellIndex==='${expected.recommendation.cellIndex}'`:`!document.querySelector('[data-recommended=true]')`}`);
      await check(`${width}: ${label} real recommendation/worlds/history`, `Number(document.querySelectorAll('.rescue-metrics dd')[1].textContent.replaceAll(',',''))===${expected.worldCount} && Number(document.querySelectorAll('.rescue-metrics dd')[2].textContent)===${state.observations.length}`);
      await check(`${width}: ${label} retains participants`, `document.querySelectorAll('.rescue-roster-animal').length===${participants.length}`);
      if(strategy.type==='rarity-priority') await check(`${width}: ${label} summary`, `document.querySelector('.strategy-feedback').textContent.includes('C${priorities.common}') && document.querySelector('.strategy-feedback').textContent.includes('R${priorities.rare}') && document.querySelector('.strategy-feedback').textContent.includes('M${priorities.mythical}') && document.querySelector('.strategy-feedback').textContent.includes('P${priorities.pet}')`);
    };
    let targetId='';
    const mode=async type=>{strategy=type==='target'?{type,participantId:targetId}:type==='rarity-priority'?rarityPriorityStrategy(priorities):{type};await click(`[data-strategy=${type}]`);await verify(type);};
    const report=async(cellIndex,id)=>{await click(`[data-cell-index="${cellIndex}"]`);await waitFor(`document.querySelector('[role=dialog]')`);await click(id?`[data-animal-id="${id}"]`:'.rescue-result-empty');state=applyObservation(state,id?{type:'hit',cellIndex,participantId:id}:{type:'empty',cellIndex});await waitFor(`!document.querySelector('[role=dialog]')`);await verify('report');};
    await click('.rescue-start-cta');await verify('pet-only start');
    await check(`${width}: pet-only live heading`, `document.querySelector('#live-rescue-title').textContent==='Pet rescue'`);
    await mode('balanced');await mode('finish-found');await mode('target');
    await check(`${width}: pet-only target required and only pet listed`, `document.querySelectorAll('[data-target-id]').length===1 && document.querySelector('.rescue-live').dataset.rescueStatus==='target-required'`);
    targetId='pet:rabbit';strategy={type:'target',participantId:targetId};await click('[data-target-id="pet:rabbit"]');await verify('pet target');
    await mode('balanced');const emptyCell=analyzeDynamicRescue(state).recommendation.cellIndex;await report(emptyCell,null);
    await mode('rarity-priority');await priority('pet',4);
    await check(`${width}: live priority keeps observations and focus`, `Number(document.querySelectorAll('.rescue-metrics dd')[2].textContent)===1 && document.querySelector('[data-cell-index="${emptyCell}"]').disabled && document.activeElement.dataset.priorityValue==='4'`);
    const hitCell=getPossibleWorlds(state)[0].participants[0].cells[0];await report(hitCell,'pet:rabbit');await mode('finish-found');
    await check(`${width}: pet-only found priority visible`, `document.querySelector('[data-prioritized=true] .participant-priority').textContent.includes('FOUND')`);
    await mode('rarity-priority');await priority('common',2);await priority('rare',3);await priority('mythical',4);await priority('pet',3);
    await evaluate(`document.querySelector('.strategy-live').scrollIntoView({block:'start',behavior:'instant'})`);await shot('priority-live-'+width);
    await click('.rescue-board-actions button:first-child');state=undoObservation(state);await verify('undo config preserved');
    await clickText('Reset rescue');state=resetObservations(state);await verify('reset config preserved');
    const cells=getPossibleWorlds(state)[0].participants[0].cells;
    for(const cellIndex of cells) await report(cellIndex,'pet:rabbit');
    await check(`${width}: pet-only completion`, `document.querySelector('.rescue-live').dataset.rescueStatus==='complete' && !document.querySelector('[data-recommended=true]')`);
    await evaluate(`document.querySelector('.dynamic-rescue-grid').scrollIntoView({block:'center',behavior:'instant'})`);await shot('pet-only-complete-'+width);
    await clickText('Reset rescue');state=resetObservations(state);await verify('reset after completion');
    let misses=0;
    while(analyzeDynamicRescue(state,strategy).status==='ready' && misses++<25) await report(analyzeDynamicRescue(state,strategy).recommendation.cellIndex,null);
    await check(`${width}: pet-only contradiction remains recoverable`, `document.querySelector('[role=alert]').textContent.includes('inconsistent') && !document.querySelector('[data-recommended=true]')`);
    await priority('pet',2);await check(`${width}: config cannot hide contradiction`, `document.querySelector('.rescue-live').dataset.rescueStatus==='contradiction'`);
    await click('.rescue-board-actions button:first-child');state=undoObservation(state);await verify('undo contradiction');
    await clickText('Reset rescue');state=resetObservations(state);await verify('reset contradiction');
    await clickText('Change setup');state=null;await waitFor(`document.querySelector('.rescue-setup')`);
    await click('.rescue-region.region-farm');
    await check(`${width}: adding region retains pet-only selection`, `document.querySelector('.pet-current strong').textContent==='Rabbit' && !document.querySelector('.rescue-start-cta').disabled`);
    await click('[data-animal-id=pig]');await click('[data-animal-id=unicorn]');
    await check(`${width}: pet allows two animals and disables third`, `document.querySelectorAll('.rescue-animal-option[aria-pressed=true]').length===2 && document.querySelector('[data-animal-id=cow]').disabled`);
    await click('[data-animal-id=pig]');await click('[data-animal-id=unicorn]');
    await check(`${width}: removing all animals remains valid pet-only`, `!document.querySelector('.rescue-start-cta').disabled`);
    await click('.pet-disclosure-summary');await click('.rescue-pet-option');
    await check(`${width}: removing only pet leaves incomplete setup`, `document.querySelector('.rescue-start-cta').disabled`);
    await click('.pet-disclosure-summary');await click('[data-pet-id=rabbit]');await click('[data-animal-id=pig]');await click('[data-animal-id=unicorn]');
    participants=[animalParticipant(ANIMALS.find(a=>a.regionId==='farm'&&a.id==='pig')),animalParticipant(ANIMALS.find(a=>a.regionId==='farm'&&a.id==='unicorn')),petParticipant(PET_SPECIES.find(p=>p.id==='rabbit'))];
    state=createDynamicRescueState(participants);strategy={type:'balanced'};targetId='';
    await click('.rescue-start-cta');await verify('animal+pet start');await mode('rarity-priority');
    for(const [category,value] of Object.entries({common:1,rare:1,mythical:4,pet:1})) await priority(category,value);
    const previous=analyzeDynamicRescue(state,strategy).recommendation.cellIndex;
    await priority('mythical',1);await priority('pet',4);
    const next=analyzeDynamicRescue(state,strategy).recommendation.cellIndex;
    await check(`${width}: custom pet priority changes mixed recommendation`, `document.querySelector('[data-recommended=true]').dataset.cellIndex==='${next}' && ${next!==previous}`);
    const observed=getPossibleWorlds(state)[0].participants.find(p=>p.participantId==='pet:rabbit').cells[0];await report(observed,'pet:rabbit');
    const worldCount=analyzeDynamicRescue(state,strategy).worldCount;await priority('pet',1);await priority('mythical',4);
    await check(`${width}: mixed config change preserves worlds and hit`, `Number(document.querySelectorAll('.rescue-metrics dd')[1].textContent.replaceAll(',',''))===${worldCount} && Number(document.querySelectorAll('.rescue-metrics dd')[2].textContent)===1 && document.querySelector('[data-cell-index="${observed}"]').disabled`);
    await evaluate(`document.querySelector('.strategy-live').scrollIntoView({block:'start',behavior:'instant'})`);await shot('priority-mixed-'+width);
    await check(`${width}: no horizontal overflow`, `document.documentElement.scrollWidth<=innerWidth`);
  }
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await check('priority controls respect reduced motion', `getComputedStyle(document.querySelector('.priority-values button')).transitionDuration==='0s'`);
  fs.writeFileSync(output+'/alpha11-browser-results.json',JSON.stringify({version,checks:results.length,results,errors},null,2));
  socket.close();assert.deepEqual(errors,[]);console.log('Passed '+results.length+' ALPHA 11 browser checks.');
})().catch(error=>{console.error(error);process.exit(1);});
