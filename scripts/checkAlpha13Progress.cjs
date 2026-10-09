/* eslint-disable @typescript-eslint/no-require-imports -- Targeted Chrome feature QA. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const output='public/game/experiments/alpha13-progress';fs.mkdirSync(output,{recursive:true});
const version=fs.readFileSync('src/components/layout/siteVersion.ts','utf8').match(/SITE_VERSION = "([^"]+)"/)[1];
(async()=>{
  const tabs=await fetch('http://localhost:9242/json').then(r=>r.json());
  const socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r));
  let id=0;const pending=new Map(),checks=[],errors=[];
  socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(m.error);else p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
  const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;};
  const wait=async expression=>{for(let i=0;i<100;i++){if(await evaluate(`Boolean(${expression})`))return;await new Promise(r=>setTimeout(r,100));}throw Error('Timeout '+expression);};
  const click=async selector=>{await wait(`document.querySelector(${JSON.stringify(selector)})`);await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await new Promise(r=>setTimeout(r,150));};
  const check=async(name,expression)=>{assert.ok(await evaluate(`Boolean(${expression})`),name);checks.push(name);};
  const navigate=async path=>{await call('Page.navigate',{url:'http://localhost:3109'+path});await wait(`document.readyState==='complete'&&location.pathname+location.search===${JSON.stringify(path)}`);await new Promise(r=>setTimeout(r,250));};
  const key=async(name,code,n)=>{await call('Input.dispatchKeyEvent',{type:'keyDown',key:name,code,windowsVirtualKeyCode:n,text:name==='Enter'?'\r':undefined});await call('Input.dispatchKeyEvent',{type:'keyUp',key:name,code,windowsVirtualKeyCode:n});};
  const shot=async(name,full=true)=>{const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:full});fs.writeFileSync(output+'/'+name+'.png',Buffer.from(r.data,'base64'));};
  const chooseEarth=id=>click('input[name=earth-progress][value="'+id+'"]');
  const settings=async()=>{await evaluate(`document.querySelector('.site-header .progress-control').focus()`);await key('Enter','Enter',13);await wait(`document.querySelector('dialog[open]')`);};
  await call('Runtime.enable');await call('Page.enable');
  await call('Page.addScriptToEvaluateOnNewDocument',{source:`window.__progressFlashes=0;new MutationObserver(()=>{if(!localStorage.getItem('disco-zoo-guide.progress')&&document.querySelector('.site-shell'))window.__progressFlashes++;}).observe(document,{subtree:true,childList:true});`});
  for(const width of [375,390,768,1440]){
    await call('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width<600});
    await navigate('/');await evaluate(`localStorage.removeItem('disco-zoo-guide.progress')`);await call('Page.reload');await wait(`document.querySelector('.progress-welcome')`);
    await check(width+' first visit conservative/no flash',`!document.querySelector('.site-shell')&&window.__progressFlashes===0&&document.querySelector('input[name=earth-progress]:checked').value==='farm'&&document.querySelector('input[name=space-progress]:checked').value==='none'`);
    await check(width+' first visit no overflow/touch targets',`document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('.progress-destinations label>span')].every(e=>e.getBoundingClientRect().height>=44)`);
    if(width===375||width===1440)await shot('first-visit-'+width);
    await key('Tab','Tab',9);await evaluate(`document.querySelector('input[name=earth-progress]').focus()`);
    await check(width+' progress keyboard focus',`getComputedStyle(document.activeElement.nextElementSibling).outlineStyle!=='none'`);
    await chooseEarth('savanna');await click('.progress-save');await wait(`document.querySelector('.site-shell')`);
    await check(width+' explorer visible progress only',`document.querySelectorAll('.region-card').length===3&&!document.querySelector('.region-card.region-jungle')&&!document.querySelector('.region-card.region-moon')&&!document.querySelector('main').textContent.includes('Jungle')`);
    await check(width+' header fit, primary CTA and version',`document.documentElement.scrollWidth<=innerWidth&&document.querySelector('.rescue-header-link').getBoundingClientRect().height>=44&&document.querySelector('.site-header .progress-control').getBoundingClientRect().right<=innerWidth&&document.querySelector('.alpha-tag').textContent===${JSON.stringify(version)}`);
    if(width===1440)await shot('existing-visitor',false);
    await call('Page.reload');await wait(`document.querySelector('.site-shell')`);await check(width+' returning visitor skips welcome',`!document.querySelector('.progress-welcome')`);
    await navigate('/regions/jungle');await wait(`document.querySelector('.progress-barrier')`);
    await check(width+' hidden direct region and metadata',`!document.querySelector('.region-hero')&&!document.querySelector('.animal-collection')&&!document.title.includes('Jungle')&&document.querySelector('.progress-barrier').textContent.includes('ends at Savanna')&&document.querySelector('.rescue-header-link').getAttribute('href')==='/rescue'`);
    if(width===390||width===1440)await shot('hidden-region-'+width);
    await click('.progress-barrier .rescue-primary');await wait(`document.querySelector('.region-hero')`);
    await check(width+' reveal only Earth track',`JSON.parse(localStorage.getItem('disco-zoo-guide.progress')).maxEarthRegionId==='jungle'&&JSON.parse(localStorage.getItem('disco-zoo-guide.progress')).maxSpaceRegionId===null&&!JSON.parse(localStorage.getItem('disco-zoo-guide.progress')).showTimeless`);
    await settings();await check(width+' modal native focus containment',`document.querySelector('dialog').contains(document.activeElement)&&document.querySelector('dialog').matches(':modal')`);
    if(width===390||width===768)await shot('settings-'+width,false);
    await chooseEarth('savanna');await click('.progress-save');await wait(`document.querySelector('.progress-barrier')`);
    await check(width+' reducing progress hides current page',`!document.querySelector('.region-hero')&&!document.querySelector('.animal-collection')`);
    await navigate('/regions/jungle/phoenix');await wait(`document.querySelector('.progress-barrier')`);
    await check(width+' hidden animal has no name/art/pattern/metadata',`!document.querySelector('.animal-guide-art')&&!document.querySelector('.guide-grid-panels')&&!document.querySelector('main').textContent.includes('Phoenix')&&!document.title.includes('Phoenix')`);
    await click('.progress-barrier .rescue-secondary');await wait(`location.pathname!=='/regions/jungle/phoenix'`);
    await navigate('/rescue?region=jungle&animal=monkey');await wait(`document.querySelector('.rescue-setup')`);
    await check(width+' hidden rescue context cannot bypass',`document.querySelectorAll('.rescue-region').length===3&&!document.querySelector('.rescue-region[aria-pressed=true]')&&!document.querySelector('.rescue-animal-option')&&!document.querySelector('.dynamic-rescue-grid')`);
    if(width===1440)await shot('filtered-rescue');
    if(width===375){await click('.pet-disclosure-summary');await click('[data-pet-id=rabbit]');await check('pet-only setup remains available with filtered regions',`!document.querySelector('.rescue-start-cta').disabled&&!document.querySelector('.rescue-region[aria-pressed=true]')`);await click('.rescue-start-cta');await wait(`document.querySelector('.dynamic-rescue-grid')`);await check('pet-only rescue remains region independent',`document.querySelector('#live-rescue-title').textContent==='Pet rescue'`);}
    await navigate('/rescue?region=savanna&animal=giraffe');await wait(`document.querySelector('[data-animal-id=giraffe][aria-pressed=true]')`);
    await check(width+' visible animal context editable, not started',`document.querySelector('.rescue-region.region-savanna[aria-pressed=true]')&&!document.querySelector('.dynamic-rescue-grid')`);
    await settings();await click('input[name=space-progress][value=moon]');
    // Select Show explicitly; radio inputs live in separate labels.
    await evaluate(`const inputs=[...document.querySelectorAll('input[name=timeless-progress]')];inputs[1].click()`);await click('.progress-save');
    await check(width+' separate Space/Timeless preferences saved',`JSON.parse(localStorage.getItem('disco-zoo-guide.progress')).maxEarthRegionId==='savanna'&&JSON.parse(localStorage.getItem('disco-zoo-guide.progress')).maxSpaceRegionId==='moon'&&JSON.parse(localStorage.getItem('disco-zoo-guide.progress')).showTimeless&&document.querySelectorAll('.rescue-region').length===4`);
    await settings();await chooseEarth('farm');await key('Escape','Escape',27);await wait(`!document.querySelector('dialog')`);
    await check(width+' Escape cancels and returns focus',`JSON.parse(localStorage.getItem('disco-zoo-guide.progress')).maxEarthRegionId==='savanna'&&document.activeElement.classList.contains('progress-control')`);
    if(width===1440){
      await click('.rescue-start-cta');await wait(`document.querySelector('.dynamic-rescue-grid')`);await settings();await chooseEarth('farm');await click('.progress-save');await wait(`document.querySelector('.progress-barrier')`);
      await check('active rescue safely hidden after reduction',`!document.querySelector('.dynamic-rescue-grid')&&!document.querySelector('.rescue-selected-roster')`);
      await click('.progress-barrier .rescue-primary');await wait(`document.querySelector('.dynamic-rescue-grid')`);await check('reveal preserves existing rescue',`document.querySelector('.rescue-metrics dd:last-child')||document.querySelector('.dynamic-rescue-grid')`);
      await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await settings();await check('reduced motion settings',`getComputedStyle(document.querySelector('.progress-destinations label>span')).transitionDuration==='0s'`);await key('Escape','Escape',27);
      await evaluate(`localStorage.setItem('disco-zoo-guide.progress','{"version":99}')`);await call('Page.reload');await wait(`document.querySelector('.progress-welcome')`);await check('invalid storage returns to first visit',`!document.querySelector('.site-shell')`);
      await call('Emulation.setEmulatedMedia',{features:[]});
    }
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(output+'/results.json',JSON.stringify({checks:checks.length,results:checks,errors},null,2));socket.close();console.log(checks.length+' targeted progress checks passed');
})().catch(e=>{console.error(e);process.exit(1);});
