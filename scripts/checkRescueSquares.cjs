/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser QA. */
const fs = require('node:fs');
const assert = require('node:assert/strict');
require('tsx/cjs');
const { ANIMALS } = require('../src/data/animals.ts');
const { PET_SPECIES } = require('../src/data/pets.ts');
const { animalParticipant, petParticipant } = require('../src/components/rescue/rescueParticipants.ts');
const { createDynamicRescueState, getPossibleWorlds } = require('../src/solver/dynamic/dynamicRescueSolver.ts');
const output = 'public/game/experiments/alpha12-square-cells';
fs.mkdirSync(output, { recursive: true });
(async () => {
  const tabs = await fetch('http://localhost:9242/json').then(r => r.json());
  const socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => socket.addEventListener('open', r));
  let id = 0; const pending = new Map(); const results = []; const errors = [];
  socket.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id) { const p = pending.get(m.id); pending.delete(m.id); if(m.error)p.reject(m.error);else p.resolve(m.result); } if(m.method === 'Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text); });
  const call = (method, params = {}) => new Promise((resolve,reject) => { pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params})); });
  const evaluate = async expression => { const r = await call('Runtime.evaluate',{expression,returnByValue:true}); if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value; };
  const wait = async expression => { for(let i=0;i<100;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100));}throw Error('Timeout '+expression); };
  const click = async selector => { await wait(`!!document.querySelector(${JSON.stringify(selector)})`); await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); await new Promise(r=>setTimeout(r,120)); };
  const audit = async (label) => {
    await wait(`[...document.querySelectorAll('.cell-animal img')].every(i=>i.complete&&i.naturalWidth>0)`);
    const geometry = await evaluate(`(()=>{const cells=[...document.querySelectorAll('.dynamic-cell')];return cells.map(e=>{const r=e.getBoundingClientRect();const img=e.querySelector('img');const ir=img?.getBoundingClientRect();return {width:r.width,height:r.height,top:r.top,image:ir?{width:ir.width,height:ir.height,inside:ir.left>=r.left&&ir.right<=r.right&&ir.top>=r.top&&ir.bottom<=r.bottom,ratio:img.naturalWidth/img.naturalHeight}:null};});})()`);
    assert.equal(geometry.length,25);
    for(const c of geometry){assert.ok(Math.abs(c.width-c.height)<0.6,label+' square');assert.ok(Math.abs(c.height-geometry[0].height)<0.6,label+' equal rows');if(c.image){assert.ok(c.image.inside,label+' contained');assert.ok(Math.abs(c.image.width/c.image.height-c.image.ratio)<0.02,label+' undistorted');}}
    results.push({label,geometry});
  };
  const shot = async name => { await evaluate(`document.querySelector('.dynamic-board-frame').scrollIntoView({block:'center',behavior:'instant'})`);await new Promise(r=>setTimeout(r,350));const r=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(output+'/'+name+'.png',Buffer.from(r.data,'base64')); };
  await call('Runtime.enable');await call('Page.enable');
  for(const width of (process.env.SQUARE_WIDTHS || '375,390,768,1440').split(',').map(Number)) {
    await call('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width<600});
    for(const participant of [...['jade-rabbit','sasquatch','giraffe'].map(id=>animalParticipant(ANIMALS.find(a=>a.id===id))),...PET_SPECIES.map(petParticipant)]) {
      await call('Page.navigate',{url:'http://localhost:3109/rescue'});await wait(`document.readyState==='complete'&&!!document.querySelector('.rescue-setup')`);await new Promise(r=>setTimeout(r,300));
      if(participant.kind==='animal'){const animal=ANIMALS.find(a=>'animal:'+a.regionId+':'+a.id===participant.id);await click('.rescue-region.region-'+animal.regionId);await click('[data-animal-id="'+animal.id+'"]');}
      else {await click('.pet-disclosure-summary');await click('[data-pet-id="'+participant.id.split(':')[1]+'"]');}
      await click('.rescue-start-cta');await wait(`!!document.querySelector('.dynamic-rescue-grid')`);
      await audit(width+' '+participant.name+' unopened');
      const placement=getPossibleWorlds(createDynamicRescueState([participant]))[0].participants[0];
      for(const cell of placement.cells){await click('[data-cell-index="'+cell+'"]');await wait(`!!document.querySelector('[role=dialog]')`);await click('.rescue-result-animal[data-animal-id="'+participant.id+'"]');await wait(`document.querySelector('[data-cell-index="${cell}"]').dataset.cellState==='animal'`);await audit(width+' '+participant.name+' hit '+cell);if(cell===placement.cells[0]&&participant.kind==='animal')await shot(participant.id.split(':').pop()+'-active-'+width);}
      await wait(`document.querySelector('.rescue-live').dataset.rescueStatus==='complete'`);await audit(width+' '+participant.name+' complete');
      if(participant.kind==='animal') await shot(participant.id.split(':').pop()+'-complete-'+width);
      await click('.rescue-board-actions button');await wait(`document.querySelector('.rescue-live').dataset.rescueStatus==='ready'`);
      // Deliberately report every remaining cell empty to exercise contradiction with hit artwork retained.
      for(let cell=0;cell<25;cell++){if(await evaluate(`document.querySelector('.rescue-live').dataset.rescueStatus==='contradiction'`))break;if(await evaluate(`document.querySelector('[data-cell-index="${cell}"]').disabled`))continue;await click('[data-cell-index="'+cell+'"]');await wait(`!!document.querySelector('[role=dialog]')`);await click('.rescue-result-empty');await wait(`document.querySelector('[data-cell-index="${cell}"]').dataset.cellState==='empty'`);}
      await wait(`document.querySelector('.rescue-live').dataset.rescueStatus==='contradiction'`);await audit(width+' '+participant.name+' contradiction');
      if(participant.kind==='animal')await shot(participant.id.split(':').pop()+'-contradiction-'+width);
    }
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(output+'/results.json',JSON.stringify({checks:results.length,results,errors},null,2));socket.close();console.log(results.length+' geometry audits passed');
})().catch(e=>{console.error(e);process.exit(1);});
