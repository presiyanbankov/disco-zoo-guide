import { REGION_PRESENTATION } from "../regions/regionPresentation";
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderWithFullProgress as renderToStaticMarkup } from "../progress/progressTestSupport";
import RescuePage from "../../app/rescue/page";
import { ANIMALS as CANONICAL_ANIMALS } from "../../data/animals";
import { analyzeDynamicRescue, applyObservation, createDynamicRescueState } from "../../solver/dynamic/dynamicRescueSolver";
import { SITE_VERSION } from "../layout/siteVersion";
import { RescueSetup } from "./RescueSetup";
import { RescueBoard } from "./RescueBoard";
import { ResultSelector } from "./ResultSelector";

const ANIMALS = CANONICAL_ANIMALS.map(a => ({ ...a, kind: "animal" as const }));

const noop = () => {};
const animals = ANIMALS.filter(a => a.regionId === "farm" && !a.hidden && a.rarity !== "timeless");
const actions = { onObservation: noop, onUndo: noop, onReset: noop, onChange: noop };

test("rescue route presents all implemented regions, no locked/Timeless choices, and centralized version", async () => {
  const html = renderToStaticMarkup(await RescuePage());
  assert.match(html, /data-route-page="\/rescue"/);
  assert.equal((html.match(/class="rescue-region region-/g) ?? []).length, REGION_PRESENTATION.length);
  assert.match(html, /Select a region/);
  assert.match(SITE_VERSION, /^(?:ALPHA|BETA) \d{2}$/);
  assert.ok(html.includes(SITE_VERSION));
  assert.doesNotMatch(html, /data-animal-id="chicken"/);
});

test("setup offers only the chosen region's six animals and disables a fourth selection", () => {
  const html = renderToStaticMarkup(createElement(RescueSetup, { regionId: "farm", selectedIds: animals.slice(0, 3).map(a => a.id), animals: ANIMALS.filter(a => a.rarity !== "timeless"), onRegion: noop, onAnimal: noop, onStart: noop }));
  assert.equal((html.match(/class="rescue-animal-option"/g) ?? []).length, 6);
  assert.equal((html.match(/class="rescue-animal-option" aria-pressed="true"/g) ?? []).length, 3);
  assert.equal((html.match(/class="rescue-animal-option" aria-pressed="false" disabled=""/g) ?? []).length, 3);
  assert.match(html, /3 \/ 3 SELECTED/);
  assert.doesNotMatch(html, /Kangaroo|Moonkey|Timeless/);
  const initial = renderToStaticMarkup(createElement(RescueSetup, { regionId: null, selectedIds: [], animals: ANIMALS.filter(a => a.rarity !== "timeless"), onRegion: noop, onAnimal: noop, onStart: noop }));
  assert.match(initial, /class="rescue-primary rescue-start-cta" type="button" disabled=""/);
});

test("live board renders real recommendation and distinct opened empty/animal states", () => {
  let state = createDynamicRescueState([animals[0]]);
  state = applyObservation(state, { type: "hit", participantId: animals[0].id, cellIndex: 0 });
  state = applyObservation(state, { type: "empty", cellIndex: 24 });
  const result = analyzeDynamicRescue(state);
  assert.equal(result.status, "ready");
  const html = renderToStaticMarkup(createElement(RescueBoard, { regionName: "Farm", participants: [animals[0]], state, result, ...actions }));
  assert.equal((html.match(/data-cell-index=/g) ?? []).length, 25);
  assert.match(html, /data-cell-index="0" data-cell-state="animal" disabled=""/);
  assert.match(html, /data-cell-index="24" data-cell-state="empty" disabled=""/);
  assert.ok(html.includes(`data-cell-index="${result.recommendation!.cellIndex}" data-cell-state="unopened" data-recommended="true"`));
  assert.match(html, /data-art-source="hq"/);
  assert.match(html, /Undo last result/);
  assert.match(html, /Reset rescue/);
});

test("contradiction preserves undo/reset, disables reporting, and does not show a recommendation", () => {
  let state = createDynamicRescueState([animals[0]]);
  state = applyObservation(state, { type: "hit", participantId: animals[0].id, cellIndex: 0 });
  state = applyObservation(state, { type: "hit", participantId: animals[0].id, cellIndex: 24 });
  const result = analyzeDynamicRescue(state);
  assert.equal(result.status, "contradiction");
  const html = renderToStaticMarkup(createElement(RescueBoard, { regionName: "Farm", participants: [animals[0]], state, result, ...actions }));
  assert.match(html, /role="alert"/);
  assert.match(html, /Check the last result or undo it/);
  assert.doesNotMatch(html, /data-recommended="true"/);
  assert.equal((html.match(/data-cell-state="[^"]+" disabled=""/g) ?? []).length, 25);
});

test("result selector has accessible named dialog, Empty and every selected animal with keyboard hints", () => {
  const html = renderToStaticMarkup(createElement(ResultSelector, { cellIndex: 7, anchor: { left: 20, top: 20 }, participants: animals.slice(0, 3), onResult: noop, onClose: noop }));
  assert.match(html, /role="dialog" aria-modal="true"/);
  assert.match(html, /Row 2 \/ Column 3/);
  assert.equal((html.match(/class="rescue-result-animal"/g) ?? []).length, 3);
  assert.match(html, /<strong>Empty<\/strong><kbd>E<\/kbd>/);
  for (const animal of animals.slice(0, 3)) assert.ok(html.includes(`<strong>${animal.name}</strong>`));
  assert.doesNotMatch(html, /<select/);
});

test("completion appears only after every possible animal tile has been reported", () => {
  const pig = animals.find(a => a.id === "pig")!;
  let state = createDynamicRescueState([pig]);
  for (const cell of pig.pattern.cells) state = applyObservation(state, { type: "hit", cellIndex: cell.row * 5 + cell.col, participantId: pig.id });
  const result = analyzeDynamicRescue(state);
  assert.equal(result.status, "complete");
  const html = renderToStaticMarkup(createElement(RescueBoard, { regionName: "Farm", participants: [pig], state, result, ...actions }));
  assert.match(html, /RESCUE COMPLETE/);
  assert.doesNotMatch(html, /data-recommended="true"/);
});
