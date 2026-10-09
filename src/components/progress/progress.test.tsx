import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ANIMALS } from "../../data/animals";
import { REGION_PRESENTATION } from "../regions/regionPresentation";
import { RegionExplorer } from "../regions/RegionExplorer";
import { RegionNavigation } from "../regions/RegionNavigation";
import { RescueAssistant } from "../rescue/RescueAssistant";
import { resolveRescueSetupContext } from "../rescue/rescueSetupContext";
import { EARTH_PROGRESS, SPACE_PROGRESS } from "./progression";
import { ProgressContext, ProgressProvider, ProgressControl } from "./ProgressProvider";
import { ProgressGuard } from "./ProgressGuard";
import { ProgressSetup } from "./ProgressSetup";
import { DEFAULT_PREFERENCES, canViewAnimal, canViewRegion, canViewTimeless, getVisibleRegions, parsePreferences, revealRegion, serializePreferences, type SpoilerPreferences } from "./spoilerPreferences";
const noop = () => {};
test("welcome, settings and global control describe visibility rather than gameplay progress", () => {
  for (const firstVisit of [true, false]) {
    const html = renderToStaticMarkup(<ProgressSetup initial={DEFAULT_PREFERENCES} firstVisit={firstVisit} onSave={noop} />);
    const text = html.replace(/<[^>]*>/g, " ");
    assert.match(text, /Choose how much of Disco Zoo the guide should reveal/);
    assert.match(text, /YOUR GUIDE WILL REVEAL/);
    assert.match(text, /visible/);
    assert.doesNotMatch(text, /progress|reached|journey|\bHERE\b/i);
    assert.match(text, firstVisit ? /spoiler level/ : /Spoiler settings/);
  }
  assert.match(renderToStaticMarkup(<ProgressControl />), />Spoilers</);
});
const jungle: SpoilerPreferences = { maxEarthRegionId: "jungle", maxSpaceRegionId: null, showTimeless: false };
function render(children: React.ReactNode, preferences = DEFAULT_PREFERENCES) {
  return renderToStaticMarkup(<ProgressContext.Provider value={{ preferences, save: noop, openSettings: noop }}>{children}</ProgressContext.Provider>);
}
test("conservative first-visit defaults", () => assert.deepEqual(DEFAULT_PREFERENCES, { maxEarthRegionId: "farm", maxSpaceRegionId: null, showTimeless: false }));
test("versioned storage round-trips only recognized fields", () => {
  const saved = serializePreferences(jungle);
  assert.equal(JSON.parse(saved).version, 1);
  assert.deepEqual(parsePreferences(saved), jungle);
  assert.deepEqual(parsePreferences(JSON.stringify({ version: 1, ...jungle, extra: "ignored" })), jungle);
});
for (const raw of [null, "", "broken", "null", "[]", "42", JSON.stringify({ version: 2, ...jungle }), JSON.stringify({ version: 1, ...jungle, maxEarthRegionId: "mars" }), JSON.stringify({ version: 1, ...jungle, maxSpaceRegionId: "farm" }), JSON.stringify({ version: 1, ...jungle, showTimeless: "yes" })]) {
  test(`malformed/stale preferences fall back: ${raw}`, () => assert.equal(parsePreferences(raw), null));
}
test("Earth and Space progression metadata is complete and separate", () => {
  assert.equal(EARTH_PROGRESS.length, 11); assert.equal(SPACE_PROGRESS.length, 3);
  assert.equal(EARTH_PROGRESS[10].id, "nocturnal"); assert.equal(SPACE_PROGRESS[2].id, "constellation");
});
test("Farm sees Farm, not implemented Jungle or Space", () => {
  assert.ok(canViewRegion("farm", DEFAULT_PREFERENCES));
  assert.equal(canViewRegion("jungle", DEFAULT_PREFERENCES), false); assert.equal(canViewRegion("moon", DEFAULT_PREFERENCES), false);
  assert.equal(canViewRegion("unknown", DEFAULT_PREFERENCES), false);
});
test("Jungle sees earlier Earth destinations without enabling Space", () => {
  for(const r of EARTH_PROGRESS.slice(0,6))assert.ok(canViewRegion(r.id,jungle));
  assert.equal(canViewRegion("jurassic",jungle),false); assert.equal(canViewRegion("moon",jungle),false);
  assert.equal(getVisibleRegions(REGION_PRESENTATION,jungle).length,6);
});
test("Space progress is independent, including future destinations", () => {
  const p = { ...DEFAULT_PREFERENCES, maxSpaceRegionId: "mars" as const };
  assert.ok(canViewRegion("moon",p)); assert.ok(canViewRegion("mars",p));
  assert.equal(canViewRegion("constellation",p),false); assert.equal(canViewRegion("outback",p),false);
  assert.equal(canViewRegion("moon",{...jungle,maxEarthRegionId:"nocturnal"}),false);
});
test("Timeless is a visibility-only gate and still requires visible region", () => {
  const timeless = { regionId: "farm", rarity: "timeless" };
  assert.equal(canViewAnimal(timeless,DEFAULT_PREFERENCES),false);
  assert.ok(canViewTimeless({...DEFAULT_PREFERENCES,showTimeless:true}));
  assert.ok(canViewAnimal(timeless,{...DEFAULT_PREFERENCES,showTimeless:true}));
  assert.equal(canViewAnimal({...timeless,regionId:"jungle"},{...DEFAULT_PREFERENCES,showTimeless:true}),false);
  assert.equal(canViewAnimal({...timeless,hidden:true},{...DEFAULT_PREFERENCES,showTimeless:true}),false);
});
test("reveal updates only corresponding track and never enables Timeless", () => {
  assert.deepEqual(revealRegion("jungle",DEFAULT_PREFERENCES),jungle);
  assert.deepEqual(revealRegion("moon",jungle),{...jungle,maxSpaceRegionId:"moon"});
  assert.equal(revealRegion("farm",jungle),jungle); assert.equal(revealRegion("unknown",jungle),jungle);
});
test("progress can decrease and immediately change visibility", () => {
  assert.ok(canViewRegion("jungle",jungle));
  assert.equal(canViewRegion("jungle",{...jungle,maxEarthRegionId:"savanna"}),false);
});
test("first render contains only safe loading, never normal content", () => {
  const html=renderToStaticMarkup(<ProgressProvider><div>Jungle Phoenix hidden art</div></ProgressProvider>);
  assert.match(html,/Preparing your guide/);assert.doesNotMatch(html,/Jungle|Phoenix|hidden art/);
});
test("welcome provides both tracks, default hide and clear entry", () => {
  const html=renderToStaticMarkup(<ProgressSetup initial={DEFAULT_PREFERENCES} firstVisit onSave={noop} />);
  assert.match(html,/WELCOME TO/); assert.match(html,/Enter Guide/);assert.match(html,/Earth spoilers/);assert.match(html,/Independent from Earth/);
  const farmInput = html.match(/<input[^>]*name="earth-progress"[^>]*>/g)?.find(input => input.includes('value="farm"'));
  assert.ok(farmInput); assert.match(farmInput,/checked=""/);
  assert.doesNotMatch(html,/Phoenix|Moonkey|Sasquatch/);
});
test("journey presentation shows cumulative reached stops with distinct endpoints", () => {
  const html = renderToStaticMarkup(<ProgressSetup initial={{ maxEarthRegionId: "jurassic", maxSpaceRegionId: "mars", showTimeless: false }} firstVisit onSave={noop} />);
  const earth = html.split('class="progress-track progress-earth"')[1].split('</fieldset>')[0];
  const space = html.split('class="progress-track progress-space"')[1].split('</fieldset>')[0];
  assert.equal((earth.match(/data-progress-state="reached"/g) ?? []).length, 6);
  assert.equal((earth.match(/data-progress-state="endpoint"/g) ?? []).length, 1);
  assert.equal((earth.match(/data-progress-state="future"/g) ?? []).length, 4);
  assert.equal((space.match(/data-progress-state="reached"/g) ?? []).length, 1);
  assert.equal((space.match(/data-progress-state="endpoint"/g) ?? []).length, 1);
  assert.equal((space.match(/data-progress-state="future"/g) ?? []).length, 1);
  assert.match(earth,/Jurassic, show through this region/); assert.match(space,/Moon, visible/);
});
test("entry summary reflects progress and treats Timeless as a compact preference", () => {
  const html = renderToStaticMarkup(<ProgressSetup initial={{ maxEarthRegionId: "jurassic", maxSpaceRegionId: null, showTimeless: true }} firstVisit onSave={noop} />);
  assert.match(html,/Earth through <strong>Jurassic<\/strong>/);
  assert.match(html,/No Space regions/); assert.match(html,/Timeless shown/);
  assert.match(html,/class="timeless-choices"/); assert.match(html,/class="progress-entry"/);
  assert.match(html,/aria-label="Show Timeless"/); assert.match(html,/Enter Guide/);
});
test("explorer hides names/artwork and navigation filters hidden regions", () => {
  const explorer=render(<RegionExplorer />);const navigation=render(<RegionNavigation currentId="farm" />);
  assert.match(explorer,/href="\/regions\/farm"/);assert.match(explorer,/Unknown region/);
  assert.doesNotMatch(explorer,/Jungle|Moon|region-jungle|region-moon|\/regions\/jungle/);
  assert.doesNotMatch(navigation,/Jungle|Moon|Savanna/);
});
test("visible route allows content; hidden region/animal routes render barrier only", () => {
  assert.match(render(<ProgressGuard regionId="farm"><div>Pig guide</div></ProgressGuard>),/Pig guide/);
  const hidden=render(<ProgressGuard regionId="jungle"><div>Phoenix pattern</div></ProgressGuard>);
  assert.match(hidden,/Hidden by your spoiler settings/);assert.match(hidden,/Reveal Jungle/);assert.match(hidden,/Go back/);assert.doesNotMatch(hidden,/Phoenix|pattern/);
});
test("future Timeless barrier has independent reveal action", () => {
  const html=render(<ProgressGuard regionId="farm" rarity="timeless"><div>Hidden Timeless name</div></ProgressGuard>);
  assert.match(html,/Show Timeless/);assert.doesNotMatch(html,/Hidden Timeless name|Reveal Farm/);
});
test("progress beyond implementation does not create routes or reveal future destinations", () => {
  const maximum: SpoilerPreferences = { maxEarthRegionId: "nocturnal", maxSpaceRegionId: "constellation", showTimeless: true };
  assert.equal(getVisibleRegions(REGION_PRESENTATION, maximum).length, REGION_PRESENTATION.length);
  const html = render(<RegionExplorer />, maximum);
  assert.equal((html.match(/data-region-locked="true"/g) ?? []).length, EARTH_PROGRESS.length + SPACE_PROGRESS.length - REGION_PRESENTATION.length);
  assert.doesNotMatch(html, /Nocturnal|Mars|Constellation/);
});
test("rescue selector and URL context respect progress", () => {
  assert.deepEqual(resolveRescueSetupContext("jungle","monkey",DEFAULT_PREFERENCES),{regionId:null,selectedIds:[]});
  const hidden=render(<RescueAssistant animals={ANIMALS} initialContext={{regionId:"jungle",selectedIds:["monkey"]}} />);
  assert.doesNotMatch(hidden,/region-jungle|Monkey|Phoenix/);
  assert.doesNotMatch(hidden,/rescue-animal-option/);
  assert.equal((hidden.match(/class="rescue-region region-/g)??[]).length,1);
  const visible=render(<RescueAssistant animals={ANIMALS} initialContext={{regionId:"farm",selectedIds:["pig"]}} />);
  assert.match(visible,/data-animal-id="pig"/);assert.match(visible,/aria-pressed="true"/);assert.doesNotMatch(visible,/dynamic-rescue-grid/);
});
