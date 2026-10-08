import assert from "node:assert/strict";
import test from "node:test";
import { ANIMALS } from "../../data/animals";
import { PET_SPECIES } from "../../data/pets";
import { animalParticipant, petParticipant } from "../../components/rescue/rescueParticipants";
import { analyzeDynamicRescue, analyzeRescueWorlds, applyObservation, chooseDynamicCell, createDynamicRescueState, getPossibleWorlds, resetObservations, scoreWorldsByHitProbability, undoObservation, type RescueParticipant, type RescueWorld } from "./dynamicRescueSolver";
import { RARITY_FOCUS_STRATEGY, resolveTargetStrategy, resolvedParticipantIds, scoreWorldsByStrategy } from "./rescueStrategy";

const point = (id: string, kind: "animal" | "pet" = "animal", animalRarity: "common" | "rare" | "mythical" = "common"): RescueParticipant => ({ id, kind, animalRarity, pattern: { cells: [{ row: 0, col: 0 }] } });
test("tier scores are manually verifiable participant marginals", () => {
  const state = createDynamicRescueState([point("c"), point("m", "animal", "mythical"), point("p", "pet")]);
  const worlds: RescueWorld[] = [
    { participants: [{ participantId: "c", cells: [0] }, { participantId: "m", cells: [1] }, { participantId: "p", cells: [2] }] },
    { participants: [{ participantId: "c", cells: [0] }, { participantId: "m", cells: [3] }, { participantId: "p", cells: [1] }] },
  ];
  const scores = scoreWorldsByStrategy(worlds, state, RARITY_FOCUS_STRATEGY);
  assert.equal(scores[0].strategyScore, 0); assert.equal(scores[1].strategyScore, .5);
  assert.equal(scores[1].hitProbability, 1); assert.equal(scores[2].strategyScore, 0);
  assert.equal(analyzeRescueWorlds(state, worlds, RARITY_FOCUS_STRATEGY).recommendation?.cellIndex, 1);
});
test("pets remain in worlds and filtering under zero weight", () => {
  const state = createDynamicRescueState([point("a"), point("p", "pet")]);
  assert.equal(getPossibleWorlds(state).length, 600);
  const hit = applyObservation(state, { type: "hit", cellIndex: 3, participantId: "p" });
  const worlds = getPossibleWorlds(hit);
  assert.equal(worlds.length, 24);
  assert.ok(worlds.every(w => w.participants.find(p => p.participantId === "p")!.cells.includes(3)));
  assert.equal(analyzeDynamicRescue(hit, RARITY_FOCUS_STRATEGY).worldCount, worlds.length);
});
for (const pet of PET_SPECIES) test(`${pet.name}: pet-only Rarity Focus safely unavailable; other modes remain valid`, () => {
  const p = petParticipant(pet), state = createDynamicRescueState([p]);
  const r = analyzeDynamicRescue(state, RARITY_FOCUS_STRATEGY);
  assert.equal(r.status, "strategy-unavailable"); assert.equal(r.recommendation, null); assert.equal(r.scores.length, 0);
  for (const strategy of [{ type: "balanced" }, { type: "finish-found" }, { type: "target", participantId: p.id }] as const) assert.equal(analyzeDynamicRescue(state, strategy).status, "ready");
});
for (const count of [2, 3]) test(`Target advances through ${count} participants in selection order without changing worlds/history`, () => {
  const participants = [point("z"), point("a"), point("p", "pet")].slice(0, count);
  let state = createDynamicRescueState(participants);
  let strategy = { type: "target", participantId: "z" } as const as { type: "target"; participantId: string };
  for (let i = 0; i < count; i++) {
    state = applyObservation(state, { type: "hit", cellIndex: i, participantId: participants[i].id });
    const worlds = getPossibleWorlds(state), originalState = JSON.stringify(state), originalWorlds = JSON.stringify(worlds);
    const next = resolveTargetStrategy(state, worlds, strategy);
    assert.equal(JSON.stringify(state), originalState); assert.equal(JSON.stringify(worlds), originalWorlds);
    if (i < count - 1) {
      assert.deepEqual(next, { type: "target", participantId: participants[i + 1].id });
      assert.equal(analyzeRescueWorlds(state, worlds, strategy).status, "ready");
      strategy = next as typeof strategy;
    } else assert.equal(analyzeRescueWorlds(state, worlds, strategy).status, "complete");
  }
});
test("target progression skips already completed participants", () => {
  let state = createDynamicRescueState([point("z"), point("a"), point("p", "pet")]);
  state = applyObservation(state, { type: "hit", cellIndex: 1, participantId: "a" });
  state = applyObservation(state, { type: "hit", cellIndex: 0, participantId: "z" });
  assert.deepEqual(resolveTargetStrategy(state, getPossibleWorlds(state), { type: "target", participantId: "z" }), { type: "target", participantId: "p" });
});
test("manual unresolved target is preserved; invalid target still requires selection", () => {
  const state = createDynamicRescueState([point("a"), point("b")]), worlds = getPossibleWorlds(state);
  const selected = { type: "target", participantId: "b" } as const;
  assert.deepEqual(resolveTargetStrategy(state, worlds, selected), selected);
  assert.equal(analyzeRescueWorlds(state, worlds, { type: "target", participantId: "missing" }).status, "target-required");
});
test("uniquely known placement with unopened tiles is not complete", () => {
  const participant: RescueParticipant = { ...point("a"), pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] } };
  const state = applyObservation(createDynamicRescueState([participant]), { type: "hit", cellIndex: 0, participantId: "a" });
  const worlds: RescueWorld[] = [{ participants: [{ participantId: "a", cells: [0, 1] }] }];
  assert.deepEqual(resolvedParticipantIds(state, worlds), []);
  assert.equal(analyzeRescueWorlds(state, worlds, { type: "target", participantId: "a" }).recommendation?.cellIndex, 1);
});
test("contradiction wins over invalid strategy/target and undo resumes recommendation", () => {
  const state = applyObservation(createDynamicRescueState([point("p", "pet")]), { type: "hit", cellIndex: 0, participantId: "p" });
  const invalid = applyObservation(state, { type: "empty", cellIndex: 0 });
  for (const strategy of [RARITY_FOCUS_STRATEGY, { type: "target", participantId: "missing" }] as const) assert.equal(analyzeDynamicRescue(invalid, strategy).status, "contradiction");
  assert.deepEqual(undoObservation(invalid), state);
  assert.equal(analyzeDynamicRescue(resetObservations(invalid)).status, "ready");
});
test("epsilon and row-major ties unchanged", () => {
  assert.equal(chooseDynamicCell([{ cellIndex: 9, hitProbability: 1, strategyScore: 3 }, { cellIndex: 1, hitProbability: 1, strategyScore: 3 - 5e-13 }])?.cellIndex, 1);
});
for (const region of new Set(ANIMALS.map(a => a.regionId))) test(`${region}: policies preserve worlds, filtering, determinism, opened exclusions`, () => {
  const selected = ANIMALS.filter(a => a.regionId === region && !a.hidden && a.rarity !== "timeless").slice(0, 2).map(animalParticipant);
  const state = applyObservation(createDynamicRescueState([...selected, petParticipant(PET_SPECIES[0])]), { type: "empty", cellIndex: 24 });
  const worlds = getPossibleWorlds(state), snapshot = JSON.stringify(worlds);
  const balanced = analyzeRescueWorlds(state, worlds);
  assert.deepEqual(balanced.scores, scoreWorldsByHitProbability(worlds, state.observations));
  for (const strategy of [{ type: "balanced" }, { type: "finish-found" }, { type: "target", participantId: selected[0].id }, RARITY_FOCUS_STRATEGY] as const) {
    const r = analyzeRescueWorlds(state, worlds, strategy);
    assert.equal(r.worldCount, worlds.length); assert.deepEqual(analyzeRescueWorlds(state, worlds, strategy), r);
    assert.ok(r.scores.every(c => c.cellIndex !== 24));
  }
  assert.equal(JSON.stringify(worlds), snapshot);
});
