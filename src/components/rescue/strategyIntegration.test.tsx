import { rarityPriorityStrategy } from "../../solver/dynamic/rescueStrategy";
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ANIMALS } from "../../data/animals";
import { PET_SPECIES } from "../../data/pets";
import { analyzeDynamicRescue, applyObservation, createDynamicRescueState, getPossibleWorlds } from "../../solver/dynamic/dynamicRescueSolver";
import { StrategySelector } from "./StrategySelector";
import { RescueSetup } from "./RescueSetup";
import { RescueBoard } from "./RescueBoard";
import { animalParticipant, petParticipant } from "./rescueParticipants";
const noop = () => {};
const farm = ANIMALS.filter(a => a.regionId === "farm" && !a.hidden && a.rarity !== "timeless");
const participants = [animalParticipant(farm[0]), petParticipant(PET_SPECIES[0])];
const state = createDynamicRescueState(participants);
const actions = { onObservation: noop, onUndo: noop, onReset: noop, onChange: noop };

test("strategy selector offers exactly four named controls with Balanced default and visible selection", () => {
  const html = renderToStaticMarkup(<StrategySelector strategy={{ type: "balanced" }} participants={participants} onStrategy={noop} onTarget={noop} />);
  for (const name of ["Balanced Search", "Finish What You Found", "Target One", "Rarity Priority"]) assert.ok(html.includes(name));
  assert.equal((html.match(/data-strategy=/g) ?? []).length, 4);
  assert.match(html, /data-strategy="balanced" aria-pressed="true"/);
  assert.match(html, /class="strategy-check" aria-hidden="true"/);
});
test("Target One lists only selected participants with authentic artwork and no implicit target", () => {
  const html = renderToStaticMarkup(<StrategySelector strategy={{ type: "target", participantId: "" }} participants={participants} onStrategy={noop} onTarget={noop} />);
  assert.equal((html.match(/data-target-id=/g) ?? []).length, 2);
  assert.ok(html.includes(`data-target-id="${participants[0].id}"`)); assert.match(html, /data-target-id="pet:rabbit"/);
  assert.doesNotMatch(html, /data-target-id="[^"]+"[^>]*aria-pressed="true"/);
  assert.match(html, /Select a target to continue/); assert.match(html, /data-pet-art="tile"/);
});
for (const target of participants) test(`Target One visibly selects ${target.kind} without changing the available participants`, () => {
  const html = renderToStaticMarkup(<StrategySelector strategy={{ type: "target", participantId: target.id }} participants={participants} onStrategy={noop} onTarget={noop} />);
  assert.ok(html.includes(`data-target-id="${target.id}" data-participant-kind="${target.kind}" aria-pressed="true"`));
  assert.equal((html.match(/data-target-id=/g) ?? []).length, 2); assert.doesNotMatch(html, /Select a target to continue/);
});
test("Rarity Priority displays compact discrete priority controls", () => {
  const html = renderToStaticMarkup(<StrategySelector strategy={rarityPriorityStrategy()} participants={participants} onStrategy={noop} onTarget={noop} />);
  assert.match(html, /Common/); assert.match(html, /Rare/); assert.match(html, /Mythical/); assert.match(html, /Pet/);
  assert.match(html, /class="rarity-priority-controls"/); assert.doesNotMatch(html, /data-target-id/);
});
test("setup requires an explicit valid target before starting; Balanced remains enabled", () => {
  const props = { regionId: "farm", selectedIds: [farm[0].id], animals: ANIMALS, participants, onRegion: noop, onAnimal: noop, onStart: noop };
  const missing = renderToStaticMarkup(<RescueSetup {...props} strategy={{ type: "target", participantId: "" }} />);
  assert.match(missing, /class="rescue-primary rescue-start-cta" type="button" disabled=""/);
  for (const strategy of [{ type: "balanced" }, { type: "target", participantId: participants[1].id }] as const) {
    const html = renderToStaticMarkup(<RescueSetup {...props} strategy={strategy} />);
    assert.doesNotMatch(html, /class="rescue-primary rescue-start-cta" type="button" disabled/);
  }
});
test("finish-found live roster has a textual priority marker only after a named hit", () => {
  const petCell = getPossibleWorlds(state)[0].participants.find(p => p.participantId === participants[1].id)!.cells[0];
  const observed = applyObservation(state, { type: "hit", cellIndex: petCell, participantId: participants[1].id });
  const strategy = { type: "finish-found" } as const;
  const html = renderToStaticMarkup(<RescueBoard regionName="Farm" participants={participants} state={observed} result={analyzeDynamicRescue(observed, strategy)} strategy={strategy} {...actions} />);
  assert.match(html, /1 participants currently prioritized/); assert.match(html, /FOUND \/ PRIORITY/);
  assert.equal((html.match(/data-prioritized="true"/g) ?? []).length, 1);
  const balanced = renderToStaticMarkup(<RescueBoard regionName="Farm" participants={participants} state={observed} result={analyzeDynamicRescue(observed)} {...actions} />);
  assert.doesNotMatch(balanced, /FOUND \/ PRIORITY/); assert.match(balanced, /data-cell-state="animal"/);
});
test("live target-required preserves selector, undo and reset without fake recommendation", () => {
  const strategy = { type: "target", participantId: "" } as const;
  const html = renderToStaticMarkup(<RescueBoard regionName="Farm" participants={participants} state={state} result={analyzeDynamicRescue(state, strategy)} strategy={strategy} {...actions} />);
  assert.match(html, /Select a target/); assert.doesNotMatch(html, /data-recommended="true"/);
  assert.match(html, /Undo last result/); assert.match(html, /Reset rescue/);
});
test("fully reported target visibly pauses and keeps the participant selector available", () => {
  let observed = state;
  const cells = getPossibleWorlds(state)[0].participants.find(p => p.participantId === participants[0].id)!.cells;
  for (const cellIndex of cells) observed = applyObservation(observed, { type: "hit", cellIndex, participantId: participants[0].id });
  const strategy = { type: "target", participantId: participants[0].id } as const;
  const html = renderToStaticMarkup(<RescueBoard regionName="Farm" participants={participants} state={observed} result={analyzeDynamicRescue(observed, strategy)} strategy={strategy} {...actions} />);
  assert.match(html, /data-rescue-status="target-resolved"/); assert.match(html, /Target resolved/);
  assert.doesNotMatch(html, /data-recommended="true"/); assert.equal((html.match(/data-target-id=/g) ?? []).length, 2);
  assert.match(html, /Choose a target above or change strategy/);
});
test("classic participant presentation passes canonical rarity only to dynamic policy metadata", () => {
  for (const animal of farm) assert.equal(animalParticipant(animal).animalRarity, animal.rarity);
  assert.equal(petParticipant(PET_SPECIES[0]).animalRarity, undefined);
});
