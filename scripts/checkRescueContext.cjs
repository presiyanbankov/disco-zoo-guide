/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Chrome QA. */
const fs = require('node:fs');
const assert = require('node:assert/strict');
const output='public/game/experiments/alpha12-rescue-context';
fs.mkdirSync(output,{recursive:true});
(async()=>{
  const tabs=await fetch('http://localhost:9242/json').then(r=>r.json());
  const socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise(r=>socket.addEventListener('open',r));
  let id=0;const pending=new Map(),checks=[],errors=[];
  socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(m.error);else p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
  const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;};
  const wait=async expression=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100));}throw Error('Timeout: '+expression);};
  const click=async selector=>{await wait(`!!document.querySelector(${JSON.stringify(selector)})`);await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await new Promise(r=>setTimeout(r,180));};
  const navigate=async path=>{await call('Page.navigate',{url:'http://localhost:3109'+path});await wait(`document.readyState==='complete'&&location.pathname+location.search===${JSON.stringify(path)}`);await new Promise(r=>setTimeout(r,350));};
  const check=async(name,expression)=>{assert.ok(await evaluate(`Boolean(${expression})`),name);checks.push(name);};
  const setup=async(region,animal,label)=>{
    await wait(`!!document.querySelector('.rescue-setup')`);
    await check(label+' region',`(document.querySelector('.rescue-region[aria-pressed=true]')?.classList.contains('region-${region}')??false)===${!!region}`);
    await check(label+' animal',`JSON.stringify([...document.querySelectorAll('.rescue-animal-option[aria-pressed=true]')].map(e=>e.dataset.animalId))===${JSON.stringify(JSON.stringify(animal?[animal]:[]))}`);
    await check(label+' does not start',`!document.querySelector('.dynamic-rescue-grid')&&!!document.querySelector('.rescue-start-cta')`);
  };
  await call('Runtime.enable');await call('Page.enable');
  for(const width of [375,390,768,1440]){
    await call('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width<600});
    for(const [path,region,animal] of [['/regions/savanna','savanna',null],['/regions/savanna/giraffe','savanna','giraffe'],['/regions/moon','moon',null],['/regions/moon/jade-rabbit','moon','jade-rabbit'],['/',null,null],['/pets',null,null]]){
      await navigate(path);
      const expected='/rescue'+(region?'?region='+region+(animal?'&animal='+animal:''):'');
      await check(width+' '+path+' link',`document.querySelector('a.rescue-header-link').getAttribute('href')===${JSON.stringify(expected)}`);
      await check(width+' '+path+' fits',`document.documentElement.scrollWidth<=innerWidth&&document.querySelector('.rescue-header-link').getBoundingClientRect().right<=innerWidth`);
      await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      await evaluate(`document.querySelector('a.rescue-header-link').focus()`);
      await check(width+' '+path+' focus',`getComputedStyle(document.activeElement).outlineStyle!=='none'`);
      await click('a.rescue-header-link');await wait(`location.pathname+location.search===${JSON.stringify(expected)}`);
      await setup(region,animal,width+' '+path);
    }
    await navigate('/rescue?region=savanna&animal=giraffe');await setup('savanna','giraffe',width+' direct');
    await click('[data-animal-id=giraffe]');await setup('savanna',null,width+' remove');
    await click('[data-animal-id=zebra]');
    await check(width+' edit persists',`!!document.querySelector('[data-animal-id=zebra][aria-pressed=true]')&&!document.querySelector('[data-animal-id=giraffe][aria-pressed=true]')`);
    await click('.pet-disclosure-summary');await click('[data-pet-id=rabbit]');
    await click('[data-strategy=finish-found]');
    await check(width+' context remains editable',`document.querySelector('.pet-current strong').textContent==='Rabbit'&&document.querySelector('[data-strategy=finish-found][aria-pressed=true]')&&!document.querySelector('.dynamic-rescue-grid')`);
    await call('Page.reload');await wait(`document.readyState==='complete'&&!!document.querySelector('.rescue-setup')`);await setup('savanna','giraffe',width+' refresh');
    await check(width+' refresh fresh setup',`document.querySelector('.pet-current strong').textContent==='None'&&document.querySelector('[data-strategy=balanced][aria-pressed=true]')`);
    await click('.rescue-start-cta');await wait(`!!document.querySelector('.dynamic-rescue-grid')`);
    await check(width+' explicit start works',`!!document.querySelector('.rescue-live')`);
    await navigate('/regions/moon');await click('a.rescue-header-link');await setup('moon',null,width+' fresh guide context');
    await evaluate('history.back()');await wait(`location.pathname==='/regions/moon'`);await check(width+' back restores guide link',`document.querySelector('a.rescue-header-link')?.getAttribute('href')==='/rescue?region=moon'`);
    await evaluate('history.forward()');await wait(`location.pathname==='/rescue'&&location.search==='?region=moon'&&!!document.querySelector('.rescue-setup')`);await setup('moon',null,width+' forward');
    for(const [query,region] of [['region=savanna&animal=pig','savanna'],['region=moon&animal=unknown','moon'],['region=mars&animal=giraffe',null],['region=unknown',null]]){await navigate('/rescue?'+query);await setup(region,null,width+' invalid '+query);}
    await navigate('/rescue?region=moon&animal=jade-rabbit');await setup('moon','jade-rabbit',width+' screenshot');
    const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync(output+'/jade-rabbit-setup-'+width+'.png',Buffer.from(shot.data,'base64'));
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(output+'/results.json',JSON.stringify({count:checks.length,checks,errors},null,2));socket.close();console.log(checks.length+' contextual navigation checks passed');
})().catch(e=>{console.error(e);process.exit(1);});
