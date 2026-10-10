import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ANIMALS } from "../../data/animals";
import { PET_SPECIES } from "../../data/pets";
import { REGION_PRESENTATION } from "../regions/regionPresentation";
import { AnimalCollection } from "./AnimalCollection";
import { getRegionAnimalPresentations, getAnimalGuidePresentation } from "./animalGuidePresentation";
import { getAnimalDisplayArtwork } from "./animalArtworkPresentation";
import { RegionHero } from "../regions/RegionHero";
import { RegionSearch } from "../regions/RegionSearch";
import { getRegionSearchPresentation } from "../regions/regionSearchPresentation";
import { ProgressContext } from "../progress/ProgressProvider";
import { ProgressGuard } from "../progress/ProgressGuard";
import { canViewAnimal, revealRegion, type SpoilerPreferences } from "../progress/spoilerPreferences";
import { RescueAssistant } from "../rescue/RescueAssistant";
import { animalParticipant, petParticipant, validateRescueSetup } from "../rescue/rescueParticipants";
import { resolveRescueSetupContext, rescueSetupHref } from "../rescue/rescueSetupContext";
import { createDynamicRescueState, getPossibleWorlds, analyzeRescueWorlds, applyObservation } from "../../solver/dynamic/dynamicRescueSolver";
import { rarityFocusParticipantIds, scoreWorldsByStrategy } from "../../solver/dynamic/rescueStrategy";
import AnimalPage, { generateStaticParams } from "../../app/regions/[regionId]/[animalId]/page";

