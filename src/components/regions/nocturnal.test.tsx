import { createHash } from "node:crypto";
import AnimalPage, { generateStaticParams as animalRoutes } from "../../app/regions/[regionId]/[animalId]/page";
import { RegionExplorer } from "./RegionExplorer";
import { EARTH_PROGRESS, SPACE_PROGRESS } from "../progress/progression";
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

const records = ANIMALS.filter(a => a.regionId === "nocturnal" && a.rarity !== "timeless");
const expected = [
  ["badger", "Badger", "common", [[0,2],[1,0],[1,2],[2,0]]],
  ["bat", "Bat", "common", [[0,0],[0,2],[1,1],[2,1]]],
  ["kiwi", "Kiwi", "common", [[0,1],[1,0],[1,2],[2,2]]],
  ["flying-squirrel", "Flying Squirrel", "rare", [[0,2],[1,0],[1,3]]],
  ["kakapo", "Kakapo", "rare", [[0,0],[0,1],[2,1]]],
  ["ghost", "Ghost", "mythical", [[0,0],[1,1]]],
] as const;
test("Nocturnal Earth 11 has exactly the six approved classic records", () => {
  assert.deepEqual(regionPosition("nocturnal"), { group: "Earth", number: 11 });
  assert.equal(records.length, 6);
  expected.forEach(([id,name,rarity,cells], index) => {
    assert.equal(records[index].id,id); assert.equal(records[index].name,name); assert.equal(records[index].rarity,rarity);
    assert.deepEqual(records[index].pattern.cells,cells.map(([row,col])=>({row,col})));
  });
});
test("Nocturnal uses reviewed HQ assets and graceful artwork fallback", () => {
  for (const animal of records) {
    const artwork = getAnimalDisplayArtwork(animal.imagePath)!;
    assert.ok(artwork.isHq); assert.ok(existsSync(`public${artwork.src}`));
    assert.equal(getAnimalDisplayArtwork(animal.imagePath,artwork.src)?.isHq,false);
    assert.equal(getAnimalDisplayArtwork(animal.imagePath,animal.imagePath),null);
    assert.ok(getAnimalGuidePresentation("nocturnal",animal.id)?.strategy?.steps.length);
  }
});
test("Nocturnal visibility and contextual Rescue respect the existing barrier", () => {
  const before = { ...DEFAULT_PREFERENCES, maxEarthRegionId: "mountain" as const };
  const after = revealRegion("nocturnal",before);
  assert.equal(canViewRegion("nocturnal",before),false); assert.ok(canViewRegion("nocturnal",after));
  assert.deepEqual(resolveRescueSetupContext("nocturnal","badger",before),{regionId:null,selectedIds:[]});
  assert.deepEqual(resolveRescueSetupContext("nocturnal","badger",after),{regionId:"nocturnal",selectedIds:["badger"]});
  assert.equal(rescueSetupHref("nocturnal","badger"),"/rescue?region=nocturnal&animal=badger");
  for (const preferences of [before,after,before]) {
    const html=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><ProgressGuard regionId="nocturnal"><span>Badger pattern content</span></ProgressGuard></ProgressContext.Provider>);
    assert.equal(html.includes("Badger pattern content"),preferences===after);
  }
});
test("Nocturnal region and all dynamic policies consume canonical data", () => {
  assert.equal(getRegionSearchPresentation(getRegionAnimalPresentations("nocturnal")).status,"ready");
  const participants=[records[2],records[3],records[5]].map(animalParticipant);
  const state=createDynamicRescueState(participants); const worlds=getPossibleWorlds(state);
  assert.ok(worlds.length); assert.deepEqual(rarityFocusParticipantIds(state,worlds),[participants[2].id]);
  for(const strategy of [{type:"balanced"},{type:"finish-found"},{type:"target",participantId:participants[0].id},{type:"rarity-focus"}] as const) {
    assert.equal(analyzeRescueWorlds(state,worlds,strategy).status,"ready");
  }
});


