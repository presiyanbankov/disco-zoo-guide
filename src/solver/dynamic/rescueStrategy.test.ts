import assert from "node:assert/strict";
import test from "node:test";
import { ANIMALS } from "../../data/animals";
import { PET_SPECIES } from "../../data/pets";
import { animalParticipant, petParticipant } from "../../components/rescue/rescueParticipants";
import { analyzeDynamicRescue, analyzeRescueWorlds, applyObservation, chooseDynamicCell, createDynamicRescueState, filterRescueWorlds, generateRescueWorlds, getPossibleWorlds, resetObservations, scoreWorldsByHitProbability, undoObservation, type DynamicRescueState, type RescueParticipant, type RescueWorld } from "./dynamicRescueSolver";
import { RARITY_FOCUS_STRATEGY, participantStrategyWeight, scoreWorldsByStrategy, type RescueStrategy } from "./rescueStrategy";

const point = (id: string, kind: "animal" | "pet" = "animal", rarity: "common" | "rare" | "mythical" = "common"): RescueParticipant => ({ id, kind, animalRarity: rarity, pattern: { cells: [{ row: 0, col: 0 }] } });
const participants = [point("a"), point("b", "animal", "mythical"), point("pet:p", "pet")];
const state: DynamicRescueState = { participants, observations: [] };
// Hand-written non-overlapping worlds: B is certain at 1; A has two unopened alternatives.
const worlds: RescueWorld[] = [
  { participants: [{ participantId: "a", cells: [0, 4] }, { participantId: "b", cells: [1, 2] }, { participantId: "pet:p", cells: [6, 3] }] },
  { participants: [{ participantId: "a", cells: [0, 5] }, { participantId: "b", cells: [1, 3] }, { participantId: "pet:p", cells: [6, 2] }] },
];
const hitA: DynamicRescueState = { ...state, observations: [{ type: "hit", cellIndex: 0, participantId: "a" }] };
const score = (strategy: RescueStrategy, at: number, s = hitA) => scoreWorldsByStrategy(worlds, s, strategy).find(c => c.cellIndex === at)!;

