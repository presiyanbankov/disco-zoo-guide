/* Dependency-free Chrome CDP QA. Start the site on :3108 and Chrome CDP on :9241. */
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node CommonJS QA script. */
const fs = require('node:fs');
const { ANIMALS } = require('../.next/region-component-check/data/animals.js');
const { generateSearchSequence } = require('../.next/region-component-check/solver/static/staticSolver.js');
const output = 'public/game/experiments/fandom-extracted-all';
const validation = JSON.parse(fs.readFileSync(output + '/validation.json', 'utf8'));
const baseURL = process.env.HQ_QA_URL || 'http://localhost:3108';
const debugURL = process.env.HQ_QA_CDP || 'http://localhost:9241';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const targets = await fetch(debugURL + '/json').then(r => r.json());
  const socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve));
  let id = 0, intercept = false, blockOriginal = false;
  const pending = new Map(), errors = [], intentionalFailures = [];
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    socket.send(JSON.stringify({ id: n, method, params }));
  });
  socket.addEventListener('message', async event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const promise = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) promise.reject(message.error);
      else promise.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (message.method === 'Network.responseReceived' && message.params.type === 'Image' && message.params.response.status >= 400) {
      const url = message.params.response.url;
      if (intercept && /\/game\/(animals-hq|animals)\/farm\/pig\.png/.test(url)) intentionalFailures.push(url);
      else errors.push(url);
    }
    if (message.method === 'Fetch.requestPaused') {
      const { requestId, request } = message.params;
      if (request.url.includes('/game/animals-hq/') || blockOriginal) {
        await call('Fetch.fulfillRequest', { requestId, responseCode: 404, body: Buffer.from('Intentional fallback test').toString('base64') });
      } else await call('Fetch.continueRequest', { requestId });
    }
  });
  const evaluate = async expression => (await call('Runtime.evaluate', { expression, returnByValue: true })).result.value;
  const waitFor = async expression => {
    for (let i = 0; i < 120; i++) {
      if (await evaluate(expression)) return;
      await sleep(100);
    }
    throw Error('Timed out: ' + expression);
  };
  const navigate = async path => {
    await call('Page.navigate', { url: baseURL + path });
    await waitFor(`location.pathname === ${JSON.stringify(path)} && document.readyState === 'complete' && document.images.length > 0`);
    // Exercise real lazy loading after the added Region Search section moves cards down.
    const count = await evaluate('document.images.length');
    for (let index = 0; index < count; index++) {
      if (await evaluate(`!document.images[${index}].complete || !document.images[${index}].naturalWidth`)) {
        await evaluate(`document.images[${index}].scrollIntoView({block:'center',behavior:'instant'})`);
        await waitFor(`document.images[${index}].complete && document.images[${index}].naturalWidth > 0`);
      }
    }
    await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
    await waitFor(`location.pathname === ${JSON.stringify(path)} && document.readyState === 'complete' && document.images.length > 0 && [...document.images].every(i => i.complete && i.naturalWidth > 0)`);
  };
  const screenshot = async filename => {
    const shot = await call('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(output + '/' + filename, Buffer.from(shot.data, 'base64'));
  };
  await call('Page.enable');
  await call('Runtime.enable');
  await call('Network.enable');
  await call('Emulation.setFocusEmulationEnabled', { enabled: true });
  const results = [], regions = ['farm', 'outback', 'savanna', 'northern', 'polar', 'jungle', 'moon'];
  const paths = [...regions.map(r => '/regions/' + r), ...validation.animals.map(a => '/regions/' + a.region + '/' + a.animal)];
  for (const width of [375, 390, 768, 1440]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 768 });
    for (const path of paths) {
      await navigate(path);
      const result = await evaluate(`({
        overflow: document.documentElement.scrollWidth > innerWidth,
        regionSearch: (() => {
          const section = document.querySelector('.region-search');
          if (!section) return null;
          const collection = document.getElementById('wildlife');
          return { pending: section.dataset.regionSearchStatus === 'pending', beforeCollection: !!(section.compareDocumentPosition(collection) & Node.DOCUMENT_POSITION_FOLLOWING),
            tiles: [...section.querySelectorAll('.board-tile')].map(cell => cell.textContent),
            buttons: section.querySelectorAll('.board-tile button, button.board-tile').length };
        })(),
        pattern: [...document.querySelectorAll('.pattern-panel .board-tile')].map((cell,index) => cell.classList.contains('tile-pattern') ? index : null).filter(index => index !== null),
        search: [...document.querySelectorAll('.search-panel .board-tile')].map(cell => cell.textContent ? Number(cell.textContent) : null),
        icons: [...document.querySelectorAll('img.animal-game-icon')].map(i => {
          const r = i.getBoundingClientRect();
          const stage = i.closest('.animal-art-stage, .animal-guide-art').getBoundingClientRect();
          return { src: new URL(i.src, location).pathname, hq: i.dataset.artSource === 'hq', natural: [i.naturalWidth,i.naturalHeight], size:[r.width,r.height],
            crisp: getComputedStyle(i).imageRendering === 'pixelated',
            clipped: r.left < stage.left || r.right > stage.right || r.top < stage.top || r.bottom > stage.bottom,
            horizontalCenterError: Math.abs((r.left+r.right-stage.left-stage.right)/2) };
        })
      })`);
      const collection = regions.some(r => path === '/regions/' + r);
      if (result.overflow || result.icons.length !== (collection ? 6 : 1) || result.icons.some(i => !i.hq || !i.crisp || i.clipped || i.horizontalCenterError > 1)) throw Error(JSON.stringify({ width, path, ...result }));
      if (collection) {
        if (!result.regionSearch?.pending || !result.regionSearch.beforeCollection || result.regionSearch.buttons || result.regionSearch.tiles.length !== 25 || result.regionSearch.tiles.some(Boolean)) throw Error('Pending region search failed: ' + path);
      } else {
        const animal = ANIMALS.find(a => path === '/regions/' + a.regionId + '/' + a.id);
        const pattern = animal.pattern.cells.map(c => c.row * 5 + c.col);
        const steps = generateSearchSequence(animal.id, animal.pattern).steps;
        const search = Array.from({length:25},(_,i) => steps.find(s => s.cell.row * 5 + s.cell.col === i)?.step ?? null);
        if (JSON.stringify(pattern) !== JSON.stringify(result.pattern) || JSON.stringify(search) !== JSON.stringify(result.search)) throw Error('Pattern/search mismatch: ' + path);
      }
      for (const icon of result.icons) {
        const record = validation.animals.find(a => icon.src === '/game/animals-hq/' + a.region + '/' + a.animal + '.png');
        if (!record || String(record.outputDimensions) !== String(icon.natural)) throw Error('Asset dimensions mismatch: ' + JSON.stringify({width,path,icon,recordDimensions:record?.outputDimensions}));
      }
      results.push({ width, path, ...result });
      if ((width === 390 || width === 1440) && collection) await screenshot(path.split('/').pop() + '-' + width + '.png');
      if (width === 1440 && /\/(pig|phoenix|moonkey|moonicorn|jade-rabbit)$/.test(path)) await screenshot(path.split('/').pop() + '-guide-' + width + '.png');
      if (width === 390 && /\/(phoenix|moonkey|lunar-tick|luna-moth|jade-rabbit)$/.test(path)) await screenshot(path.split('/').pop() + '-guide-' + width + '.png');
    }
    await navigate('/game/experiments/fandom-extracted-all/index.html');
    const review = await evaluate(`({ count:document.images.length, overflow:document.documentElement.scrollWidth>innerWidth, crisp:[...document.images].every(i=>getComputedStyle(i).imageRendering==='pixelated') })`);
    if (review.count !== 156 || review.overflow || !review.crisp) throw Error('Review page failed');
    await call('Page.navigate', { url: baseURL + '/' });
    await waitFor(`document.querySelectorAll('.region-card').length === 7 && document.readyState === 'complete'`);
    const home = await evaluate(`({ regions:[...document.querySelectorAll('.region-card')].map(a=>new URL(a.href).pathname.split('/').pop()), locked:!!document.querySelector('.locked-card'), overflow:document.documentElement.scrollWidth>innerWidth })`);
    if (String(home.regions) !== String(regions) || !home.locked || home.overflow) throw Error('Homepage navigation failed');
    if (width === 390 || width === 1440) await screenshot('home-' + width + '.png');
  }
  await call('Network.setCacheDisabled', { cacheDisabled: true });
  intercept = true;
  await call('Fetch.enable', { patterns: [{ urlPattern: '*/game/animals-hq/farm/pig.png' }, { urlPattern: '*/game/animals/farm/pig.png' }] });
  await call('Page.navigate', { url: baseURL + '/regions/farm/pig' });
  await waitFor(`document.querySelector('img[data-art-source="original"]')?.complete && document.querySelector('img[data-art-source="original"]')?.naturalWidth === 32`);
  const hqFallback = await evaluate(`new URL(document.querySelector('img[data-art-source="original"]').src).pathname === '/game/animals/farm/pig.png'`);
  blockOriginal = true;
  await call('Page.navigate', { url: baseURL + '/regions/farm/pig' });
  await waitFor(`!!document.querySelector('[role="img"][aria-label="Pig artwork unavailable"]') && document.readyState === 'complete'`);
  const unavailable = await evaluate(`document.querySelectorAll('img.animal-game-icon').length === 0 && document.getElementById('page-title').textContent.includes('Pig')`);
  if (!hqFallback || !unavailable || errors.length) throw Error(JSON.stringify({ hqFallback, unavailable, errors }));
  await call('Fetch.disable');
  fs.writeFileSync(output + '/browser-checks.json', JSON.stringify({ layouts: results, reviewWidths: [375,390,768,1440], hqFallback, unavailable, intentionalFailures, errors }, null, 2));
  console.log(JSON.stringify({ layouts: results.length, hqFallback, unavailable, errors }));
  await call('Browser.close');
  socket.close();
})().catch(error => { console.error(error); process.exit(1); });
