/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node CommonJS QA script. */
const fs = require('node:fs');
require('tsx/cjs');
const { REGION_PRESENTATION } = require('../src/components/regions/regionPresentation.ts');
const base = process.env.HQ_QA_URL || 'http://localhost:3108';
const debug = process.env.HQ_QA_CDP || 'http://localhost:9241';
const output = 'public/game/experiments/jungle-moon';

(async () => {
  const targets = await fetch(debug + '/json').then(r => r.json());
  const socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve));
  let id = 0;
  const pending = new Map(), errors = [];
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, {resolve, reject});
    socket.send(JSON.stringify({id, method, params}));
  });
  socket.addEventListener('message', async e => {
    const m = JSON.parse(e.data);
    if (m.id) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) p.reject(m.error); else p.resolve(m.result);
    }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
    if (m.method === 'Fetch.requestPaused') await call('Fetch.fulfillRequest', {requestId:m.params.requestId, responseCode:404, body:Buffer.from('Expected missing asset test').toString('base64')});
  });
  const evaluate = async expression => (await call('Runtime.evaluate', {expression, returnByValue:true})).result.value;
  const waitFor = async expression => {
    for (let i=0;i<100;i++) {
      if (await evaluate(expression)) return;
      await new Promise(r=>setTimeout(r,100));
    }
    throw Error('Timed out: ' + expression);
  };
  const go = async path => {
    await call('Page.navigate', {url:base+path});
    await waitFor(`location.pathname===${JSON.stringify(path)} && document.readyState==='complete' && !!document.querySelector('[data-route-page]')`);
  };
  const click = async selector => {
    const point = await evaluate(`(()=>{const a=document.querySelector(${JSON.stringify(selector)});a.scrollIntoView({block:'center',behavior:'instant'});const r=a.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    await call('Input.dispatchMouseEvent', {type:'mousePressed',button:'left',clickCount:1,...point});
    await call('Input.dispatchMouseEvent', {type:'mouseReleased',button:'left',clickCount:1,...point});
  };
  const screenshot = async name => {
    const shot=await call('Page.captureScreenshot',{format:'png'});
    fs.writeFileSync(output+'/'+name,Buffer.from(shot.data,'base64'));
  };
  await call('Page.enable');await call('Runtime.enable');await call('Network.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await go('/');
  await evaluate("localStorage.setItem('disco-zoo-guide.progress',JSON.stringify({version:1,maxEarthRegionId:'nocturnal',maxSpaceRegionId:'constellation',showTimeless:false}))");
  await go('/');
  await waitFor(`document.querySelectorAll('.region-card').length===${REGION_PRESENTATION.length}`);
  await click('a.region-card[href="/regions/jungle"]');
  await waitFor(`location.pathname==='/regions/jungle' && !!document.querySelector('.region-search') && document.documentElement.dataset.routeTransition!=='active'`);
  await click('a.region-nav-link[href="/regions/moon"]');
  await waitFor(`location.pathname==='/regions/moon' && !!document.querySelector('.vector-moon') && document.documentElement.dataset.routeTransition!=='active'`);
  await click('a.animal-card[href="/regions/moon/moonkey"]');
  await waitFor(`location.pathname==='/regions/moon/moonkey' && !!document.querySelector('.search-panel [data-art-source], .search-panel button') && document.documentElement.dataset.routeTransition!=='active'`);
  const navigation = true;
  const reducedMotion = [];
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  for(const region of ['jungle','moon']) {
    await go('/regions/'+region);
    const animations=await evaluate(`([...document.querySelectorAll('.land-far-layer,.land-mid-layer,.land-near-layer,.land-leaves,.land-sun-glow,.atmosphere-mote,.atmosphere-band,.atmosphere-light')].map(e=>getComputedStyle(e).animationName))`);
    if(animations.some(a=>a!=='none')) throw Error('Reduced motion failed: '+region);
    reducedMotion.push(region);
  }
  await call('Emulation.setEmulatedMedia',{features:[]});
  for(const width of [375,390,768,1440]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<768});
    for(const region of ['jungle','moon']) {
      await go('/regions/'+region);
      await evaluate(`document.getElementById('wildlife').scrollIntoView({block:'start',behavior:'instant'})`);
      await waitFor(`[...document.querySelectorAll('.animal-card img')].every(i=>i.complete&&i.naturalWidth>0)`);
      await screenshot(region+'-collection-'+width+'.png');
      await evaluate(`document.querySelector('.region-search').scrollIntoView({block:'start',behavior:'instant'})`);
      await screenshot(region+'-search-'+width+'.png');
    }
  }
  const locked = [];
  for(const region of ['unknown-region']) {
    const response=await fetch(base+'/regions/'+region);
    if(response.status!==404) throw Error('Locked region accessible: '+region);
    locked.push(region);
  }
  await call('Network.setCacheDisabled',{cacheDisabled:true});
  await call('Fetch.enable',{patterns:[{urlPattern:'*/game/animals-hq/moon/moonkey.png'},{urlPattern:'*/game/animals/moon/moonkey.png'}]});
  await go('/regions/moon/moonkey');
  await waitFor(`!!document.querySelector('[role="img"][aria-label="Moonkey artwork unavailable"]')`);
  const newAnimalFallback=await evaluate(`document.querySelectorAll('img.animal-game-icon').length===0 && !!document.querySelector('.search-panel button') && document.getElementById('page-title').textContent.includes('Moonkey')`);
  if(!newAnimalFallback||errors.length) throw Error(JSON.stringify({newAnimalFallback,errors}));
  await call('Fetch.disable');
  const result={navigation,reducedMotion,locked,newAnimalFallback,collectionAndSearchWidths:[375,390,768,1440],errors};
  fs.writeFileSync(output+'/browser-checks.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
  await call('Browser.close');socket.close();
})().catch(e=>{console.error(e);process.exit(1);});
