import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ANIMALS } from "../../data/animals";
import { PET_SPECIES } from "../../data/pets";
import { analyzeDynamicRescue, applyObservation, createDynamicRescueState, getPossibleWorlds } from "../../solver/dynamic/dynamicRescueSolver";
import { RARITY_FOCUS_STRATEGY } from "../../solver/dynamic/rescueStrategy";
import { RescueBoard } from "./RescueBoard";
import { RescueSetup } from "./RescueSetup";
import { StrategySelector } from "./StrategySelector";
import { animalParticipant, petParticipant, validateRescueSetup } from "./rescueParticipants";
const noop = () => {};
const farm = ANIMALS.filter(a => a.regionId === "farm");
const pet = petParticipant(PET_SPECIES[0]);
const actions = { onObservation: noop, onUndo: noop, onReset: noop, onChange: noop, onNext: noop };
const setup = { regionId: null, selectedIds: [], animals: ANIMALS, onRegion: noop, onAnimal: noop, onStart: noop };
test("tiered Rarity Focus explains intent without numeric controls", () => {
  const html = renderToStaticMarkup(<StrategySelector strategy={RARITY_FOCUS_STRATEGY} participants={[animalParticipant(farm[0]), pet]} onStrategy={noop} onTarget={noop} />);
  assert.match(html, /Rarity Focus/); assert.match(html, /Prioritize Mythical, then Rare \+ Timeless, then Common/); assert.match(html, /affect priority/);
  assert.doesNotMatch(html, /Rarity Priority|priority-values|radiogroup/);
});
test("pet-only omits inapplicable Rarity Focus and can start Balanced", () => {
  const html = renderToStaticMarkup(<RescueSetup {...setup} petId={PET_SPECIES[0].id} />);
  assert.doesNotMatch(html, /data-strategy="rarity-focus"/);
  assert.doesNotMatch(html, /class="rescue-primary rescue-start-cta" type="button" disabled/);
  const invalid = renderToStaticMarkup(<RescueSetup {...setup} petId={PET_SPECIES[0].id} strategy={RARITY_FOCUS_STRATEGY} />);
  assert.match(invalid, /class="rescue-primary rescue-start-cta" type="button" disabled/);
});
test("empty setup remains disabled and six participant configurations remain valid", () => {
  const html = renderToStaticMarkup(<RescueSetup {...setup} />);
  assert.match(html, /class="rescue-primary rescue-start-cta" type="button" disabled/);
  for (const [animals, pets] of [[[], [PET_SPECIES[0]]], [farm.slice(0, 1), []], [farm.slice(0, 2), []], [farm.slice(0, 3), []], [farm.slice(0, 1), [PET_SPECIES[0]]], [farm.slice(0, 2), [PET_SPECIES[0]]]] as const) assert.equal(validateRescueSetup(animals, pets), null);
  assert.ok(validateRescueSetup(farm.slice(0, 3), [PET_SPECIES[0]])); assert.ok(validateRescueSetup([], PET_SPECIES.slice(0, 2)));
});
test("successful rescue exposes explicit completion and both next/review actions", () => {
  let state = createDynamicRescueState([pet]);
  const placement = getPossibleWorlds(state)[0].participants[0];
  for (const cellIndex of placement.cells) state = applyObservation(state, { type: "hit", cellIndex, participantId: pet.id });
  const html = renderToStaticMarkup(<RescueBoard regionName="Pet rescue" participants={[pet]} state={state} result={analyzeDynamicRescue(state)} {...actions} />);
  assert.match(html, /data-rescue-status="complete"/); assert.match(html, /RESCUE COMPLETE/); assert.match(html, /Next Rescue/); assert.doesNotMatch(html, /Review Board/); assert.equal((html.match(/data-cell-index=/g) ?? []).length, 25);
  assert.match(html, /rescue-completion-panel" role="status"/); assert.doesNotMatch(html, /class="strategy-feedback"/);
});
test("contradiction gives factual recovery message and emphasized Undo; undo clears error", () => {
  const initial = createDynamicRescueState([pet]);
  const hit = applyObservation(initial, { type: "hit", cellIndex: getPossibleWorlds(initial)[0].participants[0].cells[0], participantId: pet.id });
  const invalid = applyObservation(hit, { type: "empty", cellIndex: hit.observations[0].cellIndex });
  const render = (state: typeof initial) => renderToStaticMarkup(<RescueBoard regionName="Pet rescue" participants={[pet]} state={state} result={analyzeDynamicRescue(state)} {...actions} />);
  const html = render(invalid);
  assert.match(html, /Results don&#x27;t match any possible layout/); assert.match(html, /Check the last result or undo it/);
  assert.match(html, /rescue-recovery-panel" role="alert"/); assert.match(html, /rescue-recovery-action/); assert.doesNotMatch(html, /zero surviving worlds/);
  assert.doesNotMatch(render(hit), /rescue-recovery-panel|Results don&#x27;t match/);
});
test("board hit borders use one state class, not participant identity classes", () => {
  const participants = [animalParticipant(farm[0]), pet];
  let state = createDynamicRescueState(participants);
  for (const placement of getPossibleWorlds(state)[0].participants) state = applyObservation(state, { type: "hit", cellIndex: placement.cells[0], participantId: placement.participantId });
  const html = renderToStaticMarkup(<RescueBoard regionName="Farm" participants={participants} state={state} result={analyzeDynamicRescue(state)} {...actions} />);
  assert.equal((html.match(/class="dynamic-cell cell-animal"/g) ?? []).length, 2); assert.doesNotMatch(html, /animal-color-/);
  assert.match(html, /data-participant-kind="pet"/); assert.match(html, /data-pet-art="tile"/);
});
test("auto-advance feedback announced and completed targets disabled", () => {
  const participants = [animalParticipant(farm[0]), pet];
  let state = createDynamicRescueState(participants);
  for (const cellIndex of getPossibleWorlds(state)[0].participants[0].cells) state = applyObservation(state, { type: "hit", cellIndex, participantId: participants[0].id });
  const strategy = { type: "target", participantId: pet.id } as const;
  const html = renderToStaticMarkup(<RescueBoard regionName="Farm" participants={participants} state={state} result={analyzeDynamicRescue(state, strategy)} strategy={strategy} targetTransition="Pig complete → targeting Rabbit" {...actions} />);
  assert.match(html, /rescue-target-transition" role="status"/); assert.match(html, /COMPLETE/);
  assert.match(html, /data-target-id="animal:farm:[^"]+" data-participant-kind="animal" disabled=""/);
});
