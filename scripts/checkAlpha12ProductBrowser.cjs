/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Chrome CDP QA. */
const fs = require('node:fs');
require('tsx/cjs');
const { resolveTargetStrategy, rarityFocusParticipantIds } = require('../src/solver/dynamic/rescueStrategy.ts');
const { ANIMALS } = require('../src/data/animals.ts');
const { PET_SPECIES } = require('../src/data/pets.ts');
const { animalParticipant, petParticipant } = require('../src/components/rescue/rescueParticipants.ts');
const { analyzeDynamicRescue, createDynamicRescueState, applyObservation, undoObservation, resetObservations, getPossibleWorlds } = require('../src/solver/dynamic/dynamicRescueSolver.ts');
const assert = require('node:assert/strict');
const version = fs.readFileSync('src/components/layout/siteVersion.ts','utf8').match(/SITE_VERSION = "([^"]+)"/)[1];
const base = process.env.ALPHA12_QA_URL || 'http://localhost:3109';
const debug = 'http://localhost:9242';
const output = process.env.ALPHA12_QA_OUTPUT || 'public/game/experiments/alpha12-product';
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
    for(const [path,name] of [['/','home'],['/regions/farm','region'],['/regions/farm/pig','animal']]) {
      await navigate(path);
      await check(`${width}: ${name} persistent primary CTA`, `document.querySelector('a.rescue-header-link')?.getAttribute('href')==='/rescue'&&document.querySelector('.rescue-header-link').getBoundingClientRect().height>=44&&getComputedStyle(document.querySelector('.rescue-header-link')).backgroundColor!=='rgba(0, 0, 0, 0)'`);
      await check(`${width}: ${name} header fits`, `document.documentElement.scrollWidth<=innerWidth&&document.querySelector('.rescue-header-link').getBoundingClientRect().right<=innerWidth`);
      await key('Tab','Tab',9);await evaluate(`document.querySelector('a.rescue-header-link').focus()`);
      await check(`${width}: ${name} CTA focus visible`, `getComputedStyle(document.activeElement).outlineStyle!=='none'`);
      await shot('header-'+name+'-'+width);
      await key('Enter','Enter',13);await waitFor(`location.pathname==='/rescue'&&document.querySelector('.rescue-setup')`);
      await check(`${width}: ${name} CTA route works and active marker`, `document.querySelector('.rescue-header-link[aria-current=page][data-active=true]')&&!document.querySelector('a.rescue-header-link')`);
    }
    await navigate('/rescue');
    await shot('rescue-setup-'+width);
    await check(`${width}: header brand and version avoid awkward wrapping`, `document.querySelector('.site-header .brand').getBoundingClientRect().height<=50&&document.querySelector('.alpha-tag').getBoundingClientRect().height<=30`);
    await click('.pet-disclosure-summary');await click('[data-pet-id=rabbit]');
    await check(`${width}: pet-only omits rarity and keeps Start`, `!document.querySelector('[data-strategy=rarity-focus]') && !document.querySelector('.rescue-start-cta').disabled`);
    await check(`${width}: no configurable controls or old label`, `!document.querySelector('.priority-values')&&!document.body.textContent.includes('Rarity Priority')&&document.querySelectorAll('[data-strategy]').length===3`);
    await evaluate(`document.querySelector('.strategy-control').scrollIntoView({block:'start',behavior:'instant'})`);await shot('pet-only-setup-'+width);
    await click('[data-strategy=target]');await click('[data-target-id="pet:rabbit"]');await click('.rescue-start-cta');
    let participants=[petParticipant(PET_SPECIES.find(p=>p.id==='rabbit'))];
    let state=createDynamicRescueState(participants), strategy={type:'target',participantId:'pet:rabbit'};
    const verify=async name=>{
      const r=analyzeDynamicRescue(state,strategy);
      await waitFor(`document.querySelector('.rescue-live')?.dataset.rescueStatus===${JSON.stringify(r.status)} && Number(document.querySelectorAll('.rescue-metrics dd')[2]?.textContent)===${state.observations.length}`);
      await check(`${width}: ${name} status`, `document.querySelector('.rescue-live').dataset.rescueStatus===${JSON.stringify(r.status)}`);
      await check(`${width}: ${name} worlds`, `Number(document.querySelectorAll('.rescue-metrics dd')[1].textContent.replaceAll(',',''))===${r.worldCount}`);
      if(r.recommendation) await check(`${width}: ${name} real recommendation`, `document.querySelector('[data-recommended=true]')?.dataset.cellIndex==='${r.recommendation.cellIndex}'`);
    };
    const report=async(cellIndex,participantId,keyboard=false)=>{
      await click(`[data-cell-index="${cellIndex}"]`);await waitFor(`document.querySelector('[role=dialog]')`);
      await check(`${width}: selector focus`, `document.activeElement.classList.contains('rescue-result-empty')`);
      if(keyboard) await key(participantId?String(participants.findIndex(p=>p.id===participantId)+1):'e',participantId?'Digit1':'KeyE',participantId?49:69);
      else await click(participantId?`.rescue-result-animal[data-animal-id="${participantId}"]`:'.rescue-result-empty');
      state=applyObservation(state,participantId?{type:'hit',cellIndex,participantId}:{type:'empty',cellIndex});
      strategy=resolveTargetStrategy(state,getPossibleWorlds(state),strategy);
      await verify('reported '+cellIndex);
    };
    await verify('pet-only initial');
    await check(`${width}: untouched board has no dead recovery controls`, `!document.querySelector('.rescue-board-actions')`);
    await evaluate(`document.querySelector('.rescue-live-board-panel').scrollIntoView({block:'start',behavior:'instant'})`);await shot('normal-active-'+width);
    // Exhaust empty results until contradiction, using real recommendations.
    while(analyzeDynamicRescue(state,strategy).status==='ready') await report(analyzeDynamicRescue(state,strategy).recommendation.cellIndex,null,true);
    await check(`${width}: contradiction clear message/focus`, `document.body.textContent.includes("Results don't match any possible layout.")&&document.activeElement.classList.contains('rescue-recovery-action')&&document.querySelector('[role=alert]')`);
    await evaluate(`document.querySelector('.rescue-live-board-panel').scrollIntoView({block:'start',behavior:'instant'})`);await shot('contradiction-'+width);
    await key('Enter','Enter',13);state=undoObservation(state);await verify('contradiction recovery');
    await check(`${width}: recovery clears alert and focuses board`, `!document.querySelector('.rescue-recovery-panel')&&document.activeElement.dataset.recommended==='true'`);
    await evaluate(`document.querySelector('.rescue-live-board-panel').scrollIntoView({block:'start',behavior:'instant'})`);await shot('contradiction-recovered-'+width);
    await clickText('Reset rescue');state=resetObservations(state);await verify('reset');
    const petWorld=getPossibleWorlds(state)[0];
    for(const cell of petWorld.participants[0].cells) await report(cell,'pet:rabbit',true);
    await check(`${width}: completion focused and announced`, `document.body.textContent.includes('RESCUE COMPLETE')&&document.activeElement.classList.contains('rescue-next-cta')&&document.querySelector('.rescue-completion-panel[role=status]')`);
    await evaluate(`document.querySelector('.rescue-live-board-panel').scrollIntoView({block:'start',behavior:'instant'})`);await shot('pet-complete-'+width);
    await check(`${width}: no redundant review action; completed board visible`, `![...document.querySelectorAll('button')].some(b=>b.textContent.includes('Review Board'))&&document.querySelectorAll('.dynamic-cell').length===25&&document.querySelector('.rescue-next-cta')&&getComputedStyle(document.querySelector('.dynamic-rescue-grid')).display!=='none'`);
    await click('.rescue-next-cta');
    await check(`${width}: next pet rescue clears selection without region`, `document.querySelector('.rescue-setup')&&!document.querySelector('.rescue-region[aria-pressed=true]')&&document.querySelector('.pet-current strong').textContent==='None'&&document.querySelector('.rescue-start-cta').disabled&&document.querySelector('[data-strategy=target][aria-pressed=true]')`);
    await click('.rescue-region.region-farm');await click('[data-animal-id=unicorn]');await click('[data-animal-id=pig]');
    await click('.pet-disclosure-summary');await click('[data-pet-id=rabbit]');
    await click('[data-strategy=rarity-focus]');
    await check(`${width}: tier intent helper`, `document.body.textContent.includes('Prioritize Mythical, then Rare, then Common')&&!document.body.textContent.includes('?1')&&!document.querySelector('.priority-values')`);
    await evaluate(`document.querySelector('.strategy-control').scrollIntoView({block:'start',behavior:'instant'})`);await shot('rarity-animal-pet-setup-'+width);
    await click('[data-strategy=target]');await click('[data-target-id="animal:farm:unicorn"]');await click('.rescue-start-cta');
    participants=[animalParticipant(ANIMALS.find(a=>a.regionId==='farm'&&a.id==='unicorn')),animalParticipant(ANIMALS.find(a=>a.regionId==='farm'&&a.id==='pig')),petParticipant(PET_SPECIES.find(p=>p.id==='rabbit'))];
    state=createDynamicRescueState(participants);strategy={type:'target',participantId:participants[0].id};
    const world=getPossibleWorlds(state)[0];
    await report(world.participants[0].cells[0],participants[0].id);
    await report(world.participants[1].cells[0],participants[1].id);
    await report(world.participants[2].cells[0],participants[2].id);
    await waitFor(`new Set([...document.querySelectorAll('.cell-animal')].map(e=>getComputedStyle(e).borderColor)).size===1`);
    await check(`${width}: all hit cells share state border`, `new Set([...document.querySelectorAll('.cell-animal')].map(e=>getComputedStyle(e).borderColor)).size===1&&![...document.querySelectorAll('.cell-animal')].some(e=>e.className.includes('animal-color-'))`);
    await evaluate(`document.querySelector('.rescue-live-board-panel').scrollIntoView({block:'start',behavior:'instant'})`);await shot('multiple-hits-'+width);
    // Manual target remains possible without clearing results.
    await click('[data-target-id="pet:rabbit"]');strategy={type:'target',participantId:'pet:rabbit'};await verify('manual pet target');
    await click('[data-target-id="animal:farm:unicorn"]');strategy={type:'target',participantId:'animal:farm:unicorn'};
    for(const cell of world.participants[0].cells.slice(1)) await report(cell,participants[0].id);
    await check(`${width}: target auto-advances in original selection order`, `document.querySelector('[data-target-id="animal:farm:pig"]').getAttribute('aria-pressed')==='true'&&document.querySelector('[data-target-id="animal:farm:unicorn"]').disabled&&document.querySelector('.rescue-target-transition[role=status]').textContent.includes('targeting Pig')`);
    await evaluate(`document.querySelector('.rescue-target-transition').scrollIntoView({block:'center',behavior:'instant'})`);await shot('target-auto-advance-'+width);
    for(const cell of world.participants[1].cells.slice(1)) await report(cell,participants[1].id);
    await check(`${width}: target auto-advances to pet`, `document.querySelector('[data-target-id="pet:rabbit"]').getAttribute('aria-pressed')==='true'`);
    for(const cell of world.participants[2].cells.slice(1)) await report(cell,participants[2].id);
    await evaluate(`document.querySelector('.rescue-live-board-panel').scrollIntoView({block:'start',behavior:'instant'})`);await shot('rescue-complete-'+width);
    await check(`${width}: successful effect state`, `document.querySelector('.rescue-live').dataset.rescueStatus==='complete'&&getComputedStyle(document.querySelector('.rescue-live-board-panel')).animationName==='rescue-success-pulse'`);
    await click('.rescue-next-cta');
    await check(`${width}: next rescue preserves region/mode clears participants`, `document.querySelector('.rescue-region.region-farm[aria-pressed=true]')&&document.querySelector('[data-strategy=target][aria-pressed=true]')&&!document.querySelector('.rescue-animal-option[aria-pressed=true]')&&document.querySelector('.pet-current strong').textContent==='None'&&document.querySelector('.rescue-start-cta').disabled`);
    await navigate('/rescue');await click('.rescue-region.region-northern');
    for(const id of ['skunk','moose','sasquatch'])await click(`[data-animal-id="${id}"]`);
    await click('[data-strategy=rarity-focus]');await click('.rescue-start-cta');
    participants=['skunk','moose','sasquatch'].map(id=>animalParticipant(ANIMALS.find(a=>a.id===id&&a.regionId==='northern')));
    state=createDynamicRescueState(participants);strategy={type:'rarity-focus'};
    const tierWorld=getPossibleWorlds(state)[0];
    await verify('Northern mythical tier');
    await check(`${width}: live tier is explicit`, `document.querySelector('.strategy-feedback').textContent.includes('Priority: Mythical')`);
    await check(`${width}: real tier membership Mythical`, `${JSON.stringify(rarityFocusParticipantIds(state,getPossibleWorlds(state)))}.length===1&&${JSON.stringify(rarityFocusParticipantIds(state,getPossibleWorlds(state)))}[0]==='animal:northern:sasquatch'`);
    await evaluate(`document.querySelector('.rescue-live-board-panel').scrollIntoView({block:'start',behavior:'instant'})`);await shot('rarity-active-'+width);
    for(const id of ['sasquatch','moose','skunk']) {
      const placement=tierWorld.participants.find(p=>p.participantId==='animal:northern:'+id);
      for(const cell of placement.cells)await report(cell,placement.participantId);
      await verify(id+' complete tier progression');
    }
    await click('.rescue-next-cta');await click('.rescue-region.region-farm');await click('[data-animal-id=pig]');
    await click('.pet-disclosure-summary');await click('[data-pet-id=rabbit]');await click('[data-strategy=rarity-focus]');await click('.rescue-start-cta');
    participants=[animalParticipant(ANIMALS.find(a=>a.id==='pig'&&a.regionId==='farm')),petParticipant(PET_SPECIES.find(p=>p.id==='rabbit'))];
    state=createDynamicRescueState(participants);strategy={type:'rarity-focus'};
    const cleanupWorld=getPossibleWorlds(state)[0];
    for(const cell of cleanupWorld.participants[0].cells)await report(cell,participants[0].id);
    await check(`${width}: live pet cleanup is explicit`, `document.querySelector('.strategy-feedback').textContent.includes('Finishing pet')`);
    await check(`${width}: rarity continues into pet cleanup`, `document.querySelector('.rescue-live').dataset.rescueStatus==='ready'&&document.querySelector('[data-recommended=true]')`);
    await evaluate(`document.querySelector('.rescue-live-board-panel').scrollIntoView({block:'start',behavior:'instant'})`);await shot('pet-cleanup-'+width);
    for(const cell of cleanupWorld.participants[1].cells)await report(cell,participants[1].id);
    await check(`${width}: rarity cleanup completes`, `document.querySelector('.rescue-live').dataset.rescueStatus==='complete'`);
    await click('.rescue-next-cta');await click('[data-animal-id=pig]');await click('.pet-disclosure-summary');await click('[data-pet-id=rabbit]');
    await click('[data-strategy=rarity-focus]');await click('[data-animal-id=pig]');
    await check(`${width}: removing last animal yields clean valid pet-only strategy`, `!document.querySelector('[data-strategy=rarity-focus]')&&document.querySelector('[data-strategy=balanced][aria-pressed=true]')&&!document.querySelector('.rescue-start-cta').disabled`);
    await click('.pet-disclosure-summary');await click('.rescue-pet-option:not([data-pet-id])');
    await check(`${width}: no overflow`, `document.documentElement.scrollWidth<=innerWidth`);
  }
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await click('[data-animal-id=pig]');await click('[data-strategy=balanced]');await click('.rescue-start-cta');
  await check('reduced motion disables board transitions', `getComputedStyle(document.querySelector('.dynamic-cell')).transitionDuration==='0s'`);
  // Last desktop rescue: check reduced-motion contradiction and completion styles.
  const p=animalParticipant(ANIMALS.find(a=>a.regionId==='farm'&&a.id==='pig'));
  let s=createDynamicRescueState([p]);
  while(analyzeDynamicRescue(s).status==='ready') {
    const c=analyzeDynamicRescue(s).recommendation.cellIndex;
    await click(`[data-cell-index="${c}"]`);await click('.rescue-result-empty');s=applyObservation(s,{type:'empty',cellIndex:c});
    await waitFor(`Number(document.querySelectorAll('.rescue-metrics dd')[2].textContent)===${s.observations.length}`);
  }
  await check('reduced motion contradiction static', `getComputedStyle(document.querySelector('.rescue-live-board-panel')).animationName==='none'&&document.activeElement.classList.contains('rescue-recovery-action')`);
  await clickText('Reset rescue');s=resetObservations(s);
  for(const c of getPossibleWorlds(s)[0].participants[0].cells) {await click(`[data-cell-index="${c}"]`);await click(`.rescue-result-animal[data-animal-id="${p.id}"]`);s=applyObservation(s,{type:'hit',cellIndex:c,participantId:p.id});await waitFor(`Number(document.querySelectorAll('.rescue-metrics dd')[2].textContent)===${s.observations.length}`);}
  await check('reduced motion completion static', `getComputedStyle(document.querySelector('.rescue-live-board-panel')).animationName==='none'&&document.querySelector('.rescue-completion-panel')`);
  fs.writeFileSync(output+'/alpha12-browser-results.json',JSON.stringify({version,checks:results.length,results,errors},null,2));
  socket.close();assert.deepEqual(errors,[]);console.log('Passed '+results.length+' ALPHA 12 browser checks.');
})().catch(error=>{console.error(error);process.exit(1);});