const expected = [
  ["farm", "chicken", [[0,2],[1,1],[2,0]]],
  ["outback", "echidna", [[0,2],[1,0],[1,1]]],
  ["savanna", "rhinoceros", [[0,1],[1,0],[2,1]]],
  ["northern", "otter", [[0,0],[1,0],[1,1]]],
  ["polar", "snowy-owl", [[0,0],[0,1],[1,1]]],
  ["jungle", "lemur", [[0,0],[1,1],[2,0]]],
  ["jurassic", "ankylosaurus", [[0,2],[1,0],[1,2]]],
  ["ice-age", "yukon-camel", [[0,2],[1,0],[2,3]]],
  ["city", "chipmunk", [[0,1],[1,0],[1,3]]],
  ["mountain", "pika", [[0,0],[0,2],[1,2]]],
  ["nocturnal", "firefly", [[0,0],[1,0],[2,2]]],
  ["moon", "babmoon", [[0,1],[1,2],[2,0]]],
  ["mars", "marsten", [[0,0],[0,2],[1,3]]],
  ["constellation", "horologium", [[0,0],[1,2],[2,2]]],
] as const;
const full: SpoilerPreferences = { maxEarthRegionId: "nocturnal", maxSpaceRegionId: "constellation", showTimeless: true };
function render(children: ReactNode, preferences = full) {
  return renderToStaticMarkup(<ProgressContext.Provider value={{ preferences, save: () => {}, openSettings: () => {} }}>{children}</ProgressContext.Provider>);
}
const timeless = ANIMALS.filter(a => a.rarity === "timeless");
const RESTRICTED_PREFERENCES = { maxEarthRegionId: "farm" as const, maxSpaceRegionId: null, showTimeless: false };
test("one approved Timeless record per region, classic records remain six each", () => {
  assert.equal(timeless.length, expected.length);
  assert.deepEqual(new Set(timeless.map(a => a.regionId)), new Set(REGION_PRESENTATION.map(r => r.id)));
  for (const region of REGION_PRESENTATION) assert.equal(ANIMALS.filter(a => a.regionId === region.id && a.rarity !== "timeless").length, 6);
});
for (const [regionId, id, cells] of expected) test(`${id}: approved geometry, real static strategy, route, and safe artwork`, () => {
  const a = timeless.find(a => a.id === id)!;
  assert.equal(a.regionId, regionId);
  assert.deepEqual(a.pattern.cells, cells.map(([row,col]) => ({row,col})));
  assert.equal(animalParticipant(a).animalRarity, "timeless");
  assert.ok(getAnimalGuidePresentation(regionId, id)?.strategy?.steps.length);
  assert.ok(generateStaticParams().some(p => p.regionId === regionId && p.animalId === id));
  const art = getAnimalDisplayArtwork(a.imagePath)!;
  assert.ok(existsSync(`public${art.src}`));
  assert.equal(art.isHq, true);
  assert.equal(getAnimalDisplayArtwork(a.imagePath, art.src)?.isHq ?? false, false);
});
test("visibility is region AND Timeless; reveal and lowering remain independent", () => {
  const lemur = timeless.find(a => a.id === "lemur")!;
  assert.equal(canViewAnimal(lemur, {...full, showTimeless:false}), false);
  assert.equal(canViewAnimal(lemur, {...RESTRICTED_PREFERENCES, showTimeless:true}), false);
  assert.equal(canViewAnimal(lemur, full), true);
  const revealed = revealRegion("jungle", RESTRICTED_PREFERENCES);
  assert.equal(revealed.showTimeless, false);
  assert.equal(canViewAnimal(lemur, {...revealed, showTimeless:true}), true);
  assert.equal(canViewAnimal(lemur, {...full, maxEarthRegionId:"savanna"}), false);
});
test("hero, collection and region-search count only visible candidates", () => {
  const animals = getRegionAnimalPresentations("farm");
  const region = REGION_PRESENTATION.find(r => r.id === "farm")!;
  for (const shown of [false,true]) {
    const prefs = {...full,showTimeless:shown};
    const html = render(<><RegionHero region={region} index={0} animals={animals}/><RegionSearch regionName="Farm" animals={animals}/><AnimalCollection animals={animals}/></>, prefs);
    assert.equal(html.includes("Chicken"),shown);
    assert.equal(html.includes('group-timeless'),shown);
    assert.ok(html.includes(`${shown ? 7 : 6} ANIMALS`));
    const sequence = getRegionSearchPresentation(animals.filter(a=>canViewAnimal(a,prefs)));
    assert.ok(html.includes(`${sequence.steps.length} STEPS`));
    assert.equal((html.match(/class="animal-card /g)||[]).length,shown?7:6);
  }
});
test("Timeless guide direct guards hide identity and reveal tracks separately", async () => {
  const page = await AnimalPage({params:Promise.resolve({regionId:"jungle",animalId:"lemur"})});
  for (const prefs of [{...full,showTimeless:false},{...RESTRICTED_PREFERENCES,showTimeless:true},full]) {
    const html = render(page,prefs);
    assert.equal(html.includes('id="page-title">Lemur'),canViewAnimal(timeless.find(a=>a.id==="lemur")!,prefs));
  }
  assert.match(render(<ProgressGuard regionId="jungle" rarity="timeless">secret</ProgressGuard>,{...full,showTimeless:false}),/Show Timeless/);
  assert.match(render(<ProgressGuard regionId="jungle" rarity="timeless">secret</ProgressGuard>,RESTRICTED_PREFERENCES),/Reveal Jungle/);
});
test("Rescue contextual eligibility respects Timeless visibility and remains editable setup", () => {
  assert.equal(rescueSetupHref("farm","chicken"),"/rescue?region=farm&animal=chicken");
  for(const shown of [false,true]) {
    const preferences={...full,showTimeless:shown};
    const context=resolveRescueSetupContext("farm","chicken",preferences);
    assert.deepEqual(context.selectedIds,shown?["chicken"]:[]);
    const html=render(<RescueAssistant animals={ANIMALS} initialContext={context}/>,preferences);
    assert.equal(html.includes('data-animal-id="chicken"'),shown);
    assert.ok(!html.includes('dynamic-rescue-grid'));
  }
  assert.deepEqual(resolveRescueSetupContext("jungle","lemur",{...RESTRICTED_PREFERENCES,showTimeless:true}),{regionId:null,selectedIds:[]});
});
test("Timeless-only, classic + Timeless and Timeless + pet obey existing participant limits", () => {
  const chicken = timeless[0], pig = ANIMALS.find(a=>a.id==="pig")!, cow = ANIMALS.find(a=>a.id==="cow")!;
  for (const animals of [[chicken],[pig,chicken]]) {
    assert.equal(validateRescueSetup(animals,[]),null);
    assert.equal(validateRescueSetup(animals,[PET_SPECIES[0]]),null);
    const state=createDynamicRescueState([...animals.map(animalParticipant),petParticipant(PET_SPECIES[0])]);
    const worlds=getPossibleWorlds(state);assert.ok(worlds.length);
    for (const strategy of [{type:"balanced"},{type:"finish-found"},{type:"target",participantId:state.participants[0].id},{type:"rarity-focus"}] as const) assert.equal(analyzeRescueWorlds(state,worlds,strategy).status,"ready");
  }
  assert.ok(validateRescueSetup([pig,cow,chicken],[PET_SPECIES[0]]));
});
test("Rarity Focus progresses Mythical > jointly Rare+Timeless > Common > pet", () => {
  const ids=["unicorn","cow","chicken","pig"];
  const participants=ids.map(id=>animalParticipant(ANIMALS.find(a=>a.regionId==="farm"&&a.id===id)!));
  participants.push(petParticipant(PET_SPECIES[0]));
  // Manually specified worlds isolate policy testing; generation math is not duplicated.
  const worlds=[{participants:participants.map((p,i)=>({participantId:p.id,cells:[i]}))}];
  let state={participants,observations:[] as {type:"hit";cellIndex:number;participantId:string}[]};
  assert.deepEqual(rarityFocusParticipantIds(state,worlds),[participants[0].id]);
  state=applyObservation(state,{type:"hit",cellIndex:0,participantId:participants[0].id}) as typeof state;
  assert.deepEqual(rarityFocusParticipantIds(state,worlds),[participants[1].id,participants[2].id]);
  const scores=scoreWorldsByStrategy(worlds,state,{type:"rarity-focus"});
  assert.equal(scores.find(s=>s.cellIndex===1)?.strategyScore,1);
  assert.equal(scores.find(s=>s.cellIndex===2)?.strategyScore,1);
  assert.equal(scores.find(s=>s.cellIndex===3)?.strategyScore,0);
  for(const i of [1,2]) state=applyObservation(state,{type:"hit",cellIndex:i,participantId:participants[i].id}) as typeof state;
  assert.deepEqual(rarityFocusParticipantIds(state,worlds),[participants[3].id]);
  state=applyObservation(state,{type:"hit",cellIndex:3,participantId:participants[3].id}) as typeof state;
  assert.deepEqual(rarityFocusParticipantIds(state,worlds),[participants[4].id]);
});
test("published HQ integrity records have binary alpha, unchanged RGB and two-pixel padding", () => {
  const records=JSON.parse(readFileSync("assets/reference/fandom/timeless-validation.json","utf8"));
  assert.equal(records.length,timeless.length);
  for(const r of records.filter((r:{status:string})=>r.status==="HQ")) {
    assert.equal(r.rgbChanges,0);assert.equal(r.binaryAlpha,true);assert.equal(r.padding,2);assert.equal(r.resampled,false);
  }
});
