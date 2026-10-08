import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ANIMALS } from "../../data/animals";
import { PET_SPECIES } from "../../data/pets";
import { analyzeDynamicRescue, createDynamicRescueState } from "../../solver/dynamic/dynamicRescueSolver";
import { DEFAULT_RARITY_PRIORITIES, rarityPriorityStrategy } from "../../solver/dynamic/rescueStrategy";
import { RarityPriorityControls } from "./RarityPriorityControls";
import { StrategySelector } from "./StrategySelector";
import { RescueSetup } from "./RescueSetup";
import { RescueBoard } from "./RescueBoard";
import { petParticipant, validateRescueSetup } from "./rescueParticipants";
const noop = () => {};
const pet = PET_SPECIES[0], participant = petParticipant(pet);
const farm = ANIMALS.filter(a => a.regionId === "farm");
const setup = { regionId: null, selectedIds: [], animals: ANIMALS, onRegion: noop, onAnimal: noop, onStart: noop };

test("Rarity Priority replaces old wording and shows four accessible segmented groups", () => {
  const html = renderToStaticMarkup(<StrategySelector strategy={rarityPriorityStrategy()} participants={[participant]} onStrategy={noop} onTarget={noop} />);
  assert.match(html, /Rarity Priority/); assert.doesNotMatch(html, /Rarity First|type="range"/);
  assert.equal((html.match(/role="radiogroup"/g) ?? []).length, 4);
  assert.equal((html.match(/role="radio"/g) ?? []).length, 16);
  assert.match(html, /Set how strongly Common, Rare, Mythical, and Pet results should influence the search/);
});
test("priority defaults are visible 1/2/3/1, with exactly four checked values and four tab stops", () => {
  const html = renderToStaticMarkup(<RarityPriorityControls priorities={DEFAULT_RARITY_PRIORITIES} onPriority={noop} />);
  assert.equal((html.match(/aria-checked="true"/g) ?? []).length, 4);
  assert.equal((html.match(/tabindex="0"/g) ?? []).length, 4);
  assert.equal((html.match(/class="priority-check"/g) ?? []).length, 4);
  for (const [category, value] of Object.entries(DEFAULT_RARITY_PRIORITIES)) {
    const row = html.slice(html.indexOf(`data-priority-category="${category}"`)).split('</button>').find(s => s.includes(`aria-checked="true"`))!;
    assert.ok(row.includes(`priority ${value}:`));
  }
});
test("all sixteen configured category values render the same numbers and selected state", () => {
  for (const category of ["common", "rare", "mythical", "pet"] as const) for (const value of [1, 2, 3, 4] as const) {
    const html = renderToStaticMarkup(<RarityPriorityControls priorities={{ ...DEFAULT_RARITY_PRIORITIES, [category]: value }} onPriority={noop} />);
    const row = html.slice(html.indexOf(`data-priority-category="${category}"`)).split('role="radiogroup"')[1].split('</div>')[0];
    assert.match(row, new RegExp(`aria-checked="true" aria-label="[^\"]+ priority ${value}:`));
  }
});
test("pet-only setup needs no region and exposes available pets; removing the pet disables Start", () => {
  const html = renderToStaticMarkup(<RescueSetup {...setup} petId={pet.id} />);
  assert.doesNotMatch(html, /class="rescue-primary rescue-start-cta" type="button" disabled/);
  assert.equal((html.match(/data-pet-id=/g) ?? []).length, 8); assert.doesNotMatch(html, /data-pet-id="[^"]+"[^>]*disabled/);
  assert.match(html, /Pet-only rescues do not need a region/);
  const empty = renderToStaticMarkup(<RescueSetup {...setup} />);
  assert.match(empty, /class="rescue-primary rescue-start-cta" type="button" disabled=""/);
});
test("pet-only Target One still requires selecting the pet explicitly", () => {
  const missing = renderToStaticMarkup(<RescueSetup {...setup} petId={pet.id} strategy={{ type: "target", participantId: "" }} />);
  assert.match(missing, /data-target-id="pet:rabbit"/); assert.match(missing, /class="rescue-primary rescue-start-cta" type="button" disabled=""/);
  const valid = renderToStaticMarkup(<RescueSetup {...setup} petId={pet.id} strategy={{ type: "target", participantId: participant.id }} />);
  assert.doesNotMatch(valid, /class="rescue-primary rescue-start-cta" type="button" disabled/);
});
test("pet-only live board displays configured summary and one guaranteed pet", () => {
  const state = createDynamicRescueState([participant]), strategy = rarityPriorityStrategy({ common: 2, rare: 1, mythical: 4, pet: 3 });
  const html = renderToStaticMarkup(<RescueBoard regionName="Pet rescue" participants={[participant]} state={state} strategy={strategy} result={analyzeDynamicRescue(state, strategy)} onObservation={noop} onUndo={noop} onReset={noop} onChange={noop} />);
  assert.match(html, /Pet rescue/); assert.match(html, /C2 .* R1 .* M4 .* P3/); assert.match(html, /data-recommended="true"/);
  assert.equal((html.match(/class="rescue-roster-animal /g) ?? []).length, 1);
});
test("six valid setups and original participant limits remain enforced", () => {
  assert.equal(validateRescueSetup([], [pet]), null);
  assert.equal(validateRescueSetup([farm[0]], [pet]), null);
  assert.equal(validateRescueSetup(farm.slice(0, 2), [pet]), null);
  for (const count of [1, 2, 3]) assert.equal(validateRescueSetup(farm.slice(0, count), []), null);
  assert.ok(validateRescueSetup([], [])); assert.ok(validateRescueSetup([], PET_SPECIES.slice(0, 2)));
  assert.ok(validateRescueSetup(farm.slice(0, 3), [pet])); assert.ok(validateRescueSetup([farm[0], farm[0]], []));
  assert.ok(validateRescueSetup([farm[0], ANIMALS.find(a => a.regionId === "moon")!], [pet]));
});
test("normal animal selections cannot start without a region", () => {
  const html = renderToStaticMarkup(<RescueSetup {...setup} selectedIds={[farm[0].id]} petId={pet.id} />);
  assert.match(html, /class="rescue-primary rescue-start-cta" type="button" disabled=""/);
});
