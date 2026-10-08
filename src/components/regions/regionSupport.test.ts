import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import RegionPage, { generateStaticParams as regionParams } from "../../app/regions/[regionId]/page";
import AnimalPage, { generateStaticParams as animalParams } from "../../app/regions/[regionId]/[animalId]/page";
import { ANIMALS } from "../../data/animals";
import { getRegionAnimalPresentations } from "../animals/animalGuidePresentation";
import { getAnimalDisplayArtwork } from "../animals/animalArtworkPresentation";
import { getRegionPresentation, REGION_PRESENTATION } from "./regionPresentation";
import { RegionExplorer } from "./RegionExplorer";
import { RegionSearch } from "./RegionSearch";

const regions = ["farm", "outback", "savanna", "northern", "polar", "jungle", "moon"];
const report = readFileSync("docs/jungle-moon-research.md", "utf8");
const approved = [...report.matchAll(/### ([\w ]+) — (Common|Rare|Mythical)[\s\S]*?```ts\n(.*?)\n```/g)];

test("the 12 new canonical records use the exact approved names, rarities, coordinates and HQ display assets", () => {
  assert.equal(approved.length, 12);
  approved.forEach(([ , name, rarity, text], index) => {
    const regionId = index < 6 ? "jungle" : "moon";
    const id = name.toLowerCase().replaceAll(" ", "-");
    const record = ANIMALS.find(animal => animal.id === id)!;
    const cells = [...text.matchAll(/row: (\d+), col: (\d+)/g)].map(([, row, col]) => ({ row: Number(row), col: Number(col) }));
    assert.equal(record.name, name);
    assert.equal(record.regionId, regionId);
    assert.equal(record.rarity, rarity.toLowerCase());
    assert.deepEqual(record.pattern.cells, cells);
    assert.equal(record.imagePath, `/game/animals/${regionId}/${id}.png`);
    assert.equal(getRegionAnimalPresentations(regionId).find(a => a.id === id)!.imagePath, record.imagePath, "HQ-only sources must survive the server presentation boundary");
    const artwork = getAnimalDisplayArtwork(record.imagePath)!;
    assert.equal(artwork.src, `/game/animals-hq/${regionId}/${id}.png`);
    const originalFallback = getAnimalDisplayArtwork(record.imagePath, artwork.src)!;
    assert.equal(originalFallback.isHq, false);
    assert.equal(getAnimalDisplayArtwork(record.imagePath, originalFallback.src), null);
  });
});

test("navigation exposes precisely seven unlocked regions in the requested sequence, with a non-clickable mystery card", () => {
  assert.deepEqual(REGION_PRESENTATION.map(region => region.id), regions);
  assert.deepEqual(regionParams().map(params => params.regionId), regions);
  const html = renderToStaticMarkup(createElement(RegionExplorer));
  assert.equal((html.match(/class="region-card /g) ?? []).length, 7);
  for (const [index, region] of regions.entries()) {
    assert.ok(html.includes(`href="/regions/${region}"`));
    assert.match(html, new RegExp(`class="region-number">0${region === "moon" ? 1 : index + 1}`));
  }
  assert.match(html, /Unknown region/);
  assert.doesNotMatch(html, /href="\/regions\/(mars|constellation|jurassic)/);
});

test("all seven region pages contain the real search section before their six-animal collection", async () => {
  for (const regionId of regions) {
    const html = renderToStaticMarkup(await RegionPage({ params: Promise.resolve({ regionId }) }));
    assert.match(html, /data-region-search-status="ready"/);
    assert.ok(html.indexOf('id="region-search-title"') < html.indexOf('id="wildlife"'));
    assert.match(html, /UNLOCKED/);
    assert.equal((html.match(/class="animal-card /g) ?? []).length, 6);
    assert.match(html, /id="timeless-title">Timeless/);
  }
});

test("pending region search has 25 unnumbered subdued cells and no fabricated strategy", () => {
  const html = renderToStaticMarkup(createElement(RegionSearch, { regionName: "Moon" }));
  const board = html.match(/<div class="rescue-board"[^>]*>([\s\S]*?)<\/div>/)![1];
  assert.equal((board.match(/class="board-tile tile-quiet"/g) ?? []).length, 25);
  assert.doesNotMatch(board, /<button|tile-step|tile-first|>\d+</);
  assert.match(html, /Sequence not available yet/);
  assert.match(html, /Assumes each animal is equally likely/);
});

test("all 12 new shareable animal routes render approved patterns and real owner-generated search sequences", async () => {
  const routes = animalParams().filter(params => params.regionId === "jungle" || params.regionId === "moon");
  assert.equal(routes.length, 12);
  for (const params of routes) {
    const html = renderToStaticMarkup(await AnimalPage({ params: Promise.resolve(params) }));
    assert.ok(html.includes(`data-route-page="/regions/${params.regionId}/${params.animalId}"`));
    assert.match(html, /data-pattern-status="ready"/);
    assert.match(html, /data-strategy-status="ready"/);
    assert.match(html, /data-art-source="hq"/);
    assert.doesNotMatch(html, /data-region-search-status|LAYOUT DEMO/);
  }
});

test("unsupported regions and unknown animal routes remain non-spoiling 404s", async () => {
  for (const regionId of ["mars", "constellation", "jurassic"]) {
    assert.equal(getRegionPresentation(regionId), undefined);
    assert.deepEqual(getRegionAnimalPresentations(regionId), []);
    await assert.rejects(RegionPage({ params: Promise.resolve({ regionId }) }), /NEXT_HTTP_ERROR_FALLBACK;404/);
  }
  await assert.rejects(AnimalPage({ params: Promise.resolve({ regionId: "moon", animalId: "unknown" }) }), /NEXT_HTTP_ERROR_FALLBACK;404/);
});
