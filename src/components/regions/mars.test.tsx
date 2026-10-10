import { createHash } from "node:crypto";
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
import { canViewRegion, revealRegion } from "../progress/spoilerPreferences";
import { ProgressContext } from "../progress/ProgressProvider";
import { ProgressGuard } from "../progress/ProgressGuard";
import { resolveRescueSetupContext, rescueSetupHref } from "../rescue/rescueSetupContext";
import { animalParticipant } from "../rescue/rescueParticipants";
import { createDynamicRescueState, getPossibleWorlds, analyzeRescueWorlds } from "../../solver/dynamic/dynamicRescueSolver";
import { rarityFocusParticipantIds } from "../../solver/dynamic/rescueStrategy";

const records = ANIMALS.filter(a => a.regionId === "mars" && a.rarity !== "timeless");
const expected = [
 ["rock","Rock","common",[[0,0],[0,1],[1,0],[1,1]]],
 ["marsmot","Marsmot","common",[[0,1],[1,1],[2,0],[2,1]]],
 ["marsmoset","Marsmoset","common",[[0,0],[0,2],[1,2],[2,1]]],
 ["rover","Rover","rare",[[0,1],[1,0],[1,2]]],
 ["martian","Martian","rare",[[0,0],[0,2],[1,1]]],
 ["marsmallow","Marsmallow","mythical",[[0,0],[2,0]]],
] as const;
const RESTRICTED_PREFERENCES = { maxEarthRegionId: "farm" as const, maxSpaceRegionId: null, showTimeless: false };
test("Mars Space 02 preserves all six approved names, rarities and coordinates",()=>{
 assert.deepEqual(regionPosition("mars"),{group:"Space",number:2});assert.equal(records.length,6);
 expected.forEach(([id,name,rarity,cells],i)=>{assert.equal(records[i].id,id);assert.equal(records[i].name,name);assert.equal(records[i].rarity,rarity);assert.deepEqual(records[i].pattern.cells,cells.map(([row,col])=>({row,col})));});
});
test("Space None / Moon / Mars are cumulative and independent of Earth",()=>{
 for(const endpoint of [null,"moon","mars"] as const){const preferences={...RESTRICTED_PREFERENCES,maxSpaceRegionId:endpoint};assert.equal(canViewRegion("mars",preferences),endpoint==="mars");assert.equal(canViewRegion("moon",preferences),endpoint!==null);assert.equal(canViewRegion("constellation",preferences),false);const html=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><RegionExplorer/></ProgressContext.Provider>);assert.equal(html.includes('href="/regions/mars"'),endpoint==="mars");}
 const p=revealRegion("mars",RESTRICTED_PREFERENCES);assert.equal(p.maxEarthRegionId,"farm");assert.equal(p.maxSpaceRegionId,"mars");
});
test("Mars region/animal barriers and editable contextual setup obey Space visibility",async()=>{
 for(const endpoint of ["moon","mars","moon"] as const){const preferences={...RESTRICTED_PREFERENCES,maxSpaceRegionId:endpoint};const context=resolveRescueSetupContext("mars","marsmoset",preferences);assert.deepEqual(context,endpoint==="mars"?{regionId:"mars",selectedIds:["marsmoset"]}:{regionId:null,selectedIds:[]});const html=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><RescueAssistant animals={ANIMALS} initialContext={context}/></ProgressContext.Provider>);assert.equal(html.includes("rescue-region region-mars"),endpoint==="mars");assert.ok(!html.includes("dynamic-rescue-grid"));const guide=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}>{await AnimalPage({params:Promise.resolve({regionId:"mars",animalId:"marsmoset"})})}</ProgressContext.Provider>);assert.equal(guide.includes("animals-hq/mars/marsmoset.png"),endpoint==="mars");const barrier=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><ProgressGuard regionId="mars">allowed</ProgressGuard></ProgressContext.Provider>);assert.equal(barrier.includes("allowed"),endpoint==="mars");}
 assert.equal(rescueSetupHref("mars","marsmoset"),"/rescue?region=mars&animal=marsmoset");assert.deepEqual(resolveRescueSetupContext("mars",undefined,{...RESTRICTED_PREFERENCES,maxSpaceRegionId:"mars"}),{regionId:"mars",selectedIds:[]});
});
test("All six Mars guides, HQ fallback, static sequence and region search consume real records",()=>{
 assert.equal(animalRoutes().filter(p=>ANIMALS.some(a=>a.id===p.animalId&&a.rarity!=="timeless")&&p.regionId==="mars").length,records.length);assert.equal(getRegionSearchPresentation(getRegionAnimalPresentations("mars")).status,"ready");
 for(const animal of records){const art=getAnimalDisplayArtwork(animal.imagePath)!;assert.ok(art.isHq&&existsSync(`public${art.src}`));assert.equal(getAnimalDisplayArtwork(animal.imagePath,art.src)?.isHq,false);assert.equal(getAnimalDisplayArtwork(animal.imagePath,animal.imagePath),null);assert.ok(getAnimalGuidePresentation("mars",animal.id)?.strategy?.steps.length);}
});
test("Mars dynamic policies work and Marsmallow naturally selects Mythical tier",()=>{
 const participants=[records[1],records[3],records[5]].map(animalParticipant);const state=createDynamicRescueState(participants);const worlds=getPossibleWorlds(state);assert.ok(worlds.length);assert.deepEqual(rarityFocusParticipantIds(state,worlds),[participants[2].id]);for(const strategy of [{type:"balanced"},{type:"finish-found"},{type:"target",participantId:participants[0].id},{type:"rarity-focus"}] as const)assert.equal(analyzeRescueWorlds(state,worlds,strategy).status,"ready");
});
test("Mars extraction retains exact original pixels; shadow removal safely opens all measured gaps",()=>{
 const validation=JSON.parse(readFileSync("assets/reference/fandom/mars-validation.json","utf8"));assert.equal(validation.length,records.length);
 const pockets: Record<string, number[]> = {rock:[],marsmot:[36],marsmoset:[252],rover:[720,900],martian:[66],marsmallow:[377]};
 for(const r of validation){assert.deepEqual(r.sourceEnclosedBackgroundComponents.map((c:{pixels:number})=>c.pixels).sort((a:number,b:number)=>a-b),pockets[r.animal]);const source=readFileSync(`assets/reference/fandom/${r.animal}.png`);const output=readFileSync(`public/game/animals-hq/mars/${r.animal}.png`);assert.equal(createHash("sha256").update(source).digest("hex"),r.sourceSHA256);assert.equal(createHash("sha256").update(output).digest("hex"),r.outputSHA256);assert.deepEqual(r.sourceDimensions,[150,150]);assert.deepEqual([output.readUInt32BE(16),output.readUInt32BE(20)],r.outputDimensions);assert.equal(r.padding,2);assert.equal(r.missingAnimalPixels+r.addedAnimalPixels+r.recoloredPixels+r.artificialSemitransparentPixels,0);assert.equal(r.resampling,false);assert.deepEqual(r.alphaValues,[0,255]);assert.ok(r.removedComponents.every((c:{role:string})=>c.role==="shadow"));}
});
