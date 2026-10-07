/* Dependency-free Chrome CDP QA. Start the site on :3108 and Chrome CDP on :9241. */
const fs = require('node:fs');
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
      message.error ? promise.reject(message.error) : promise.resolve(message.result);
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
  const results = [], regions = ['farm', 'outback', 'savanna', 'northern', 'polar'];
  const paths = [...regions.map(r => '/regions/' + r), ...validation.animals.map(a => '/regions/' + a.region + '/' + a.animal)];
  for (const width of [375, 390, 768, 1440]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 768 });
    for (const path of paths) {
      await navigate(path);
      const result = await evaluate(`({
        overflow: document.documentElement.scrollWidth > innerWidth,
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
      for (const icon of result.icons) {
        const record = validation.animals.find(a => icon.src === '/game/animals-hq/' + a.region + '/' + a.animal + '.png');
        if (!record || String(record.outputDimensions) !== String(icon.natural)) throw Error('Asset dimensions mismatch: ' + JSON.stringify({width,path,icon,recordDimensions:record?.outputDimensions}));
      }
      results.push({ width, path, ...result });
      if ((width === 390 || width === 1440) && collection) await screenshot(path.split('/').pop() + '-' + width + '.png');
      if (width === 1440 && /\/(pig|giraffe|gryphon|fox|yeti)$/.test(path)) await screenshot(path.split('/').pop() + '-guide-' + width + '.png');
      if (width === 390 && /\/(giraffe|cockatoo|yeti)$/.test(path)) await screenshot(path.split('/').pop() + '-guide-' + width + '.png');
    }
    await navigate('/game/experiments/fandom-extracted-all/index.html');
    const review = await evaluate(`({ count:document.images.length, overflow:document.documentElement.scrollWidth>innerWidth, crisp:[...document.images].every(i=>getComputedStyle(i).imageRendering==='pixelated') })`);
    if (review.count !== 120 || review.overflow || !review.crisp) throw Error('Review page failed');
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
