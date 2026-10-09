/* eslint-disable @typescript-eslint/no-require-imports -- Focused Chrome CDP artwork QA. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
require('tsx/cjs');
const { ANIMALS } = require('../src/data/animals.ts');
const { getAnimalDisplayArtwork } = require('../src/components/animals/animalArtworkPresentation.ts');
const { animalParticipant } = require('../src/components/rescue/rescueParticipants.ts');
const { createDynamicRescueState, getPossibleWorlds } = require('../src/solver/dynamic/dynamicRescueSolver.ts');

(async () => {
  const output = process.env.ART_REVIEW_DIR || path.join(require('node:os').tmpdir(), 'hq-restoration-browser');
  fs.mkdirSync(output, { recursive: true });
  const tabs = await fetch('http://localhost:9242/json').then(r => r.json());
  const socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve));
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (!m.id) return;
    const p = pending.get(m.id); pending.delete(m.id);
    if (m.error) p.reject(m.error); else p.resolve(m.result);
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw Error(r.exceptionDetails.text);
    return r.result.value;
  };
  const wait = async expression => {
    for (let n = 0; n < 120; n++) {
      if (await evaluate(`Boolean(${expression})`)) return;
      await new Promise(r => setTimeout(r, 150));
    }
    throw Error('Timeout: ' + expression);
  };
  const navigate = async route => {
    await call('Page.navigate', { url: 'http://localhost:3000' + route });
    await wait(`location.pathname===${JSON.stringify(route.split('?')[0])}&&document.readyState==='complete'&&document.querySelector('.site-shell')`);
  };
  let checks = 0, screenshots = 0;
  const check = async expression => { assert.ok(await evaluate(expression), expression); checks++; };
  const click = async selector => {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    await new Promise(r => setTimeout(r, 120));
  };
  const readyArt = async () => {
    await evaluate("[...document.querySelectorAll('img')].forEach(i=>i.loading='eager')");
    await wait("[...document.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0)");
    await check("document.documentElement.scrollWidth<=innerWidth");
  };
  const shot = async name => {
    await new Promise(r => setTimeout(r, 180));
    const r = await call('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(output, name + '.png'), Buffer.from(r.data, 'base64')); screenshots++;
  };
  await navigate('/');
  await evaluate("localStorage.setItem('disco-zoo-guide.progress',JSON.stringify({version:1,maxEarthRegionId:'nocturnal',maxSpaceRegionId:'constellation',showTimeless:true}))");
  for (const width of [390, 1440]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 950, deviceScaleFactor: 1, mobile: width < 600 });
    await navigate('/regions/constellation'); await wait("document.querySelectorAll('.animal-card').length===7"); await readyArt();
    await check("[...document.querySelectorAll('.animal-card img')].every(i=>i.dataset.artSource==='hq'&&i.src.includes('animals-hq'))");
    if (width === 1440) {
      await evaluate("document.querySelector('.animal-collection').scrollIntoView({block:'start',behavior:'instant'})");
      await shot('constellation-region-1440');
    }
    await navigate('/regions/constellation/pegasus'); await wait("document.querySelector('.animal-guide-art img')"); await readyArt();
    await check("document.querySelector('.animal-guide-art img').naturalWidth===137&&document.querySelector('.animal-guide-art img').dataset.artSource==='hq'");
    await navigate('/regions/farm'); await wait("document.querySelector('.group-timeless')"); await readyArt();
    await check("document.querySelector('.group-timeless img').src.includes('animals-hq/farm/chicken.png')");
    if (width === 390) {
      await evaluate("document.querySelector('.group-timeless').scrollIntoView({block:'center',behavior:'instant'})"); await shot('chicken-section-390');
    }
    await navigate('/regions/polar/snowy-owl'); await wait("document.querySelector('.animal-guide-art img')"); await readyArt();
    await check("document.querySelector('.animal-guide-art img').naturalWidth===243&&document.querySelector('.animal-guide-art img').naturalHeight===231");
    if (width === 1440) await shot('snowy-owl-guide-1440');
    await navigate('/regions/nocturnal/firefly'); await wait("document.querySelector('.animal-guide-art img')"); await readyArt();
    const fireflyArt = getAnimalDisplayArtwork(ANIMALS.find(a => a.id === 'firefly').imagePath);
    await check(`document.querySelector('.animal-guide-art img').naturalWidth===${fireflyArt.width}&&document.querySelector('.animal-guide-art img').naturalHeight===${fireflyArt.height}`);
    // Real, legal hits from a surviving owner-solver world; no fake strategy.
    for (const [regionId, animalId] of [['constellation', 'pegasus'], ['polar', 'snowy-owl']]) {
      const animal = ANIMALS.find(a => a.id === animalId && a.regionId === regionId);
      const world = getPossibleWorlds(createDynamicRescueState([animalParticipant(animal)]))[0];
      const cell = world.participants[0].cells[0];
      await navigate(`/rescue?region=${regionId}&animal=${animalId}`);
      await wait(`document.querySelector('[data-animal-id="${animalId}"][aria-pressed=true]')`);
      await click('.rescue-start-cta'); await wait("document.querySelector('.dynamic-rescue-grid')");
      await click(`[data-cell-index="${cell}"]`); await wait("document.querySelector('.rescue-result-selector')");
      await click('.rescue-result-animal'); await wait(`document.querySelector('[data-cell-index="${cell}"][data-cell-state=animal]')`);
      await readyArt();
      const art = getAnimalDisplayArtwork(animal.imagePath);
      await check(`[...document.querySelectorAll('.rescue-cell-art img')].some(i=>i.src.endsWith(${JSON.stringify(art.src)})&&i.naturalWidth===${art.width})`);
      await check("[...document.querySelectorAll('.dynamic-cell')].every(c=>{const r=c.getBoundingClientRect();return Math.abs(r.width-r.height)<1})");
      await check("[...document.querySelectorAll('.rescue-cell-art img')].every(i=>{const r=i.getBoundingClientRect(),c=i.closest('.dynamic-cell').getBoundingClientRect();return r.width<=c.width+1&&r.height<=c.height+1})");
      if (animalId === 'snowy-owl') {
        await evaluate("document.querySelector('.dynamic-rescue-grid').scrollIntoView({block:'center',behavior:'instant'})"); await shot(`restored-hit-${width}`);
      }
    }
    console.log(`${width}px: restored collections, guides and square Rescue hit cells passed`);
  }
  // Deliberately fail a restored HQ request: no missing initials SVG / broken img.
  await call('Network.enable');
  await call('Network.setBlockedURLs', { urls: ['*animals-hq/constellation/pegasus.png*'] });
  await navigate('/regions/constellation/pegasus');
  await wait("document.querySelector('.animal-guide-art .animal-art-fallback')");
  await check("!document.querySelector('.animal-guide-art img')&&document.querySelector('.animal-guide-art .animal-art-fallback').getAttribute('aria-label')==='Pegasus artwork unavailable'");
  await call('Network.setBlockedURLs', { urls: [] });
  await navigate('/regions/constellation/pegasus'); await readyArt();
  const result = { checks, widths: [390, 1440], screenshots, output };
  fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result)); socket.close();
})().catch(e => { console.error(e); process.exit(1); });
