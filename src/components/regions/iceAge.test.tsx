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

const records = ANIMALS.filter(a => a.regionId === "ice-age" && a.rarity !== "timeless");
const expected = [
  ["wooly-rhino", "Wooly Rhino", "common", [[0,2],[1,0],[1,3],[2,1]]],
  ["giant-sloth", "Giant Sloth", "common", [[0,0],[1,2],[2,0],[2,2]]],
  ["dire-wolf", "Dire Wolf", "common", [[0,1],[1,0],[1,3],[2,1]]],
  ["saber-tooth", "Saber Tooth", "rare", [[0,0],[1,2],[2,1]]],
  ["mammoth", "Mammoth", "rare", [[0,1],[1,0],[2,2]]],
  ["akhlut", "Akhlut", "mythical", [[0,2],[1,0],[2,2]]],
] as const;
test("Ice Age Earth 08 has exactly the six approved classic records", () => {
  assert.deepEqual(regionPosition("ice-age"), { group: "Earth", number: 8 });
  assert.equal(records.length, 6);
  expected.forEach(([id,name,rarity,cells], index) => {
    assert.equal(records[index].id,id); assert.equal(records[index].name,name); assert.equal(records[index].rarity,rarity);
    assert.deepEqual(records[index].pattern.cells,cells.map(([row,col])=>({row,col})));
  });
});
test("Ice Age uses reviewed HQ assets and graceful artwork fallback", () => {
  for (const animal of records) {
    const artwork = getAnimalDisplayArtwork(animal.imagePath)!;
    assert.ok(artwork.isHq); assert.ok(existsSync(`public${artwork.src}`));
    assert.equal(getAnimalDisplayArtwork(animal.imagePath,artwork.src)?.isHq,false);
    assert.equal(getAnimalDisplayArtwork(animal.imagePath,animal.imagePath),null);
    assert.ok(getAnimalGuidePresentation("ice-age",animal.id)?.strategy?.steps.length);
  }
});
test("Ice Age visibility and contextual Rescue respect the existing barrier", () => {
  const before = { ...DEFAULT_PREFERENCES, maxEarthRegionId: "jurassic" as const };
  const after = revealRegion("ice-age",before);
  assert.equal(canViewRegion("ice-age",before),false); assert.ok(canViewRegion("ice-age",after));
  assert.deepEqual(resolveRescueSetupContext("ice-age","mammoth",before),{regionId:null,selectedIds:[]});
  assert.deepEqual(resolveRescueSetupContext("ice-age","mammoth",after),{regionId:"ice-age",selectedIds:["mammoth"]});
  assert.equal(rescueSetupHref("ice-age","mammoth"),"/rescue?region=ice-age&animal=mammoth");
  for (const preferences of [before,after,before]) {
    const html=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><ProgressGuard regionId="ice-age"><span>Mammoth pattern content</span></ProgressGuard></ProgressContext.Provider>);
    assert.equal(html.includes("Mammoth pattern content"),preferences===after);
  }
});
test("Ice Age region and all dynamic policies consume canonical data", () => {
  assert.equal(getRegionSearchPresentation(getRegionAnimalPresentations("ice-age")).status,"ready");
  const participants=[records[2],records[3],records[5]].map(animalParticipant);
  const state=createDynamicRescueState(participants); const worlds=getPossibleWorlds(state);
  assert.ok(worlds.length); assert.deepEqual(rarityFocusParticipantIds(state,worlds),[participants[2].id]);
  for(const strategy of [{type:"balanced"},{type:"finish-found"},{type:"target",participantId:participants[0].id},{type:"rarity-focus"}] as const) {
    assert.equal(analyzeRescueWorlds(state,worlds,strategy).status,"ready");
  }
});


test("Ice Age extraction preserves native pixels and clears only the reviewed Mammoth pocket", () => {
  const validation = JSON.parse(readFileSync("assets/reference/fandom/ice-age-validation.json", "utf8"));
  assert.equal(validation.length, records.length);
  for (const record of validation) {
    assert.deepEqual(record.sourceDimensions, [150,150]);
    assert.equal(record.padding,2); assert.equal(record.missingAnimalPixels,0);
    assert.equal(record.addedAnimalPixels,0); assert.equal(record.recoloredPixels,0);
    assert.equal(record.artificialSemitransparentPixels,0); assert.equal(record.resampling,false);
    assert.deepEqual(record.alphaValues,[0,255]);
  }
  const mammoth = validation.find((r: {animal:string}) => r.animal === "mammoth");
  assert.ok(mammoth.removedComponents.some((c: {role:string;pixels:number})=>c.role==="reviewed-trunk-tusk-opening"&&c.pixels===360));
});

test("Ice Age Rescue setup filters hidden content and visible Mammoth context never auto-starts", () => {
  const before = { ...DEFAULT_PREFERENCES, maxEarthRegionId: "jurassic" as const };
  const after = revealRegion("ice-age",before);
  for (const preferences of [before,after]) {
    const initialContext=resolveRescueSetupContext("ice-age","mammoth",preferences);
    const html=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><RescueAssistant animals={ANIMALS} initialContext={initialContext}/></ProgressContext.Provider>);
    assert.equal(html.includes("rescue-region region-ice-age"),preferences===after);
    assert.equal(/(?:aria-pressed="true"[^>]*data-animal-id="mammoth")/.test(html),preferences===after);
    assert.ok(html.includes("rescue-setup")); assert.ok(!html.includes("dynamic-rescue-grid"));
  }
  assert.deepEqual(resolveRescueSetupContext("ice-age",undefined,after),{regionId:"ice-age",selectedIds:[]});
  assert.equal(rescueSetupHref("ice-age"),"/rescue?region=ice-age");
});
