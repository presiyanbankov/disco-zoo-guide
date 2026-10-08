import assert from "node:assert/strict";
import test from "node:test";
import { analyzeRescueWorlds, applyObservation, createDynamicRescueState, type RescueParticipant, type RescueWorld } from "./dynamicRescueSolver";
import { rarityFocusParticipantIds, RARITY_FOCUS_STRATEGY, scoreWorldsByStrategy } from "./rescueStrategy";

const point = (id: string, rarity: "common" | "rare" | "mythical", kind: "animal" | "pet" = "animal"): RescueParticipant => ({ id, kind, animalRarity: rarity, pattern: { cells: [{ row: 0, col: 0 }] } });
const participants = [point("common", "common"), point("rare", "rare"), point("mythical", "mythical")];
const worlds: RescueWorld[] = [{ participants: participants.map((p, i) => ({ participantId: p.id, cells: [i] })) }];
const initial = createDynamicRescueState(participants);
test("a diffuse Mythical still wins over certain Rare and Common tiles", () => {
  const layouts: RescueWorld[] = [2, 3, 4, 5].map(cell => ({ participants: [
    { participantId: "common", cells: [0] }, { participantId: "rare", cells: [1] }, { participantId: "mythical", cells: [cell] },
  ] }));
  const result = analyzeRescueWorlds(initial, layouts, RARITY_FOCUS_STRATEGY);
  assert.equal(result.scores[0].hitProbability, 1); assert.equal(result.scores[1].hitProbability, 1);
  assert.equal(result.scores[0].strategyScore, 0); assert.equal(result.scores[1].strategyScore, 0);
  assert.equal(result.recommendation?.cellIndex, 2); assert.equal(result.recommendation?.hitProbability, .25);
});
test("Mythical + Rare + Common: only Mythical contributes", () => {
  assert.deepEqual(rarityFocusParticipantIds(initial, worlds), ["mythical"]);
  const scores = scoreWorldsByStrategy(worlds, initial, RARITY_FOCUS_STRATEGY);
  assert.equal(scores[0].strategyScore, 0); assert.equal(scores[1].strategyScore, 0); assert.equal(scores[2].strategyScore, 1);
  assert.equal(analyzeRescueWorlds(initial, worlds, RARITY_FOCUS_STRATEGY).recommendation?.cellIndex, 2);
});
test("after Mythical completion Rare is active", () => {
  const state = applyObservation(initial, { type: "hit", cellIndex: 2, participantId: "mythical" });
  assert.deepEqual(rarityFocusParticipantIds(state, worlds), ["rare"]);
  assert.equal(analyzeRescueWorlds(state, worlds, RARITY_FOCUS_STRATEGY).recommendation?.cellIndex, 1);
});
test("after Rare completion Common is active", () => {
  let state = applyObservation(initial, { type: "hit", cellIndex: 2, participantId: "mythical" });
  state = applyObservation(state, { type: "hit", cellIndex: 1, participantId: "rare" });
  assert.deepEqual(rarityFocusParticipantIds(state, worlds), ["common"]);
  assert.equal(analyzeRescueWorlds(state, worlds, RARITY_FOCUS_STRATEGY).recommendation?.cellIndex, 0);
});
test("two Rares score together rather than arbitrarily choosing one", () => {
  const state = createDynamicRescueState([point("a", "rare"), point("b", "rare"), point("c", "common")]);
  const worlds: RescueWorld[] = [
    { participants: [{ participantId: "a", cells: [4] }, { participantId: "b", cells: [2] }, { participantId: "c", cells: [0] }] },
    { participants: [{ participantId: "a", cells: [2] }, { participantId: "b", cells: [5] }, { participantId: "c", cells: [0] }] },
  ];
  assert.deepEqual(rarityFocusParticipantIds(state, worlds), ["a", "b"]);
  const scores = scoreWorldsByStrategy(worlds, state, RARITY_FOCUS_STRATEGY);
  assert.equal(scores[2].strategyScore, 1); assert.equal(scores[4].strategyScore, .5); assert.equal(scores[5].strategyScore, .5);
  assert.equal(analyzeRescueWorlds(state, worlds, RARITY_FOCUS_STRATEGY).recommendation?.cellIndex, 2);
});
for (const rarity of ["mythical", "rare", "common"] as const) test(`pet + unresolved ${rarity}: pet cannot compete`, () => {
  const state = createDynamicRescueState([point("a", rarity), point("p", "common", "pet")]);
  const worlds: RescueWorld[] = [
    { participants: [{ participantId: "a", cells: [3] }, { participantId: "p", cells: [0] }] },
    { participants: [{ participantId: "a", cells: [4] }, { participantId: "p", cells: [0] }] },
  ];
  const result = analyzeRescueWorlds(state, worlds, RARITY_FOCUS_STRATEGY);
  assert.equal(result.status, "ready"); assert.equal(result.recommendation?.cellIndex, 3);
  assert.equal(result.scores[0].strategyScore, 0);
});
test("after all normal animals complete, pet cleanup continues to completion", () => {
  const initial = createDynamicRescueState([point("a", "mythical"), point("p", "common", "pet")]);
  const worlds: RescueWorld[] = [{ participants: [{ participantId: "a", cells: [0] }, { participantId: "p", cells: [1] }] }];
  const state = applyObservation(initial, { type: "hit", cellIndex: 0, participantId: "a" });
  const snapshot = JSON.stringify({ state, worlds });
  assert.deepEqual(rarityFocusParticipantIds(state, worlds), ["p"]);
  assert.equal(analyzeRescueWorlds(state, worlds, RARITY_FOCUS_STRATEGY).recommendation?.cellIndex, 1);
  assert.equal(JSON.stringify({ state, worlds }), snapshot);
  const complete = applyObservation(state, { type: "hit", cellIndex: 1, participantId: "p" });
  assert.equal(analyzeRescueWorlds(complete, worlds, RARITY_FOCUS_STRATEGY).status, "complete");
});
test("tier ties remain deterministic lowest row-major", () => {
  const state = createDynamicRescueState([point("a", "mythical")]);
  const worlds: RescueWorld[] = [{ participants: [{ participantId: "a", cells: [9] }] }, { participants: [{ participantId: "a", cells: [2] }] }];
  for (let i = 0; i < 5; i++) assert.equal(analyzeRescueWorlds(state, worlds, RARITY_FOCUS_STRATEGY).recommendation?.cellIndex, 2);
});
