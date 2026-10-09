import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
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

const records = ANIMALS.filter(a => a.regionId === "jurassic");
const expected = [
  ["diplodocus", "Diplodocus", "common", [[0,0],[1,1],[1,2],[2,1]]],
  ["stegosaurus", "Stegosaurus", "common", [[0,1],[0,2],[1,0],[1,3]]],
  ["raptor", "Raptor", "common", [[0,0],[0,1],[1,1],[2,2]]],
  ["t-rex", "T-Rex", "rare", [[0,0],[2,0],[2,1]]],
  ["triceratops", "Triceratops", "rare", [[0,0],[1,2],[2,0]]],
  ["dragon", "Dragon", "mythical", [[0,0],[1,2]]],
] as const;
test("Jurassic Earth 07 has exactly the six approved classic records", () => {
  assert.deepEqual(regionPosition("jurassic"), { group: "Earth", number: 7 });
  assert.equal(records.length, 6);
  expected.forEach(([id,name,rarity,cells], index) => {
    assert.equal(records[index].id,id); assert.equal(records[index].name,name); assert.equal(records[index].rarity,rarity);
    assert.deepEqual(records[index].pattern.cells,cells.map(([row,col])=>({row,col})));
  });
});
test("Jurassic uses reviewed HQ assets and graceful artwork fallback", () => {
  for (const animal of records) {
    const artwork = getAnimalDisplayArtwork(animal.imagePath)!;
    assert.ok(artwork.isHq); assert.ok(existsSync(`public${artwork.src}`));
    assert.equal(getAnimalDisplayArtwork(animal.imagePath,artwork.src)?.isHq,false);
    assert.equal(getAnimalDisplayArtwork(animal.imagePath,animal.imagePath),null);
    assert.ok(getAnimalGuidePresentation("jurassic",animal.id)?.strategy?.steps.length);
  }
});
test("Jurassic visibility and contextual Rescue respect the existing barrier", () => {
  const before = { ...DEFAULT_PREFERENCES, maxEarthRegionId: "jungle" as const };
  const after = revealRegion("jurassic",before);
  assert.equal(canViewRegion("jurassic",before),false); assert.ok(canViewRegion("jurassic",after));
  assert.deepEqual(resolveRescueSetupContext("jurassic","raptor",before),{regionId:null,selectedIds:[]});
  assert.deepEqual(resolveRescueSetupContext("jurassic","raptor",after),{regionId:"jurassic",selectedIds:["raptor"]});
  assert.equal(rescueSetupHref("jurassic","raptor"),"/rescue?region=jurassic&animal=raptor");
  for (const preferences of [before,after,before]) {
    const html=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><ProgressGuard regionId="jurassic"><span>Raptor pattern content</span></ProgressGuard></ProgressContext.Provider>);
    assert.equal(html.includes("Raptor pattern content"),preferences===after);
  }
});
test("Jurassic region and all dynamic policies consume canonical data", () => {
  assert.equal(getRegionSearchPresentation(getRegionAnimalPresentations("jurassic")).status,"ready");
  const participants=[records[2],records[3],records[5]].map(animalParticipant);
  const state=createDynamicRescueState(participants); const worlds=getPossibleWorlds(state);
  assert.ok(worlds.length); assert.deepEqual(rarityFocusParticipantIds(state,worlds),[participants[2].id]);
  for(const strategy of [{type:"balanced"},{type:"finish-found"},{type:"target",participantId:participants[0].id},{type:"rarity-focus"}] as const) {
    assert.equal(analyzeRescueWorlds(state,worlds,strategy).status,"ready");
  }
});

