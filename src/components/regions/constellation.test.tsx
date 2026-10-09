import AnimalPage, { generateStaticParams as animalRoutes } from "../../app/regions/[regionId]/[animalId]/page";
import { RegionExplorer } from "./RegionExplorer";
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

const records = ANIMALS.filter(a => a.regionId === "constellation" && a.rarity !== "timeless");
const expected = [
 ["chamaeleon","Chamaeleon","common",[[0,1],[0,3],[1,0],[1,1]]],
 ["corvus","Corvus","common",[[0,1],[0,2],[2,0],[2,2]]],
 ["lynx","Lynx","common",[[0,1],[1,0],[1,1],[2,0]]],
 ["pisces","Pisces","rare",[[0,1],[1,2],[2,0]]],
 ["capricornus","Capricornus","rare",[[0,0],[0,3],[1,2]]],
 ["pegasus","Pegasus","mythical",[[0,2],[2,0]]],
] as const;
test("Constellation Space 03 preserves all six approved names, rarities and coordinates",()=>{
 assert.deepEqual(regionPosition("constellation"),{group:"Space",number:3});assert.equal(records.length,6);
 expected.forEach(([id,name,rarity,cells],i)=>{assert.equal(records[i].id,id);assert.equal(records[i].name,name);assert.equal(records[i].rarity,rarity);assert.deepEqual(records[i].pattern.cells,cells.map(([row,col])=>({row,col})));});
});
test("Space None / Moon / Mars / Constellation are cumulative and independent of Earth",()=>{
 for(const endpoint of [null,"moon","mars","constellation"] as const){const preferences={...DEFAULT_PREFERENCES,maxSpaceRegionId:endpoint};assert.equal(canViewRegion("constellation",preferences),endpoint==="constellation");assert.equal(canViewRegion("moon",preferences),endpoint!==null);assert.equal(canViewRegion("mars",preferences),endpoint==="mars"||endpoint==="constellation");const html=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><RegionExplorer/></ProgressContext.Provider>);assert.equal(html.includes('href="/regions/constellation"'),endpoint==="constellation");}
 const p=revealRegion("constellation",DEFAULT_PREFERENCES);assert.equal(p.maxEarthRegionId,"farm");assert.equal(p.maxSpaceRegionId,"constellation");
});
test("Constellation region/animal barriers and editable contextual setup obey Space visibility",async()=>{
 for(const endpoint of ["moon","constellation","moon"] as const){const preferences={...DEFAULT_PREFERENCES,maxSpaceRegionId:endpoint};const context=resolveRescueSetupContext("constellation","pegasus",preferences);assert.deepEqual(context,endpoint==="constellation"?{regionId:"constellation",selectedIds:["pegasus"]}:{regionId:null,selectedIds:[]});const html=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><RescueAssistant animals={ANIMALS} initialContext={context}/></ProgressContext.Provider>);assert.equal(html.includes("rescue-region region-constellation"),endpoint==="constellation");assert.ok(!html.includes("dynamic-rescue-grid"));const guide=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}>{await AnimalPage({params:Promise.resolve({regionId:"constellation",animalId:"pegasus"})})}</ProgressContext.Provider>);assert.equal(guide.includes("animals/constellation/pegasus.svg"),endpoint==="constellation");const barrier=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><ProgressGuard regionId="constellation">allowed</ProgressGuard></ProgressContext.Provider>);assert.equal(barrier.includes("allowed"),endpoint==="constellation");}
 assert.equal(rescueSetupHref("constellation","pegasus"),"/rescue?region=constellation&animal=pegasus");assert.deepEqual(resolveRescueSetupContext("constellation",undefined,{...DEFAULT_PREFERENCES,maxSpaceRegionId:"constellation"}),{regionId:"constellation",selectedIds:[]});
});
test("All six Constellation guides, non-HQ fallback, static sequence and region search consume real records",()=>{
 assert.equal(animalRoutes().filter(p=>p.regionId==="constellation" && p.animalId!=="horologium").length,records.length);assert.equal(getRegionSearchPresentation(getRegionAnimalPresentations("constellation")).status,"ready");
 for(const animal of records){const art=getAnimalDisplayArtwork(animal.imagePath)!;assert.ok(!art.isHq&&existsSync(`public${art.src}`));assert.ok(art.src.endsWith(".svg"));assert.ok(!existsSync(`public/game/animals-hq/constellation/${animal.id}.png`));assert.match(readFileSync(`public${art.src}`,"utf8"),/viewBox="0 0 32 23"/);assert.equal(getAnimalDisplayArtwork(animal.imagePath,animal.imagePath),null);assert.ok(getAnimalGuidePresentation("constellation",animal.id)?.strategy?.steps.length);}
});
test("Constellation dynamic policies work and Pegasus naturally selects Mythical tier",()=>{
 const participants=[records[1],records[3],records[5]].map(animalParticipant);const state=createDynamicRescueState(participants);const worlds=getPossibleWorlds(state);assert.ok(worlds.length);assert.deepEqual(rarityFocusParticipantIds(state,worlds),[participants[2].id]);for(const strategy of [{type:"balanced"},{type:"finish-found"},{type:"target",participantId:participants[0].id},{type:"rarity-focus"}] as const)assert.equal(analyzeRescueWorlds(state,worlds,strategy).status,"ready");
});

test("full visibility leaves no mandatory Earth or Space mystery cards",()=>{
 const preferences={...DEFAULT_PREFERENCES,maxEarthRegionId:"nocturnal" as const,maxSpaceRegionId:"constellation" as const};
 const html=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><RegionExplorer/></ProgressContext.Provider>);
 assert.ok(!html.includes('data-region-locked="true"'));
});
