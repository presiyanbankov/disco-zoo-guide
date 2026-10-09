import { RescueAssistant } from "../rescue/RescueAssistant";
import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { ANIMALS } from "../../data/animals";
import { regionPosition } from "./regionPresentation";
import { getRegionSearchPresentation } from "./regionSearchPresentation";
import { getRegionAnimalPresentations, getAnimalGuidePresentation } from "../animals/animalGuidePresentation";
import { getAnimalDisplayArtwork } from "../animals/animalArtworkPresentation";
import { DEFAULT_PREFERENCES, canViewRegion, revealRegion } from "../progress/spoilerPreferences";
import { ProgressContext } from "../progress/ProgressProvider";
import { ProgressGuard } from "../progress/ProgressGuard";
import { resolveRescueSetupContext, rescueSetupHref } from "../rescue/rescueSetupContext";
import { animalParticipant } from "../rescue/rescueParticipants";
import { createDynamicRescueState, getPossibleWorlds, analyzeRescueWorlds } from "../../solver/dynamic/dynamicRescueSolver";
import { rarityFocusParticipantIds } from "../../solver/dynamic/rescueStrategy";

const records = ANIMALS.filter(a => a.regionId === "mountain" && a.rarity !== "timeless");
const expected = [
  ["goat", "Goat", "common", [[0,0],[1,0],[1,1],[1,2]]],
  ["cougar", "Cougar", "common", [[0,0],[1,1],[2,0],[2,2]]],
  ["elk", "Elk", "common", [[0,0],[0,2],[1,1],[1,2]]],
  ["eagle", "Eagle", "rare", [[0,0],[1,0],[2,1]]],
  ["coyote", "Coyote", "rare", [[0,0],[0,1],[1,2]]],
  ["aatxe", "Aatxe", "mythical", [[0,2],[1,0]]],
] as const;
test("Mountain Earth 10 has exactly the six approved classic records", () => {
  assert.deepEqual(regionPosition("mountain"), { group: "Earth", number: 10 });
  assert.equal(records.length, 6);
  expected.forEach(([id,name,rarity,cells], index) => {
    assert.equal(records[index].id,id); assert.equal(records[index].name,name); assert.equal(records[index].rarity,rarity);
    assert.deepEqual(records[index].pattern.cells,cells.map(([row,col])=>({row,col})));
  });
});
test("Mountain uses reviewed HQ assets and graceful artwork fallback", () => {
  for (const animal of records) {
    const artwork = getAnimalDisplayArtwork(animal.imagePath)!;
    assert.ok(artwork.isHq); assert.ok(existsSync(`public${artwork.src}`));
    assert.equal(getAnimalDisplayArtwork(animal.imagePath,artwork.src)?.isHq,false);
    assert.equal(getAnimalDisplayArtwork(animal.imagePath,animal.imagePath),null);
    assert.ok(getAnimalGuidePresentation("mountain",animal.id)?.strategy?.steps.length);
  }
});
test("Mountain visibility and contextual Rescue respect the existing barrier", () => {
  const before = { ...DEFAULT_PREFERENCES, maxEarthRegionId: "city" as const };
  const after = revealRegion("mountain",before);
  assert.equal(canViewRegion("mountain",before),false); assert.ok(canViewRegion("mountain",after));
  assert.deepEqual(resolveRescueSetupContext("mountain","goat",before),{regionId:null,selectedIds:[]});
  assert.deepEqual(resolveRescueSetupContext("mountain","goat",after),{regionId:"mountain",selectedIds:["goat"]});
  assert.equal(rescueSetupHref("mountain","goat"),"/rescue?region=mountain&animal=goat");
  for (const preferences of [before,after,before]) {
    const html=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><ProgressGuard regionId="mountain"><span>Goat pattern content</span></ProgressGuard></ProgressContext.Provider>);
    assert.equal(html.includes("Goat pattern content"),preferences===after);
  }
});
test("Mountain region and all dynamic policies consume canonical data", () => {
  assert.equal(getRegionSearchPresentation(getRegionAnimalPresentations("mountain")).status,"ready");
  const participants=[records[2],records[3],records[5]].map(animalParticipant);
  const state=createDynamicRescueState(participants); const worlds=getPossibleWorlds(state);
  assert.ok(worlds.length); assert.deepEqual(rarityFocusParticipantIds(state,worlds),[participants[2].id]);
  for(const strategy of [{type:"balanced"},{type:"finish-found"},{type:"target",participantId:participants[0].id},{type:"rarity-focus"}] as const) {
    assert.equal(analyzeRescueWorlds(state,worlds,strategy).status,"ready");
  }
});


test("Mountain extraction preserves native pixels and clears only reviewed horn and muzzle pockets", () => {
  const validation = JSON.parse(readFileSync("assets/reference/fandom/mountain-validation.json", "utf8"));
  assert.equal(validation.length, records.length);
  for (const record of validation) {
    assert.deepEqual(record.sourceDimensions, [150,150]);
    assert.equal(record.padding,2); assert.equal(record.missingAnimalPixels,0);
    assert.equal(record.addedAnimalPixels,0); assert.equal(record.recoloredPixels,0);
    assert.equal(record.artificialSemitransparentPixels,0); assert.equal(record.resampling,false);
    assert.deepEqual(record.alphaValues,[0,255]);
  }
  for (const [id, role, pixels] of [["goat","reviewed-horn-opening",108],["aatxe","reviewed-muzzle-opening",36]] as const) {
    const animal = validation.find((r: {animal:string}) => r.animal === id);
    assert.ok(animal.removedComponents.some((c: {role:string;pixels:number}) => c.role===role && c.pixels===pixels));
  }
});

test("Mountain Rescue setup filters hidden content and visible Goat context never auto-starts", () => {
  const before = { ...DEFAULT_PREFERENCES, maxEarthRegionId: "city" as const };
  const after = revealRegion("mountain",before);
  for (const preferences of [before,after]) {
    const initialContext=resolveRescueSetupContext("mountain","goat",preferences);
    const html=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><RescueAssistant animals={ANIMALS} initialContext={initialContext}/></ProgressContext.Provider>);
    assert.equal(html.includes("rescue-region region-mountain"),preferences===after);
    assert.equal(/(?:aria-pressed="true"[^>]*data-animal-id="goat")/.test(html),preferences===after);
    assert.ok(html.includes("rescue-setup")); assert.ok(!html.includes("dynamic-rescue-grid"));
  }
  assert.deepEqual(resolveRescueSetupContext("mountain",undefined,after),{regionId:"mountain",selectedIds:[]});
  assert.equal(rescueSetupHref("mountain"),"/rescue?region=mountain");
});
