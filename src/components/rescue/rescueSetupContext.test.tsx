import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import RescuePage from "../../app/rescue/page";
import RegionPage from "../../app/regions/[regionId]/page";
import AnimalPage from "../../app/regions/[regionId]/[animalId]/page";
import { RescueHeaderAction } from "../layout/RescueHeaderLink";
import { rescueSetupHref, resolveRescueSetupContext } from "./rescueSetupContext";

for (const [region, animal, expected] of [
  [undefined, undefined, { regionId: null, selectedIds: [] }],
  ["savanna", undefined, { regionId: "savanna", selectedIds: [] }],
  ["savanna", "giraffe", { regionId: "savanna", selectedIds: ["giraffe"] }],
  ["moon", "jade-rabbit", { regionId: "moon", selectedIds: ["jade-rabbit"] }],
  ["savanna", "pig", { regionId: "savanna", selectedIds: [] }],
  ["farm", "unknown", { regionId: "farm", selectedIds: [] }],
  ["mars", "giraffe", { regionId: null, selectedIds: [] }],
  ["unknown", undefined, { regionId: null, selectedIds: [] }],
] as const) {
  test(`context ${region}/${animal}: validates without exposing unsupported content`, () => {
    assert.deepEqual(resolveRescueSetupContext(region, animal), expected);
  });
}
test("ambiguous duplicate query values are ignored safely", () => {
  assert.deepEqual(resolveRescueSetupContext(["farm", "moon"], "pig"), { regionId: null, selectedIds: [] });
  assert.deepEqual(resolveRescueSetupContext("farm", ["pig", "sheep"]), { regionId: "farm", selectedIds: [] });
});
test("link construction uses canonical IDs and generic pages stay plain", () => {
  assert.equal(rescueSetupHref(), "/rescue");
  assert.equal(rescueSetupHref("mars"), "/rescue");
  assert.equal(rescueSetupHref("farm"), "/rescue?region=farm");
  assert.equal(rescueSetupHref("farm", "pig"), "/rescue?region=farm&animal=pig");
  assert.equal(rescueSetupHref("moon", "jade-rabbit"), "/rescue?region=moon&animal=jade-rabbit");
});
test("region and animal route headers carry contextual URLs", async () => {
  const region = renderToStaticMarkup(await RegionPage({ params: Promise.resolve({ regionId: "savanna" }) }));
  const animal = renderToStaticMarkup(await AnimalPage({ params: Promise.resolve({ regionId: "savanna", animalId: "giraffe" }) }));
  assert.match(region, /href="\/rescue\?region=savanna"/);
  assert.match(animal, /href="\/rescue\?region=savanna&amp;animal=giraffe"/);
});
test("server context renders editable setup without starting a rescue", async () => {
  for (const animal of [undefined, "giraffe"]) {
    const html = renderToStaticMarkup(await RescuePage({ searchParams: Promise.resolve({ region: "savanna", animal }) }));
    assert.match(html, /class="rescue-region region-savanna" aria-pressed="true"/);
    assert.equal((html.match(/class="rescue-animal-option" aria-pressed="true"/g) ?? []).length, animal ? 1 : 0);
    assert.match(html, /rescue-start-cta/);
    assert.doesNotMatch(html, /dynamic-rescue-grid/);
  }
});
test("desktop and mobile labels share one contextual link", () => {
  const html = renderToStaticMarkup(<RescueHeaderAction active={false} href={rescueSetupHref("moon", "jade-rabbit")} />);
  assert.match(html, /rescue-nav-desktop/); assert.match(html, /rescue-nav-mobile/);
  assert.equal((html.match(/href=/g) ?? []).length, 1);
  assert.match(html, /region=moon&amp;animal=jade-rabbit/);
});
