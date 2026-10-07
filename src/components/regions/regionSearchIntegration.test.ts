import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ANIMALS } from "../../data/animals";
import { generateRegionSearchSequence } from "../../solver/static/regionSolver";
import { RegionSearch } from "./RegionSearch";
import { REGION_PRESENTATION } from "./regionPresentation";
import { getRegionSearchPresentation } from "./regionSearchPresentation";

test("all seven region grids immediately render real steps in their cells and leave other cells blank", () => {
  for (const region of REGION_PRESENTATION) {
    const animals = ANIMALS.filter(a => a.regionId === region.id && !a.hidden && a.rarity !== "timeless");
    const strategy = getRegionSearchPresentation(animals);
    assert.equal(strategy.status, "ready");
    assert.deepEqual(strategy.steps, generateRegionSearchSequence(animals).steps);
    const html = renderToStaticMarkup(createElement(RegionSearch, { regionName: region.name, strategy }));
    const board = html.match(/<div class="rescue-board"[^>]*>([\s\S]*?)<\/div>/)![1];
    const cells = [...board.matchAll(/<(?:button|span)[^>]*class="board-tile ([^"]+)"[^>]*>(.*?)<\/(?:button|span)>/g)];
    assert.equal(cells.length, 25);
    cells.forEach((cell, index) => {
      const step = strategy.steps.find(s => s.cellIndex === index);
      assert.equal(cell[2], step ? String(step.step) : "", `${region.id}: cell ${index}`);
    });
    assert.equal((board.match(/<button/g) ?? []).length, strategy.steps.length);
    assert.match(html, /Assumes each animal is equally likely/);
    assert.doesNotMatch(html, /tile-pattern|PENDING/);
  }
});

test("missing/invalid patterns and solver failures retain a graceful unnumbered region grid", () => {
  const fixtures = [[], [{ id: "missing" }], [{ id: "empty", pattern: { cells: [] } }], [{ id: "invalid", pattern: { cells: [{ row: 5, col: 0 }] } }]];
  for (const animals of fixtures) assert.deepEqual(getRegionSearchPresentation(animals), { status: "pending", steps: [] });
  const strategy = getRegionSearchPresentation([ANIMALS[0]], () => { throw new Error("expected failure"); });
  assert.equal(strategy.status, "pending");
  assert.deepEqual(strategy.steps, []);
  const html = renderToStaticMarkup(createElement(RegionSearch, { regionName: "Farm", strategy }));
  assert.match(html, /Sequence not available yet/);
  assert.equal((html.match(/class="board-tile tile-quiet"/g) ?? []).length, 25);
  assert.doesNotMatch(html, /tile-first|tile-step/);
});
