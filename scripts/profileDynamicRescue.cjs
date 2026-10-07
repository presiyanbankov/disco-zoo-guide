/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node QA. */
const fs = require('node:fs');
const { performance } = require('node:perf_hooks');
const { ANIMALS } = require('../.next/dynamic-component-check/data/animals.js');
const solver = require('../.next/dynamic-component-check/solver/dynamic/dynamicRescueSolver.js');
const results = [];
for (const count of [1, 2, 3]) {
  const times = [];
  let maxWorlds = 0, maximumMs = 0, slowest = '';
  // Measure every supported combination, not just a convenient rescue.
  for (const region of ['farm', 'outback', 'savanna', 'northern', 'polar', 'jungle', 'moon']) {
    const animals = ANIMALS.filter(a => a.regionId === region && !a.hidden && a.rarity !== 'timeless');
    const combinations = [];
    function select(start, selected) {
      if (selected.length === count) { combinations.push(selected); return; }
      for (let i = start; i < animals.length; i++) select(i + 1, [...selected, animals[i]]);
    }
    select(0, []);
    for (const selected of combinations) {
      const state = solver.createDynamicRescueState(selected);
      for (let run = 0; run < 3; run++) {
        const start = performance.now();
        const result = solver.analyzeDynamicRescue(state);
        const ms = performance.now() - start;
        times.push(ms);
        maxWorlds = Math.max(maxWorlds, result.worldCount);
        if (ms > maximumMs) { maximumMs = ms; slowest = selected.map(a => a.id).join(','); }
      }
    }
  }
  times.sort((a, b) => a - b);
  results.push({ animals: count, runs: times.length, meanMs: times.reduce((a,b)=>a+b,0)/times.length, p95Ms: times[Math.floor(times.length*.95)], maximumMs, maxWorlds, slowest });
}
fs.mkdirSync('public/game/experiments/dynamic-rescue', {recursive:true});
fs.writeFileSync('public/game/experiments/dynamic-rescue/performance.json', JSON.stringify({ runtime: process.version, results }, null, 2));
console.log(JSON.stringify(results));
