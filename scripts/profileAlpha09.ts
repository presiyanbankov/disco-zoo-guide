import { performance } from "node:perf_hooks";
import { mkdirSync, writeFileSync } from "node:fs";
import { ANIMALS } from "../src/data/animals";
import { PET_SPECIES } from "../src/data/pets";
import { animalParticipant, petParticipant } from "../src/components/rescue/rescueParticipants";
import { createDynamicRescueState, analyzeDynamicRescue } from "../src/solver/dynamic/dynamicRescueSolver";
const results = [];
for (const [count, withPet] of [[1,false],[2,false],[3,false],[1,true],[2,true]] as const) {
 const times:number[] = []; let maxWorlds = 0;
 for (const region of new Set(ANIMALS.map(a=>a.regionId))) {
  const animals = ANIMALS.filter(a=>a.regionId===region && !a.hidden && a.rarity !== "timeless");
  const combinations: typeof animals[] = [];
  function choose(start:number, selected:typeof animals) {
   if (selected.length===count) { combinations.push(selected); return; }
   for(let i=start;i<animals.length;i++) choose(i+1,[...selected,animals[i]]);
  }
  choose(0,[]);
  for(const selected of combinations) for(const pet of withPet ? PET_SPECIES : [null]) {
   const state=createDynamicRescueState([...selected.map(animalParticipant),...(pet?[petParticipant(pet)]:[])]);
   for(let run=0;run<3;run++) { const start=performance.now();const r=analyzeDynamicRescue(state);times.push(performance.now()-start);maxWorlds=Math.max(maxWorlds,r.worldCount); }
  }
 }
 times.sort((a,b)=>a-b);
 results.push({animals:count,pet:withPet,runs:times.length,meanMs:times.reduce((a,b)=>a+b,0)/times.length,p95Ms:times[Math.floor(times.length*.95)],maxMs:times.at(-1),maxWorlds});
}
mkdirSync("public/game/experiments/alpha09",{recursive:true});
writeFileSync("public/game/experiments/alpha09/performance.json",JSON.stringify({runtime:process.version,results},null,2));
console.log(JSON.stringify(results,null,2));
