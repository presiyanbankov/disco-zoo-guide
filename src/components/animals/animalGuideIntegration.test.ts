import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ANIMALS } from "../../data/animals";
import { generateSearchSequence } from "../../solver/static/staticSolver";
import { AnimalGuideGrids } from "./AnimalGuideGrids";
import { generateAnimalGuideStrategy, getAnimalGuidePresentation, getRegionAnimalPresentations, type AnimalGuidePresentation } from "./animalGuidePresentation";

function render(animal: AnimalGuidePresentation) {
  return renderToStaticMarkup(createElement(AnimalGuideGrids, {
    animalId: animal.id, animalName: animal.name, pattern: animal.pattern,
    strategy: animal.strategy, strategyUnavailableReason: animal.strategyUnavailableReason,
    strategyError: animal.strategyError,
  }));
}
function boards(html: string) {
  return [...html.matchAll(/<div class="rescue-board"[^>]*>([\s\S]*?)<\/div>/g)].map((match) => match[1]);
}

test("all real animal guide lookups render the owner sequence immediately and preserve independent approved patterns", () => {
  const before = JSON.stringify(ANIMALS);
  for (const record of ANIMALS) {
    const animal = getAnimalGuidePresentation(record.regionId, record.id)!;
    const expected = generateSearchSequence(record.id, record.pattern);
    assert.deepEqual(animal.strategy, expected);
    assert.equal(animal.pattern, record.pattern);
    const html = render(animal);
    assert.doesNotMatch(html, /LAYOUT DEMO|Show layout demo|__DEV_LAYOUT_ONLY__/);
    const [pattern, search] = boards(html);
    assert.equal(boards(html).length, 2);
    const occupied = [...pattern.matchAll(/class="board-tile tile-(pattern|quiet)"/g)].map((match) => match[1]);
    assert.equal(occupied.length, 25);
    const patternCells = new Set(record.pattern.cells.map((cell) => cell.row * 5 + cell.col));
    occupied.forEach((kind, index) => assert.equal(kind, patternCells.has(index) ? "pattern" : "quiet"));
    assert.doesNotMatch(pattern, /<button/);
    assert.doesNotMatch(search, /pattern-pixel/);
    const tiles = [...search.matchAll(/<button\b[^>]*>(\d+)<\/button>|<span class="board-tile tile-quiet"[^>]*><\/span>/g)].map((match) => match[1] ? Number(match[1]) : null);
    assert.equal(tiles.length, 25);
    const steps = new Map(expected.steps.map((step) => [step.cell.row * 5 + step.cell.col, step.step]));
    tiles.forEach((number, index) => assert.equal(number, steps.get(index) ?? null));
    assert.equal(tiles.filter((number) => number !== null).length, expected.steps.length);
  }
  assert.equal(JSON.stringify(ANIMALS), before);
  assert.ok(getRegionAnimalPresentations("farm").every((animal) => animal.strategy === undefined));
});

test("missing and invalid patterns preserve the guide and never call the solver", () => {
  const pig = getRegionAnimalPresentations("farm").find((animal) => animal.id === "pig")!;
  for (const pattern of [undefined, { cells: [] }, { cells: [{ row: 5, col: 0 }] }]) {
    const animal = generateAnimalGuideStrategy({ ...pig, pattern }, () => { assert.fail("Invalid pattern reached solver"); });
    assert.equal(animal.strategy, undefined);
    const html = render(animal);
    assert.match(html, /Pig rescue guide/);
    assert.match(html, /A valid animal pattern is needed/);
    assert.doesNotMatch(html, /<button/);
  }
});

test("missing strategy leaves the valid pattern visible without inventing numbered cells", () => {
  const pig = getRegionAnimalPresentations("farm").find((animal) => animal.id === "pig")!;
  const html = render(pig);
  assert.match(html, /tile-pattern/);
  assert.match(html, /Strategy not available yet/);
  assert.doesNotMatch(html, /<button/);
});

test("solver exceptions preserve the pattern, expose original development errors, and use a quiet production fallback", (t) => {
  const pig = getRegionAnimalPresentations("farm").find((animal) => animal.id === "pig")!;
  const error = new Error("Integration test failure");
  const previous = process.env.NODE_ENV;
  const log = t.mock.method(console, "error", () => {});
  try {
    Object.assign(process.env, { NODE_ENV: "development" });
    const failed = generateAnimalGuideStrategy(pig, () => { throw error; });
    assert.equal(failed.pattern, pig.pattern);
    assert.equal(failed.strategy, undefined);
    assert.equal(log.mock.calls[0].arguments[1], error);
    const html = render(failed);
    assert.match(html, /Development error: Integration test failure/);
    assert.match(html, /tile-pattern/);
    assert.doesNotMatch(html, /<button/);
    Object.assign(process.env, { NODE_ENV: "production" });
    const production = generateAnimalGuideStrategy(pig, () => { throw error; });
    assert.equal(production.strategyError, undefined);
    assert.match(render(production), /could not be generated/);
    assert.doesNotMatch(render(production), /Integration test failure/);
    assert.equal(log.mock.calls.length, 1);
  } finally {
    if (previous === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Object.assign(process.env, { NODE_ENV: previous });
  }
});
