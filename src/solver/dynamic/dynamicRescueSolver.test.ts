import assert from "node:assert/strict";
import test from "node:test";
import { ANIMALS as CANONICAL_ANIMALS } from "../../data/animals";
import { generateSearchSequence } from "../static/staticSolver";
import {
  analyzeDynamicRescue, applyObservation, chooseDynamicCell, createDynamicRescueState,
  DYNAMIC_SCORE_EPSILON, filterRescueWorlds, generateRescueWorlds, getPossibleWorlds,
  resetObservations, scoreWorldsByHitProbability, undoObservation,
  type RescueParticipant, type RescueWorld,
} from "./dynamicRescueSolver";

const ANIMALS = CANONICAL_ANIMALS.map(a => ({ ...a, kind: "animal" as const }));

const point = (id: string): RescueParticipant => ({ id, kind: "animal", pattern: { cells: [{ row: 0, col: 0 }] } });
const row = (id: string): RescueParticipant => ({ id, kind: "animal", pattern: { cells: Array.from({ length: 5 }, (_, col) => ({ row: 0, col })) } });
const domino: RescueParticipant = { id: "domino", kind: "animal", pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] } };
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-12, `${a} != ${b}`);

test("selection requires 1–3 distinct animals from one region and valid patterns", () => {
  assert.throws(() => createDynamicRescueState([]), /one to three/);
  assert.throws(() => createDynamicRescueState([point("a"), point("b"), point("c"), point("d")]), /one to three/);
  assert.throws(() => createDynamicRescueState([point("a"), point("a")]), /distinct/);
  assert.throws(() => createDynamicRescueState([{ ...point("a"), pattern: { cells: [] } }]), /Invalid pattern/);
  assert.throws(() => createDynamicRescueState([{ ...point("a"), pattern: { cells: [{ row: 5, col: 0 }] } }]), /Invalid pattern/);
});

test("one animal follows the existing static greedy strategy along successive misses", () => {
  for (const animal of ANIMALS) {
    let state = createDynamicRescueState([animal]);
    for (const expected of generateSearchSequence(animal.id, animal.pattern).steps) {
      const result = analyzeDynamicRescue(state);
      assert.equal(result.status, "ready");
      assert.equal(result.recommendation!.cellIndex, expected.cell.row * 5 + expected.cell.col, animal.id);
      close(result.recommendation!.hitProbability, expected.probability);
      state = applyObservation(state, { type: "empty", cellIndex: result.recommendation!.cellIndex });
    }
    assert.equal(analyzeDynamicRescue(state).status, "contradiction", "missing every covering tile contradicts a guaranteed animal");
  }
});

test("two full-row animals yield 5 × 4 non-overlapping labeled worlds", () => {
  const worlds = generateRescueWorlds([row("a"), row("b")]);
  assert.equal(worlds.length, 20);
  for (const world of worlds) {
    assert.deepEqual(world.participants.map(a => a.participantId), ["a", "b"]);
    assert.equal(new Set(world.participants.flatMap(a => a.cells)).size, 10);
  }
});

test("three full-row animals yield 5 × 4 × 3 non-overlapping worlds", () => {
  const worlds = generateRescueWorlds([row("a"), row("b"), row("c")]);
  assert.equal(worlds.length, 60);
  for (const world of worlds) assert.equal(new Set(world.participants.flatMap(a => a.cells)).size, 15);
});

test("EMPTY removes every world containing any selected animal at that cell", () => {
  const state = applyObservation(createDynamicRescueState([row("a"), row("b")]), { type: "empty", cellIndex: 0 });
  const worlds = getPossibleWorlds(state);
  assert.equal(worlds.length, 12); // 4 × 3 remaining rows.
  assert.ok(worlds.every(w => w.participants.every(a => !a.cells.includes(0))));
});

test("exact animal HIT requires that animal and excludes the other animal", () => {
  const state = applyObservation(createDynamicRescueState([row("a"), row("b")]), { type: "hit", cellIndex: 0, participantId: "a" });
  const worlds = getPossibleWorlds(state);
  assert.equal(worlds.length, 4);
  assert.ok(worlds.every(w => w.participants[0].cells.includes(0) && !w.participants[1].cells.includes(0)));
  const incorrect: RescueWorld = { participants: [{ participantId: "a", cells: [1] }, { participantId: "b", cells: [0] }] };
  assert.deepEqual(filterRescueWorlds([incorrect], state.observations), []);
  const overlap: RescueWorld = { participants: [{ participantId: "a", cells: [0] }, { participantId: "b", cells: [0] }] };
  assert.deepEqual(filterRescueWorlds([overlap], state.observations), []);
});

test("multiple hits progressively collapse one animal's placement without completion heuristics", () => {
  let state = createDynamicRescueState([domino]);
  state = applyObservation(state, { type: "hit", cellIndex: 1, participantId: "domino" });
  assert.equal(getPossibleWorlds(state).length, 2);
  state = applyObservation(state, { type: "hit", cellIndex: 2, participantId: "domino" });
  assert.equal(getPossibleWorlds(state).length, 1);
  assert.equal(analyzeDynamicRescue(state).status, "complete");
});

