import assert from "node:assert/strict";
import test from "node:test";
import { ANIMALS } from "../../data/animals";
import { generatePlacements } from "./generatePlacements";
import { generateSearchSequence } from "./staticSolver";
import { applyRegionMiss, chooseRegionCell, generateRegionSearchSequence, REGION_SCORE_EPSILON, scoreRegionCells } from "./regionSolver";

function close(actual: number, expected: number) {
  assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`);
}

test("different legal placement counts still give each animal half the total mass", () => {
  const small = generatePlacements([{ row: 0, col: 0 }]);
  const tall = generatePlacements(Array.from({ length: 5 }, (_, row) => ({ row, col: 0 })));
  assert.equal(small.length, 25);
  assert.equal(tall.length, 5);
  const states = [{ animalId: "small", placements: small }, { animalId: "tall", placements: tall }];
  // Every cell: half / 25 from the point + half / 5 from the column.
  for (const score of scoreRegionCells(states)) close(score, 0.12);
  // Disjoint single-cell placements make each animal's total mass observable.
  const scores = scoreRegionCells([{ animalId: "a", placements: [[0], [1], [2]] }, { animalId: "b", placements: [[3]] }]);
  close(scores[0] + scores[1] + scores[2], 0.5);
  close(scores[3], 0.5);
});

test("synthetic cell scoring is the sum of animal-specific placement weights", () => {
  const scores = scoreRegionCells([{ animalId: "a", placements: [[0, 1], [1, 2]] }, { animalId: "b", placements: [[2, 3]] }]);
  assert.deepEqual(scores.slice(0, 4), [0.25, 0.5, 0.75, 0.5]);
  assert.equal(chooseRegionCell(scores, []), 2);
});

test("a miss redistributes equal animal mass across each survivor's remaining placements", () => {
  const states = [{ animalId: "a", placements: [[0], [1], [2]] }, { animalId: "b", placements: [[1], [3]] }];
  const after = applyRegionMiss(states, 0);
  const scores = scoreRegionCells(after);
  close(scores[1], 0.5);
  close(scores[2], 0.25);
  close(scores[3], 0.25);
  assert.equal(states[0].placements.length, 3, "miss filtering must not mutate input");
});

test("exhausted animals are removed and surviving animals split probability equally", () => {
  const after = applyRegionMiss([{ animalId: "gone", placements: [[0]] }, { animalId: "a", placements: [[1], [2]] }, { animalId: "b", placements: [[3]] }], 0);
  assert.deepEqual(after.map(a => a.animalId), ["a", "b"]);
  assert.deepEqual(scoreRegionCells(after).slice(0, 4), [0, 0.25, 0.25, 0.5]);
  assert.deepEqual(scoreRegionCells([]), Array(25).fill(0));
});

test("row-major tie breaking handles exact ties and floating point noise", () => {
  assert.equal(chooseRegionCell([0.5, 0.5], []), 0);
  assert.equal(chooseRegionCell([0.5, 0.5 + REGION_SCORE_EPSILON / 2], []), 0);
  assert.equal(chooseRegionCell([0.5, 0.5 + REGION_SCORE_EPSILON * 2], []), 1);
  assert.equal(chooseRegionCell([0.5, 0.5], [0]), 1);
  assert.throws(() => chooseRegionCell([], []), /No region search cells/);
});

test("single-animal sequences match the existing animal solver for all 42 patterns", () => {
  for (const animal of ANIMALS) {
    const actual = generateRegionSearchSequence([animal]).steps;
    const expected = generateSearchSequence(animal.id, animal.pattern).steps;
    assert.deepEqual(actual.map(s => s.cellIndex), expected.map(s => s.cell.row * 5 + s.cell.col), animal.id);
    actual.forEach((step, i) => { close(step.hitProbability, expected[i].probability); assert.equal(step.activeAnimals, 1); });
  }
});

for (const regionId of ["farm", "outback", "savanna", "northern", "polar", "jungle", "moon"]) {
  test(`${regionId}: deterministic, complete, valid region search`, () => {
    const animals = ANIMALS.filter(a => a.regionId === regionId && !a.hidden && a.rarity !== "timeless");
    const before = JSON.stringify(animals);
    const result = generateRegionSearchSequence(animals);
    assert.deepEqual(generateRegionSearchSequence(animals), result);
    assert.deepEqual(generateRegionSearchSequence(animals), result);
    assert.equal(JSON.stringify(animals), before);
    assert.ok(result.steps.length > 0 && result.steps.length <= 25);
    const selected = result.steps.map(s => s.cellIndex);
    assert.equal(new Set(selected).size, selected.length);
    result.steps.forEach((s, i) => {
      assert.equal(s.step, i + 1);
      assert.ok(Number.isInteger(s.cellIndex) && s.cellIndex >= 0 && s.cellIndex < 25);
      assert.ok(s.hitProbability > 0 && s.hitProbability <= 1 + REGION_SCORE_EPSILON);
      assert.ok(s.activeAnimals >= 1 && s.activeAnimals <= animals.length);
      if (i) assert.ok(s.activeAnimals <= result.steps[i - 1].activeAnimals);
    });
    for (const animal of animals) {
      assert.ok(generatePlacements(animal.pattern.cells).every(p => p.some(cell => selected.includes(cell))), animal.id);
    }
  });
}

test("empty candidate list returns an empty sequence", () => {
  assert.deepEqual(generateRegionSearchSequence([]), { steps: [] });
});

test("recorded steps reflect elimination and reweighting after the first miss", () => {
  const point = { id: "point", pattern: { cells: [{ row: 0, col: 0 }] } };
  const board = { id: "board", pattern: { cells: Array.from({ length: 25 }, (_, i) => ({ row: Math.floor(i / 5), col: i % 5 })) } };
  const { steps } = generateRegionSearchSequence([point, board]);
  assert.equal(steps[0].cellIndex, 0);
  assert.equal(steps[0].activeAnimals, 2);
  close(steps[0].hitProbability, 0.5 + 0.5 / 25);
  assert.equal(steps[1].cellIndex, 1);
  assert.equal(steps[1].activeAnimals, 1);
  close(steps[1].hitProbability, 1 / 24);
  assert.equal(steps.at(-1)!.hitProbability, 1);
});