test("balanced explicit/default retains exact ALPHA 09 scores and recommendation", () => {
  assert.deepEqual(analyzeRescueWorlds(hitA, worlds), analyzeRescueWorlds(hitA, worlds, { type: "balanced" }));
  const oldScores = scoreWorldsByHitProbability(worlds, hitA.observations);
  assert.deepEqual(analyzeRescueWorlds(hitA, worlds).scores, oldScores);
  assert.deepEqual(analyzeRescueWorlds(hitA, worlds).recommendation, chooseDynamicCell(oldScores));
});
test("balanced remains deterministic and chooses the lowest tied index", () => {
  const first = analyzeRescueWorlds(state, worlds);
  for (let i = 0; i < 5; i++) assert.deepEqual(analyzeRescueWorlds(state, worlds), first);
  assert.equal(first.recommendation?.cellIndex, 0);
});
test("weighted score ties use existing epsilon and row-major ordering", () => {
  assert.equal(chooseDynamicCell([{ cellIndex: 8, hitProbability: .9, strategyScore: 2 }, { cellIndex: 2, hitProbability: .1, strategyScore: 2 - 5e-13 }])?.cellIndex, 2);
  assert.equal(chooseDynamicCell([{ cellIndex: 2, hitProbability: 1, strategyScore: 2 - 2e-12 }, { cellIndex: 8, hitProbability: .1, strategyScore: 2 }])?.cellIndex, 8);
});
test("finish-found before any hits is exactly balanced utility", () => {
  const weighted = scoreWorldsByStrategy(worlds, state, { type: "finish-found" });
  assert.ok(weighted.every(s => s.strategyScore === s.hitProbability));
  assert.ok(participants.every(p => participantStrategyWeight(p, state, { type: "finish-found" }) === 1));
});
test("one found participant receives weight three and unhit participants remain one", () => {
  assert.equal(participantStrategyWeight(participants[0], hitA, { type: "finish-found" }), 3);
  assert.equal(participantStrategyWeight(participants[1], hitA, { type: "finish-found" }), 1);
  assert.equal(participantStrategyWeight(participants[2], hitA, { type: "finish-found" }), 1);
});
test("multiple found participants each receive three without accumulating extra hit bonuses", () => {
  const s = { ...hitA, observations: [...hitA.observations, { type: "hit" as const, cellIndex: 1, participantId: "b" }, { type: "hit" as const, cellIndex: 4, participantId: "a" }] };
  assert.equal(participantStrategyWeight(participants[0], s, { type: "finish-found" }), 3);
  assert.equal(participantStrategyWeight(participants[1], s, { type: "finish-found" }), 3);
});
test("pet receives the same found priority and its unopened tiles influence scoring", () => {
  const s = { ...state, observations: [{ type: "hit" as const, cellIndex: 6, participantId: "pet:p" }] };
  assert.equal(participantStrategyWeight(participants[2], s, { type: "finish-found" }), 3);
  assert.equal(score({ type: "finish-found" }, 2, s).strategyScore, 2);
});
test("undoing a first hit removes priority; EMPTY never starts priority", () => {
  assert.equal(participantStrategyWeight(participants[0], undoObservation(hitA), { type: "finish-found" }), 1);
  assert.equal(participantStrategyWeight(participants[0], { ...state, observations: [{ type: "empty", cellIndex: 24 }] }, { type: "finish-found" }), 1);
});
test("manual finish-found scores prefer A alternatives over certain unhit B", () => {
  assert.equal(score({ type: "finish-found" }, 4).strategyScore, 1.5);
  assert.equal(score({ type: "finish-found" }, 1).strategyScore, 1);
  assert.equal(analyzeRescueWorlds(hitA, worlds, { type: "finish-found" }).recommendation?.cellIndex, 4);
});
test("weighted utility does not inflate displayed hit probability", () => {
  const cell = score({ type: "finish-found" }, 4);
  assert.equal(cell.hitProbability, .5); assert.equal(cell.strategyScore, 1.5);
});
test("strict animal target excludes every non-target contribution", () => {
  assert.equal(score({ type: "target", participantId: "a" }, 1).strategyScore, 0);
  assert.equal(score({ type: "target", participantId: "a" }, 4).strategyScore, .5);
  assert.equal(analyzeRescueWorlds(hitA, worlds, { type: "target", participantId: "a" }).recommendation?.cellIndex, 4);
});
test("pet target scores only the pet, even when other participants can occupy the cell", () => {
  const s = { ...hitA, observations: [...hitA.observations, { type: "hit" as const, cellIndex: 6, participantId: "pet:p" }] };
  const cell = score({ type: "target", participantId: "pet:p" }, 2, s);
  assert.equal(cell.hitProbability, 1); assert.equal(cell.strategyScore, .5);
  assert.equal(analyzeRescueWorlds(s, worlds, { type: "target", participantId: "pet:p" }).recommendation?.cellIndex, 2);
});
test("changing targets deterministically changes recommendations without changing worlds", () => {
  const before = JSON.stringify(worlds);
  assert.equal(analyzeRescueWorlds(hitA, worlds, { type: "target", participantId: "a" }).recommendation?.cellIndex, 4);
  assert.equal(analyzeRescueWorlds(hitA, worlds, { type: "target", participantId: "b" }).recommendation?.cellIndex, 1);
  assert.equal(JSON.stringify(worlds), before);
});
test("fully reported target advances to remaining participant", () => {
  const s = applyObservation(createDynamicRescueState([point("a"), point("b")]), { type: "hit", cellIndex: 0, participantId: "a" });
  const r = analyzeDynamicRescue(s, { type: "target", participantId: "a" });
  assert.equal(r.status, "ready"); assert.equal(r.recommendation?.cellIndex, 1);
  assert.equal(analyzeDynamicRescue(s).status, "ready");
});
test("a determined but not fully opened target still recommends its guaranteed tiles", () => {
  const r = analyzeRescueWorlds(hitA, [worlds[0]], { type: "target", participantId: "a" });
  assert.equal(r.status, "ready"); assert.equal(r.recommendation?.cellIndex, 4); assert.equal(r.recommendation?.strategyScore, 1);
});
for (const participantId of ["", "missing"]) test(`invalid target ${JSON.stringify(participantId)} requires selection safely`, () => {
  const r = analyzeDynamicRescue(createDynamicRescueState(participants), { type: "target", participantId });
  assert.equal(r.status, "target-required"); assert.equal(r.recommendation, null); assert.ok(r.worldCount > 0);
});
test("mixed rarity scores use participant marginals, not any-hit probability", () => {
  assert.equal(score(RARITY_FOCUS_STRATEGY, 1).strategyScore, 1);
  assert.equal(score(RARITY_FOCUS_STRATEGY, 2).strategyScore, .5);
  assert.equal(score(RARITY_FOCUS_STRATEGY, 4).strategyScore, 0);
});
test("pet stays in worlds and exact hit filtering with zero rarity weight", () => {
  const s = applyObservation(createDynamicRescueState([point("a"), point("p", "pet")]), { type: "hit", cellIndex: 4, participantId: "p" });
  const r = analyzeDynamicRescue(s, RARITY_FOCUS_STRATEGY);
  assert.equal(r.worldCount, 24); assert.equal(r.recommendation?.cellIndex, 0);
  assert.ok(getPossibleWorlds(s).every(w => w.participants.find(p => p.participantId === "p")?.cells.includes(4)));
});
test("rarity ties and pet-only score cells retain row-major/opened-cell behavior", () => {
  const r = analyzeDynamicRescue(createDynamicRescueState([point("a"), point("p", "pet")]), RARITY_FOCUS_STRATEGY);
  assert.equal(r.recommendation?.cellIndex, 0);
  const s = applyObservation(createDynamicRescueState([point("a"), point("p", "pet")]), { type: "hit", cellIndex: 0, participantId: "a" });
  const done = analyzeDynamicRescue(s, RARITY_FOCUS_STRATEGY);
  assert.equal(done.status, "ready"); assert.equal(done.recommendation?.cellIndex, 1); assert.equal(analyzeDynamicRescue(s).status, "ready");
});
test("policy analysis does not mutate world generation, filtering, participants or observations", () => {
  const s = applyObservation(createDynamicRescueState(participants), { type: "empty", cellIndex: 0 });
  const before = JSON.stringify(s), initial = generateRescueWorlds(s.participants);
  const filtered = filterRescueWorlds(initial, s.observations);
  for (const strategy of [{ type: "balanced" }, { type: "finish-found" }, { type: "target", participantId: "a" }, RARITY_FOCUS_STRATEGY] as const) {
    assert.equal(analyzeDynamicRescue(s, strategy).worldCount, filtered.length);
    assert.deepEqual(getPossibleWorlds(s), filtered); assert.equal(JSON.stringify(s), before);
  }
});
test("contradiction takes precedence over strategy/invalid target", () => {
  let s = applyObservation(createDynamicRescueState([point("a")]), { type: "hit", cellIndex: 0, participantId: "a" });
  s = applyObservation(s, { type: "empty", cellIndex: 0 });
  for (const strategy of [{ type: "balanced" }, { type: "finish-found" }, { type: "target", participantId: "missing" }, RARITY_FOCUS_STRATEGY] as const) assert.equal(analyzeDynamicRescue(s, strategy).status, "contradiction");
});
test("undo/reset change observations only, keeping policy passed separately", () => {
  const s = createDynamicRescueState(participants), strategy = { type: "target", participantId: "b" } as const;
  const observed = applyObservation(s, { type: "empty", cellIndex: 24 });
  assert.deepEqual(analyzeDynamicRescue(undoObservation(observed), strategy), analyzeDynamicRescue(s, strategy));
  assert.deepEqual(analyzeDynamicRescue(resetObservations(observed), strategy), analyzeDynamicRescue(s, strategy));
});
test("all modes exclude previously opened hits and misses", () => {
  const s = { ...hitA, observations: [...hitA.observations, { type: "empty" as const, cellIndex: 24 }] };
  for (const strategy of [{ type: "balanced" }, { type: "finish-found" }, { type: "target", participantId: "a" }, RARITY_FOCUS_STRATEGY] as const) assert.ok(analyzeRescueWorlds(s, worlds, strategy).scores.every(c => c.cellIndex !== 0 && c.cellIndex !== 24));
});
for (const region of new Set(ANIMALS.map(a => a.regionId))) test(`${region}: four policies preserve real-world distribution and deterministic recommendations`, () => {
  const selected = ANIMALS.filter(a => a.regionId === region && !a.hidden && a.rarity !== "timeless").slice(-2).map(animalParticipant);
  const s = createDynamicRescueState([...selected, petParticipant(PET_SPECIES[0])]);
  const worlds = getPossibleWorlds(s);
  for (const strategy of [{ type: "balanced" }, { type: "finish-found" }, { type: "target", participantId: selected[0].id }, RARITY_FOCUS_STRATEGY] as const) {
    const r = analyzeDynamicRescue(s, strategy);
    assert.equal(r.worldCount, worlds.length); assert.equal(r.status, "ready");
    assert.deepEqual(analyzeDynamicRescue(s, strategy), r);
  }
});