test("a uniquely determined animal still recommends its unopened tiles with probability one", () => {
  const state = applyObservation(createDynamicRescueState([domino]), { type: "hit", cellIndex: 0, participantId: "domino" });
  const result = analyzeDynamicRescue(state);
  assert.equal(result.worldCount, 1);
  assert.equal(result.status, "ready");
  assert.deepEqual(result.recommendation, { cellIndex: 1, hitProbability: 1 });
});

test("manual worlds score any-animal occupancy, not independent animal marginals", () => {
  const worlds: RescueWorld[] = [
    { participants: [{ participantId: "a", cells: [0, 1] }, { participantId: "b", cells: [2] }] },
    { participants: [{ participantId: "a", cells: [0, 3] }, { participantId: "b", cells: [1] }] },
  ];
  const scores = scoreWorldsByHitProbability(worlds, []);
  assert.deepEqual(scores.slice(0, 4).map(s => s.hitProbability), [1, 1, 0.5, 0.5]);
  assert.equal(chooseDynamicCell(scores)!.cellIndex, 0);
});

test("tie selection is row-major even with reordered scores and epsilon noise", () => {
  assert.equal(chooseDynamicCell([{ cellIndex: 7, hitProbability: 0.5 }, { cellIndex: 2, hitProbability: 0.5 - DYNAMIC_SCORE_EPSILON / 2 }])!.cellIndex, 2);
  assert.equal(chooseDynamicCell([{ cellIndex: 7, hitProbability: 0.5 }, { cellIndex: 2, hitProbability: 0.5 - DYNAMIC_SCORE_EPSILON * 2 }])!.cellIndex, 7);
  assert.equal(chooseDynamicCell([]), null);
});

test("opened empty and animal cells are excluded from future scores and recommendations", () => {
  let state = createDynamicRescueState([row("a"), row("b")]);
  state = applyObservation(state, { type: "empty", cellIndex: 0 });
  state = applyObservation(state, { type: "hit", cellIndex: 5, participantId: "a" });
  const result = analyzeDynamicRescue(state);
  assert.ok(result.scores.every(s => s.cellIndex !== 0 && s.cellIndex !== 5));
  assert.equal(result.recommendation!.cellIndex, 6);
  assert.equal(result.recommendation!.hitProbability, 1);
});

test("contradictory observation histories produce a clear non-throwing result", () => {
  let state = createDynamicRescueState([point("a")]);
  state = applyObservation(state, { type: "hit", cellIndex: 0, participantId: "a" });
  state = applyObservation(state, { type: "hit", cellIndex: 1, participantId: "a" });
  assert.deepEqual(analyzeDynamicRescue(state), { status: "contradiction", worldCount: 0, scores: [], recommendation: null });
});

test("an impossible initial non-overlapping assignment is also a contradiction", () => {
  const cells = Array.from({ length: 25 }, (_, i) => ({ row: Math.floor(i / 5), col: i % 5 }));
  const state = createDynamicRescueState([{ ...point("board"), pattern: { cells } }, point("other")]);
  assert.deepEqual(getPossibleWorlds(state), []);
  assert.equal(analyzeDynamicRescue(state).status, "contradiction");
});

test("undo and reset deterministically reproduce prior worlds and recommendations without mutation", () => {
  const state = createDynamicRescueState([row("a"), row("b")]);
  const before = JSON.stringify(state);
  const next = applyObservation(state, { type: "empty", cellIndex: 0 });
  const hit = applyObservation(next, { type: "hit", cellIndex: 5, participantId: "a" });
  assert.deepEqual(analyzeDynamicRescue(undoObservation(hit)), analyzeDynamicRescue(next));
  assert.deepEqual(getPossibleWorlds(undoObservation(hit)), getPossibleWorlds(next));
  assert.deepEqual(analyzeDynamicRescue(resetObservations(hit)), analyzeDynamicRescue(state));
  assert.equal(JSON.stringify(state), before);
  assert.throws(() => applyObservation(state, { type: "hit", cellIndex: 0, participantId: "other" }), /not selected/);
  assert.throws(() => applyObservation(state, { type: "empty", cellIndex: 25 }), /Invalid board cell/);
});

for (const regionId of ["farm", "outback", "savanna", "northern", "polar", "jungle", "moon"]) {
  test(`${regionId}: real three-animal rescue is deterministic and responds consistently to observations`, () => {
    const animals = ANIMALS.filter(a => a.regionId === regionId && !a.hidden && a.rarity !== "timeless").slice(0, 3);
    const state = createDynamicRescueState(animals);
    const first = analyzeDynamicRescue(state);
    assert.equal(first.status, "ready");
    assert.ok(first.worldCount > 0);
    assert.deepEqual(analyzeDynamicRescue(state), first);
    const world = getPossibleWorlds(state)[0];
    const hit = world.participants[0];
    const next = applyObservation(state, { type: "hit", participantId: hit.participantId, cellIndex: hit.cells[0] });
    assert.ok(getPossibleWorlds(next).length > 0);
    assert.ok(getPossibleWorlds(next).length < first.worldCount);
    assert.notEqual(analyzeDynamicRescue(next).recommendation?.cellIndex, hit.cells[0]);
  });
}
