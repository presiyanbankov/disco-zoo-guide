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

const records = ANIMALS.filter(a => a.regionId === "city" && a.rarity !== "timeless");
const expected = [
  ["raccoon", "Raccoon", "common", [[0,0],[0,2],[1,0],[1,3]]],
  ["pigeon", "Pigeon", "common", [[0,0],[1,1],[2,1],[2,2]]],
  ["rat", "Rat", "common", [[0,0],[0,1],[1,1],[1,3]]],
  ["squirrel", "Squirrel", "rare", [[0,2],[1,0],[2,1]]],
  ["opossum", "Opossum", "rare", [[0,0],[1,0],[1,2]]],
  ["sewer-turtle", "Sewer Turtle", "mythical", [[0,0],[0,1]]],
] as const;
test("City Earth 09 has exactly the six approved classic records", () => {
  assert.deepEqual(regionPosition("city"), { group: "Earth", number: 9 });
  assert.equal(records.length, 6);
  expected.forEach(([id,name,rarity,cells], index) => {
    assert.equal(records[index].id,id); assert.equal(records[index].name,name); assert.equal(records[index].rarity,rarity);
    assert.deepEqual(records[index].pattern.cells,cells.map(([row,col])=>({row,col})));
  });
});
test("City uses reviewed HQ assets and graceful artwork fallback", () => {
  for (const animal of records) {
    const artwork = getAnimalDisplayArtwork(animal.imagePath)!;
    assert.ok(artwork.isHq); assert.ok(existsSync(`public${artwork.src}`));
    assert.equal(getAnimalDisplayArtwork(animal.imagePath,artwork.src)?.isHq,false);
    assert.equal(getAnimalDisplayArtwork(animal.imagePath,animal.imagePath),null);
    assert.ok(getAnimalGuidePresentation("city",animal.id)?.strategy?.steps.length);
  }
});
test("City visibility and contextual Rescue respect the existing barrier", () => {
  const before = { ...DEFAULT_PREFERENCES, maxEarthRegionId: "ice-age" as const };
  const after = revealRegion("city",before);
  assert.equal(canViewRegion("city",before),false); assert.ok(canViewRegion("city",after));
  assert.deepEqual(resolveRescueSetupContext("city","raccoon",before),{regionId:null,selectedIds:[]});
  assert.deepEqual(resolveRescueSetupContext("city","raccoon",after),{regionId:"city",selectedIds:["raccoon"]});
  assert.equal(rescueSetupHref("city","raccoon"),"/rescue?region=city&animal=raccoon");
  for (const preferences of [before,after,before]) {
    const html=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><ProgressGuard regionId="city"><span>Raccoon pattern content</span></ProgressGuard></ProgressContext.Provider>);
    assert.equal(html.includes("Raccoon pattern content"),preferences===after);
  }
});
test("City region and all dynamic policies consume canonical data", () => {
  assert.equal(getRegionSearchPresentation(getRegionAnimalPresentations("city")).status,"ready");
  const participants=[records[2],records[3],records[5]].map(animalParticipant);
  const state=createDynamicRescueState(participants); const worlds=getPossibleWorlds(state);
  assert.ok(worlds.length); assert.deepEqual(rarityFocusParticipantIds(state,worlds),[participants[2].id]);
  for(const strategy of [{type:"balanced"},{type:"finish-found"},{type:"target",participantId:participants[0].id},{type:"rarity-focus"}] as const) {
    assert.equal(analyzeRescueWorlds(state,worlds,strategy).status,"ready");
  }
});


test("City extraction preserves native pixels and clears only the reviewed Sewer Turtle pocket", () => {
  const validation = JSON.parse(readFileSync("assets/reference/fandom/city-validation.json", "utf8"));
  assert.equal(validation.length, records.length);
  for (const record of validation) {
    assert.deepEqual(record.sourceDimensions, [150,150]);
    assert.equal(record.padding,2); assert.equal(record.missingAnimalPixels,0);
    assert.equal(record.addedAnimalPixels,0); assert.equal(record.recoloredPixels,0);
    assert.equal(record.artificialSemitransparentPixels,0); assert.equal(record.resampling,false);
    assert.deepEqual(record.alphaValues,[0,255]);
  }
  const turtle = validation.find((r: {animal:string}) => r.animal === "sewer-turtle");
  assert.ok(turtle.removedComponents.some((c: {role:string;pixels:number})=>c.role==="reviewed-neck-opening"&&c.pixels===138));
});

test("City Rescue setup filters hidden content and visible Raccoon context never auto-starts", () => {
  const before = { ...DEFAULT_PREFERENCES, maxEarthRegionId: "ice-age" as const };
  const after = revealRegion("city",before);
  for (const preferences of [before,after]) {
    const initialContext=resolveRescueSetupContext("city","raccoon",preferences);
    const html=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><RescueAssistant animals={ANIMALS} initialContext={initialContext}/></ProgressContext.Provider>);
    assert.equal(html.includes("rescue-region region-city"),preferences===after);
    assert.equal(/(?:aria-pressed="true"[^>]*data-animal-id="raccoon")/.test(html),preferences===after);
    assert.ok(html.includes("rescue-setup")); assert.ok(!html.includes("dynamic-rescue-grid"));
  }
  assert.deepEqual(resolveRescueSetupContext("city",undefined,after),{regionId:"city",selectedIds:[]});
  assert.equal(rescueSetupHref("city"),"/rescue?region=city");
});
