import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { StaticSearchResult } from "../../types/game";
import { DEV_MOCK_STRATEGY } from "./__fixtures__/DEV_MOCK_STRATEGY";
import { inspectPattern, inspectStrategy } from "./gridPresentation";
import { PatternGrid } from "./PatternGrid";
import { SearchOrderGrid } from "./SearchOrderGrid";

// Synthetic structural fixtures only. These tests make no search-optimality claim.
const supplied: StaticSearchResult = {
  animalId: "test-animal",
  steps: [
    { step: 2, cell: { row: 0, col: 4 }, probability: 0 },
    { step: 1, cell: { row: 3, col: 1 }, probability: 0 },
  ],
};

test("supplied order labels render in their supplied cells without mutating the result", () => {
  const before = JSON.stringify(supplied);
  const display = inspectStrategy(supplied, "test-animal");
  assert.equal(display.status, "ready");
  assert.deepEqual(display.steps.map((step) => step.cell), [{ row: 3, col: 1 }, { row: 0, col: 4 }]);
  assert.equal(JSON.stringify(supplied), before);
  const html = renderToStaticMarkup(createElement(SearchOrderGrid, { animalId: "test-animal", animalName: "Test animal", strategy: supplied }));
  assert.match(html, /search step 1, row 4, column 2/);
  assert.match(html, /search step 2, row 1, column 5/);
});

test("all 25 supplied numbers are visible immediately", () => {
  const syntheticFullBoard: StaticSearchResult = {
    animalId: "test-full-board",
    steps: Array.from({ length: 25 }, (_, index) => ({ step: index + 1, cell: { row: Math.floor(index / 5), col: index % 5 }, probability: 0 })),
  };
  const html = renderToStaticMarkup(createElement(SearchOrderGrid, { animalId: "test-full-board", animalName: "Test board", strategy: syntheticFullBoard }));
  const numbers = [...html.matchAll(/<button\b[^>]*>(\d+)<\/button>/g)].map((match) => Number(match[1]));
  assert.deepEqual(numbers, Array.from({ length: 25 }, (_, index) => index + 1));
});

test("missing, wrong-animal, duplicate, non-contiguous, and out-of-board results never produce recommendations", () => {
  assert.equal(inspectStrategy(undefined, "test-animal").status, "missing");
  const invalid: StaticSearchResult[] = [
    { ...supplied, animalId: "another-animal" },
    { ...supplied, steps: [] },
    { ...supplied, steps: supplied.steps.map((step) => ({ ...step, cell: { row: 1, col: 1 } })) },
    { ...supplied, steps: [{ step: 2, cell: { row: 0, col: 0 }, probability: 0 }] },
    { ...supplied, steps: [{ step: 1, cell: { row: 5, col: 0 }, probability: 0 }] },
    { ...supplied, steps: [{ step: 1, cell: { row: 0.5, col: 0 }, probability: 0 }] },
  ];
  for (const strategy of invalid) {
    assert.equal(inspectStrategy(strategy, "test-animal").status, "invalid");
    const html = renderToStaticMarkup(createElement(SearchOrderGrid, { animalId: "test-animal", animalName: "Test animal", strategy }));
    assert.match(html, /Strategy couldn’t be displayed/);
    assert.doesNotMatch(html, /<button/);
    assert.doesNotMatch(html, /Optimal search order/);
  }
});

test("development mock never matches a real animal and is labeled as a layout demo", () => {
  assert.equal(inspectStrategy(DEV_MOCK_STRATEGY, "pig").status, "invalid");
  const html = renderToStaticMarkup(createElement(SearchOrderGrid, { animalId: DEV_MOCK_STRATEGY.animalId, animalName: "Test animal", strategy: DEV_MOCK_STRATEGY, demo: true }));
  assert.match(html, /Example numbering/);
  assert.match(html, /not rescue advice/);
  assert.doesNotMatch(html, /Optimal search order/);
  assert.equal([...html.matchAll(/<button\b[^>]*>\d+<\/button>/g)].length, 8);
});

test("pattern rendering preserves supplied coordinates and does not invent missing shapes", () => {
  const pattern = { cells: [{ row: 2, col: 3 }, { row: 3, col: 3 }] };
  const html = renderToStaticMarkup(createElement(PatternGrid, { pattern, animalName: "Test animal" }));
  assert.match(html, /row 3, column 4; row 4, column 4/);
  assert.equal([...html.matchAll(/class="board-tile tile-pattern"/g)].length, 2);
  assert.equal(inspectPattern({ cells: [{ row: 0, col: 0 }, { row: 0, col: 0 }] }).status, "invalid");
  assert.equal(inspectPattern({ cells: [{ row: -1, col: 0 }] }).status, "invalid");
  const empty = renderToStaticMarkup(createElement(PatternGrid, { animalName: "Test animal" }));
  assert.match(empty, /Pattern not supplied yet/);
  assert.doesNotMatch(empty, /tile-pattern/);
});
