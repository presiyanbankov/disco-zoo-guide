import { performance } from "node:perf_hooks";
import { mkdirSync, writeFileSync } from "node:fs";
import { ANIMALS } from "../src/data/animals";
import { PET_SPECIES } from "../src/data/pets";
import { animalParticipant, petParticipant } from "../src/components/rescue/rescueParticipants";
import { analyzeDynamicRescue, analyzeRescueWorlds, createDynamicRescueState, getPossibleWorlds } from "../src/solver/dynamic/dynamicRescueSolver";
import type { RescueStrategy } from "../src/solver/dynamic/rescueStrategy";

const results = [];
for (const [count, withPet] of [[1, false], [2, false], [3, false], [1, true], [2, true]] as const) {
  const samples = new Map<string, { full: number[]; policy: number[]; maxWorlds: number }>();
  for (const region of new Set(ANIMALS.map(a => a.regionId))) {
    const animals = ANIMALS.filter(a => a.regionId === region && !a.hidden && a.rarity !== "timeless");
    const combinations: typeof animals[] = [];
    function choose(start: number, selected: typeof animals) {
      if (selected.length === count) { combinations.push(selected); return; }
      for (let i = start; i < animals.length; i++) choose(i + 1, [...selected, animals[i]]);
    }
    choose(0, []);
    for (const selected of combinations) for (const pet of withPet ? PET_SPECIES : [null]) {
      const state = createDynamicRescueState([...selected.map(animalParticipant), ...(pet ? [petParticipant(pet)] : [])]);
      const worlds = getPossibleWorlds(state);
      const strategies: RescueStrategy[] = [{ type: "balanced" }, { type: "finish-found" }, { type: "target", participantId: state.participants[0].id }, { type: "rarity-first" }];
      for (const strategy of strategies) {
        const sample = samples.get(strategy.type) ?? { full: [], policy: [], maxWorlds: 0 };
        // Warm-up once, then three measured end-to-end and policy-only evaluations.
        analyzeRescueWorlds(state, worlds, strategy);
        for (let run = 0; run < 3; run++) {
          let start = performance.now(); const r = analyzeDynamicRescue(state, strategy); sample.full.push(performance.now() - start);
          start = performance.now(); analyzeRescueWorlds(state, worlds, strategy); sample.policy.push(performance.now() - start);
          sample.maxWorlds = Math.max(sample.maxWorlds, r.worldCount);
        }
        samples.set(strategy.type, sample);
      }
    }
  }
  function summary(values: number[]) {
    values.sort((a, b) => a - b);
    return { meanMs: values.reduce((a, b) => a + b, 0) / values.length, p95Ms: values[Math.floor(values.length * .95)], maxMs: values.at(-1) };
  }
  for (const [strategy, sample] of samples) results.push({ animals: count, pet: withPet, strategy, runs: sample.full.length, maxWorlds: sample.maxWorlds, full: summary(sample.full), policy: summary(sample.policy) });
}
mkdirSync("public/game/experiments/alpha10", { recursive: true });
writeFileSync("public/game/experiments/alpha10/performance.json", JSON.stringify({ runtime: process.version, methodology: "Every classic-animal combination in all seven regions; every pet species when applicable; three repeats after policy warm-up. Initial states. Full includes world generation/filtering; policy reuses surviving worlds.", results }, null, 2));
console.log(JSON.stringify(results, null, 2));
