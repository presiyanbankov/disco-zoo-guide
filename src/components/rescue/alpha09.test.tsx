import assert from "node:assert/strict";
import test from "node:test";
import { renderWithFullProgress as renderToStaticMarkup } from "../progress/progressTestSupport";
import { PET_SPECIES } from "../../data/pets";
import { ANIMALS } from "../../data/animals";
import { animalParticipant, petParticipant, validateRescueSetup } from "./rescueParticipants";
import { analyzeDynamicRescue, applyObservation, createDynamicRescueState, getPossibleWorlds, undoObservation } from "../../solver/dynamic/dynamicRescueSolver";
import { RescueSetup } from "./RescueSetup";
import { ResultSelector } from "./ResultSelector";
import PetsPage from "../../app/pets/page";
import Home from "../../app/page";
import { REGION_GROUPS, regionPosition } from "../regions/regionPresentation";
import { SITE_VERSION } from "../layout/siteVersion";
const farm = ANIMALS.filter(a => a.regionId === "farm");
const pet = PET_SPECIES[0];
const noop = () => {};
const approved = [
 [[0,0],[0,2],[1,0],[1,2],[2,1]], [[0,0],[0,2],[0,4],[1,1],[1,3]],
 [[0,1],[1,0],[1,1],[2,0],[2,1]], [[0,0],[0,1],[1,0],[2,0],[2,1]],
 [[0,3],[1,0],[1,1],[1,2],[2,3]], [[0,0],[0,1],[0,2],[1,1],[2,1]],
 [[0,0],[1,0],[2,0],[2,1],[2,2]], [[0,0],[0,2],[1,1],[2,0],[2,2]],
];
test("eight pet records exactly preserve approved species geometry", () => {
 assert.deepEqual(PET_SPECIES.map(p => p.name), ["Rabbit","Bird","Dog","Cat","Fish","Turtle","Lizard","Hamster"]);
 PET_SPECIES.forEach((p,i) => assert.deepEqual(p.pattern.cells.map(c => [c.row,c.col]), approved[i]));
});
test("participant namespaces distinguish both Rabbits and are unique", () => {
 const ids = [...ANIMALS.map(animalParticipant), ...PET_SPECIES.map(petParticipant)].map(p => p.id);
 assert.equal(new Set(ids).size, ANIMALS.length + PET_SPECIES.length);
 assert.ok(ids.includes("animal:farm:rabbit")); assert.ok(ids.includes("pet:rabbit"));
});
test("setup accepts the six approved configurations", () => {
 assert.equal(validateRescueSetup([],[pet]),null);
 for (const count of [1,2,3]) assert.equal(validateRescueSetup(farm.slice(0,count),[]),null);
 for (const count of [1,2]) assert.equal(validateRescueSetup(farm.slice(0,count),[pet]),null);
});
test("setup rejects empty, two pets, over-three, mixed regions and duplicates", () => {
 assert.ok(validateRescueSetup([],[]));
 assert.ok(validateRescueSetup(farm.slice(0,1),PET_SPECIES.slice(0,2)));
 assert.ok(validateRescueSetup(farm.slice(0,3),[pet]));
 assert.ok(validateRescueSetup([farm[0],ANIMALS.find(a => a.regionId === "moon")!],[]));
 assert.ok(validateRescueSetup([farm[0],farm[0]],[]));
});
for (const count of [1,2]) test(`${count} animal(s) and every pet preserve non-overlap and exact hits`, () => {
 for (const pet of PET_SPECIES) {
  const participants = [...farm.slice(0,count).map(animalParticipant),petParticipant(pet)];
  const state = createDynamicRescueState(participants); const worlds = getPossibleWorlds(state);
  assert.ok(worlds.length > 0);
  for (const world of worlds) {
   const cells = world.participants.flatMap(p => p.cells); assert.equal(new Set(cells).size,cells.length);
  }
  const world = worlds[0];
  for (const hit of world.participants) {
   const next = applyObservation(state,{type:"hit",participantId:hit.participantId,cellIndex:hit.cells[0]});
   assert.ok(getPossibleWorlds(next).every(w => w.participants.find(p => p.participantId === hit.participantId)!.cells.includes(hit.cells[0])));
   assert.deepEqual(analyzeDynamicRescue(undoObservation(next)),analyzeDynamicRescue(state));
  }
  assert.deepEqual(analyzeDynamicRescue(state),analyzeDynamicRescue(createDynamicRescueState(participants)));
 }
});
test("kind metadata has no effect on world probabilities or greedy recommendations", () => {
 const participants = [animalParticipant(farm[0]),petParticipant(pet)];
 const a = createDynamicRescueState(participants);
 const b = createDynamicRescueState(participants.map(p => ({...p,kind:"animal" as const})));
 assert.deepEqual(getPossibleWorlds(a),getPossibleWorlds(b));
 assert.deepEqual(analyzeDynamicRescue(a),analyzeDynamicRescue(b));
 const world = getPossibleWorlds(a)[0]; const empty = Array.from({length:25},(_,i)=>i).find(i=>world.participants.every(p=>!p.cells.includes(i)))!;
 assert.ok(getPossibleWorlds(applyObservation(a,{type:"empty",cellIndex:empty})).every(w=>w.participants.every(p=>!p.cells.includes(empty))));
});
test("pet contradiction remains a recoverable result", () => {
 let state = createDynamicRescueState([animalParticipant(farm[0]),petParticipant(pet)]);
 state = applyObservation(state,{type:"hit",participantId:"pet:rabbit",cellIndex:0});
 state = applyObservation(state,{type:"hit",participantId:"pet:rabbit",cellIndex:24});
 assert.equal(analyzeDynamicRescue(state).status,"contradiction");
 assert.equal(analyzeDynamicRescue(undoObservation(state)).status,"ready");
});
test("setup disables pets with three animals and third animal with a pet", () => {
 const base = {regionId:"farm",animals:ANIMALS,onRegion:noop,onAnimal:noop,onPet:noop,onStart:noop};
 const three = renderToStaticMarkup(<RescueSetup {...base} selectedIds={farm.slice(0,3).map(a=>a.id)} />);
 assert.equal((three.match(/data-pet-id="[^"]+" aria-pressed="false" disabled=""/g)??[]).length,8);
 const two = renderToStaticMarkup(<RescueSetup {...base} petId="rabbit" selectedIds={farm.slice(0,2).map(a=>a.id)} />);
 assert.equal((two.match(/class="rescue-animal-option" aria-pressed="false" disabled=""/g)??[]).length,4);
});
test("result selector includes namespaced pet and animal hit choices", () => {
 const participants = [...farm.slice(0,2).map(animalParticipant),petParticipant(pet)];
 const html = renderToStaticMarkup(<ResultSelector cellIndex={0} anchor={{left:0,top:0}} participants={participants} onResult={noop} onClose={noop} />);
 assert.ok(html.includes('data-animal-id="pet:rabbit"')); assert.ok(html.includes('data-animal-id="animal:farm:pig"')); assert.match(html,/<kbd>3<\/kbd>/);
});
test("pets reference shows all eight exact pattern grids", () => {
 const html = renderToStaticMarkup(<PetsPage />);
 assert.equal((html.match(/data-pet-species=/g)??[]).length,8);
 assert.equal((html.match(/data-pattern-occupied="true"/g)??[]).length,40);
 assert.match(html,/Cosmetic appearance does not affect/);
});
test("homepage prioritizes assistant then Earth, Space and Pets; locks seven destinations", () => {
 const html = renderToStaticMarkup(<Home />);
 assert.ok(html.indexOf('id="rescue"') < html.indexOf('id="regions"'));
 assert.ok(html.indexOf('id="earth-title"') < html.indexOf('id="space-title"'));
 assert.ok(html.indexOf('id="space-title"') < html.indexOf('id="pets-reference-title"'));
 assert.equal((html.match(/data-region-locked="true"/g)??[]).length,6);
 assert.doesNotMatch(html,/href="\/regions\/(mars|constellation|nocturnal)/);
 assert.match(SITE_VERSION,/^ALPHA \d{2}$/); assert.ok(html.includes(SITE_VERSION));
 assert.equal(regionPosition("moon").number,1); assert.equal(REGION_GROUPS[0].destinations.length,11);
});
