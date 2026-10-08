import assert from "node:assert/strict";
import test from "node:test";
import { PET_SPECIES } from "../../data/pets";
import { petParticipant } from "../../components/rescue/rescueParticipants";
import { generatePlacements } from "../static/generatePlacements";
import { analyzeDynamicRescue, analyzeRescueWorlds, applyObservation, createDynamicRescueState, getPossibleWorlds, resetObservations, undoObservation, type RescueParticipant, type RescueWorld } from "./dynamicRescueSolver";
import { DEFAULT_RARITY_PRIORITIES, participantStrategyWeight, rarityPriorityStrategy, scoreWorldsByStrategy, type RarityPriorityConfig, type RescueStrategy } from "./rescueStrategy";

const point = (id: string, category: keyof RarityPriorityConfig): RescueParticipant => ({ id, kind: category === "pet" ? "pet" : "animal", ...(category !== "pet" ? { animalRarity: category } : {}), pattern: { cells: [{ row: 0, col: 0 }] } });
test("rarity priority defaults serialize exactly as UI values 1/2/3/1", () => {
  assert.deepEqual(DEFAULT_RARITY_PRIORITIES, { common: 1, rare: 2, mythical: 3, pet: 1 });
  assert.deepEqual(rarityPriorityStrategy(), { type: "rarity-priority", priorities: { common: 1, rare: 2, mythical: 3, pet: 1 } });
});
for (const category of ["common", "rare", "mythical", "pet"] as const) for (const value of [1, 2, 3, 4] as const) test(`${category} uses configured priority ${value} without conversion`, () => {
  const p = point(category, category), s = createDynamicRescueState([p]);
  const strategy = rarityPriorityStrategy({ ...DEFAULT_RARITY_PRIORITIES, [category]: value });
  assert.equal(participantStrategyWeight(p, s, strategy), value);
  const world: RescueWorld = { participants: [{ participantId: p.id, cells: [7] }] };
  const cell = scoreWorldsByStrategy([world], s, strategy).find(c => c.cellIndex === 7)!;
  assert.equal(cell.strategyScore, value); assert.equal(cell.hitProbability, 1);
});
const state = createDynamicRescueState([point("animal:a", "mythical"), point("pet:p", "pet")]);
const worlds: RescueWorld[] = [
  { participants: [{ participantId: "animal:a", cells: [0] }, { participantId: "pet:p", cells: [1] }] },
  { participants: [{ participantId: "animal:a", cells: [2] }, { participantId: "pet:p", cells: [1] }] },
];
test("configured pet priority four can outrank mythical and changing config moves the recommendation", () => {
  const animalFirst = rarityPriorityStrategy({ common: 1, rare: 2, mythical: 4, pet: 1 });
  const petFirst = rarityPriorityStrategy({ common: 1, rare: 2, mythical: 1, pet: 4 });
  assert.equal(analyzeRescueWorlds(state, worlds, animalFirst).recommendation?.cellIndex, 0);
  const r = analyzeRescueWorlds(state, worlds, petFirst);
  assert.equal(r.recommendation?.cellIndex, 1); assert.equal(r.recommendation?.strategyScore, 4);
  assert.equal(r.worldCount, 2); assert.deepEqual(state.observations, []);
});
for (const value of [1, 2, 3, 4] as const) test(`equal priorities ${value} preserve Balanced recommendation and scale scores uniformly`, () => {
  const balanced = analyzeRescueWorlds(state, worlds);
  const r = analyzeRescueWorlds(state, worlds, rarityPriorityStrategy({ common: value, rare: value, mythical: value, pet: value }));
  assert.equal(r.recommendation?.cellIndex, balanced.recommendation?.cellIndex);
  assert.ok(r.scores.every(c => c.strategyScore === value * c.hitProbability));
});
test("configured priority ties stay deterministic and row-major", () => {
  const s = createDynamicRescueState([point("pet:p", "pet")]);
  const w = [{ participants: [{ participantId: "pet:p", cells: [8] }] }, { participants: [{ participantId: "pet:p", cells: [3] }] }];
  const strategy = rarityPriorityStrategy({ ...DEFAULT_RARITY_PRIORITIES, pet: 4 });
  for (let i = 0; i < 5; i++) assert.equal(analyzeRescueWorlds(s, w, strategy).recommendation?.cellIndex, 3);
});
test("strategy config is copied and scoring does not mutate config, worlds or observations", () => {
  const priorities = { ...DEFAULT_RARITY_PRIORITIES }, strategy = rarityPriorityStrategy(priorities);
  priorities.pet = 4;
  assert.equal(strategy.type === "rarity-priority" && strategy.priorities.pet, 1);
  const before = JSON.stringify({ strategy, worlds, state });
  analyzeRescueWorlds(state, worlds, strategy);
  assert.equal(JSON.stringify({ strategy, worlds, state }), before);
});