test("Nocturnal extraction preserves native pixels and supports varied native dimensions without enclosed seeds", () => {
  const sourceSizes = { badger: [180,112], bat: [157,121], kiwi: [160,128], "flying-squirrel": [162,100], kakapo: [152,138], ghost: [156,140] };
  const validation = JSON.parse(readFileSync("assets/reference/fandom/nocturnal-validation.json", "utf8"));
  assert.equal(validation.length, records.length);
  for (const record of validation) {
    assert.deepEqual(record.sourceDimensions, sourceSizes[record.animal as keyof typeof sourceSizes]);
    const source = readFileSync(`assets/reference/fandom/${record.animal}.png`);
    const output = readFileSync(`public/game/animals-hq/nocturnal/${record.animal}.png`);
    assert.equal(createHash("sha256").update(source).digest("hex"), record.sourceSHA256);
    assert.equal(createHash("sha256").update(output).digest("hex"), record.outputSHA256);
    assert.deepEqual([source.readUInt32BE(16),source.readUInt32BE(20)], record.sourceDimensions);
    assert.deepEqual([output.readUInt32BE(16),output.readUInt32BE(20)], record.outputDimensions);
    assert.equal(record.padding,2); assert.equal(record.missingAnimalPixels,0);
    assert.equal(record.addedAnimalPixels,0); assert.equal(record.recoloredPixels,0);
    assert.equal(record.artificialSemitransparentPixels,0); assert.equal(record.resampling,false);
    assert.deepEqual(record.alphaValues,[0,255]);
  }
  assert.ok(validation.every((r: {removedComponents: {role:string}[]}) => r.removedComponents.every(c => c.role === "shadow")));
});

test("Nocturnal Rescue setup filters hidden content and visible Badger context never auto-starts", () => {
  const before = { ...DEFAULT_PREFERENCES, maxEarthRegionId: "mountain" as const };
  const after = revealRegion("nocturnal",before);
  for (const preferences of [before,after]) {
    const initialContext=resolveRescueSetupContext("nocturnal","badger",preferences);
    const html=renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><RescueAssistant animals={ANIMALS} initialContext={initialContext}/></ProgressContext.Provider>);
    assert.equal(html.includes("rescue-region region-nocturnal"),preferences===after);
    assert.equal(/(?:aria-pressed="true"[^>]*data-animal-id="badger")/.test(html),preferences===after);
    assert.ok(html.includes("rescue-setup")); assert.ok(!html.includes("dynamic-rescue-grid"));
  }
  assert.deepEqual(resolveRescueSetupContext("nocturnal",undefined,after),{regionId:"nocturnal",selectedIds:[]});
  assert.equal(rescueSetupHref("nocturnal"),"/rescue?region=nocturnal");
});


test("final Earth availability has no mystery cards while Space stays independent", () => {
  for (const endpoint of ["nocturnal", "mountain"] as const) {
    const preferences = { ...DEFAULT_PREFERENCES, maxEarthRegionId: endpoint };
    const html = renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}><RegionExplorer/></ProgressContext.Provider>);
    const earth = html.split('class="region-group group-earth"')[1].split('class="region-group group-space"')[0];
    const space = html.split('class="region-group group-space"')[1];
    const hiddenEarth = endpoint === "nocturnal" ? 0 : 1;
    assert.equal((earth.match(/data-region-locked="true"/g) ?? []).length, hiddenEarth);
    assert.equal((earth.match(/class="region-card /g) ?? []).length, EARTH_PROGRESS.length - hiddenEarth);
    assert.equal((space.match(/data-region-locked="true"/g) ?? []).length, SPACE_PROGRESS.length);
    assert.ok(!space.includes('href="/regions/moon"'));
    assert.equal(earth.includes('href="/regions/nocturnal"'), endpoint === "nocturnal");
  }
});


test("all six Nocturnal animal routes render exact pattern coordinates and real strategies behind the barrier", async () => {
  const routes = animalRoutes().filter(r => r.regionId === "nocturnal" && records.some(a => a.id === r.animalId));
  assert.deepEqual(routes.map(r => r.animalId), records.map(a => a.id));
  for (const endpoint of ["mountain", "nocturnal"] as const) {
    const preferences = { ...DEFAULT_PREFERENCES, maxEarthRegionId: endpoint };
    for (const animal of records) {
      const page = await AnimalPage({params: Promise.resolve({regionId: "nocturnal", animalId: animal.id})});
      const html = renderToStaticMarkup(<ProgressContext.Provider value={{preferences,save:()=>{},openSettings:()=>{}}}>{page}</ProgressContext.Provider>);
      if (endpoint === "mountain") {
        assert.ok(html.includes("progress-barrier"));
        assert.ok(!html.includes('data-pattern-status="ready"'));
        assert.ok(!html.includes("animals-hq/nocturnal"));
      } else {
        const cells = animal.pattern.cells.map(c => `row ${c.row+1}, column ${c.col+1}`).join("; ");
        assert.ok(html.includes(`${animal.name} pattern. Occupied cells: ${cells}.`));
        assert.ok(html.includes('data-strategy-status="ready"'));
        assert.ok(html.includes('data-art-source="hq"'));
      }
    }
  }
});
