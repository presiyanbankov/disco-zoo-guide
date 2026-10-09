import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ANIMALS } from "../../data/animals";
import { PET_SPECIES } from "../../data/pets";
import { RescueHeaderAction } from "../layout/RescueHeaderLink";
import { StrategySelector } from "./StrategySelector";
import { animalParticipant, petParticipant } from "./rescueParticipants";
const noop = () => {};
const pet = petParticipant(PET_SPECIES[0]);
test("header exposes a primary rescue link with desktop/mobile labels", () => {
  const html = renderToStaticMarkup(<RescueHeaderAction active={false} />);
  assert.match(html, /href="\/rescue"/); assert.match(html, /class="rescue-header-link"/);
  assert.match(html, /rescue-nav-desktop/); assert.match(html, /rescue-nav-mobile/);
});
test("active rescue header is a current-page marker rather than redundant navigation", () => {
  const html = renderToStaticMarkup(<RescueHeaderAction active />);
  assert.match(html, /aria-current="page"/); assert.match(html, /data-active="true"/);
  assert.doesNotMatch(html, /href=|<button/);
});
test("pet-only exposes three applicable strategies and no dead rarity card", () => {
  const html = renderToStaticMarkup(<StrategySelector participants={[pet]} strategy={{ type: "balanced" }} onStrategy={noop} onTarget={noop} />);
  assert.equal((html.match(/data-strategy=/g) ?? []).length, 3);
  assert.doesNotMatch(html, /rarity-focus|disabled=|Rarity Focus/);
});
for (const animal of ANIMALS.filter(a => !a.hidden && a.rarity !== "timeless")) test(`${animal.name} + pet always allows Rarity Focus`, () => {
  const html = renderToStaticMarkup(<StrategySelector participants={[animalParticipant(animal), pet]} strategy={{ type: "rarity-focus" }} onStrategy={noop} onTarget={noop} />);
  assert.match(html, /data-strategy="rarity-focus" aria-pressed="true"/);
  assert.match(html, /Prioritize Mythical, then Rare \+ Timeless, then Common/);
  assert.doesNotMatch(html, /×[123]|&#215;|Pets ignored|priority-values/);
});