for (const pet of PET_SPECIES) {
  const participant = petParticipant(pet);
  test(`${pet.name}: pet-only worlds are the existing legal placements`, () => {
    const s = createDynamicRescueState([participant]);
    assert.deepEqual(getPossibleWorlds(s).map(w => w.participants), generatePlacements(pet.pattern.cells).map(cells => [{ participantId: participant.id, cells }]));
  });
  test(`${pet.name}: all four pet-only modes use the same worlds and remain deterministic`, () => {
    const s = createDynamicRescueState([participant]);
    const balanced = analyzeDynamicRescue(s);
    const strategies: RescueStrategy[] = [{ type: "balanced" }, { type: "finish-found" }, { type: "target", participantId: participant.id }, rarityPriorityStrategy({ ...DEFAULT_RARITY_PRIORITIES, pet: 4 })];
    for (const strategy of strategies) {
      const r = analyzeDynamicRescue(s, strategy);
      assert.equal(r.status, "ready"); assert.equal(r.worldCount, balanced.worldCount); assert.equal(r.recommendation?.cellIndex, balanced.recommendation?.cellIndex);
      assert.deepEqual(analyzeDynamicRescue(s, strategy), r);
    }
  });
  test(`${pet.name}: EMPTY and exact HIT filtering, completion, contradiction and undo/reset work unchanged`, () => {
    const initial = createDynamicRescueState([participant]);
    const cells = getPossibleWorlds(initial)[0].participants[0].cells;
    const emptyCell = Array.from({ length: 25 }, (_, i) => i).find(c => !cells.includes(c))!;
    const missed = applyObservation(initial, { type: "empty", cellIndex: emptyCell });
    assert.ok(getPossibleWorlds(missed).every(w => !w.participants[0].cells.includes(emptyCell)));
    const hit = applyObservation(missed, { type: "hit", cellIndex: cells[0], participantId: participant.id });
    assert.ok(getPossibleWorlds(hit).every(w => w.participants[0].cells.includes(cells[0])));
    assert.equal(participantStrategyWeight(participant, initial, { type: "finish-found" }), 1);
    assert.equal(participantStrategyWeight(participant, hit, { type: "finish-found" }), 3);
    let complete = hit;
    for (const cellIndex of cells.slice(1)) complete = applyObservation(complete, { type: "hit", cellIndex, participantId: participant.id });
    for (const strategy of [{ type: "balanced" }, { type: "finish-found" }, { type: "target", participantId: participant.id }, rarityPriorityStrategy()] as const) assert.equal(analyzeDynamicRescue(complete, strategy).status, "complete");
    const impossible = applyObservation(hit, { type: "empty", cellIndex: cells[0] });
    assert.equal(analyzeDynamicRescue(impossible, rarityPriorityStrategy()).status, "contradiction");
    assert.deepEqual(analyzeDynamicRescue(undoObservation(impossible)), analyzeDynamicRescue(hit));
    assert.deepEqual(analyzeDynamicRescue(resetObservations(complete)), analyzeDynamicRescue(initial));
    assert.ok(analyzeDynamicRescue(hit, rarityPriorityStrategy()).scores.every(c => c.cellIndex !== emptyCell && c.cellIndex !== cells[0]));
  });
}
