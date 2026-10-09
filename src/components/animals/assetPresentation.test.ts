import { REGION_PRESENTATION } from "../regions/regionPresentation";
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ANIMALS } from "../../data/animals";
import { AnimalArtwork } from "./AnimalArtwork";
import { getAnimalDisplayArtwork } from "./animalArtworkPresentation";
import { getAnimalGuidePresentation } from "./animalGuidePresentation";
import { RegionLandscape } from "../regions/RegionLandscape";

test("existing 30 canonical records and original RGBA icons remain intact while display prefers reviewed HQ", () => {
  assert.equal(ANIMALS.length, REGION_PRESENTATION.length * 6);
  for (const record of ANIMALS.slice(0, 30)) {
    const animal = getAnimalGuidePresentation(record.regionId, record.id)!;
    assert.equal(animal.imagePath, record.imagePath);
    const png = readFileSync(join(process.cwd(), "public", record.imagePath));
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(png.readUInt32BE(16), 32);
    assert.equal(png.readUInt32BE(20), 23);
    assert.equal(png[25], 6, "Icon must preserve RGBA channels");
    const html = renderToStaticMarkup(createElement(AnimalArtwork, animal));
    assert.ok(html.includes(`src="${getAnimalDisplayArtwork(record.imagePath)!.src}"`));
    assert.ok(html.includes(`alt="${record.name}"`));
    assert.doesNotMatch(html, /<svg|_next\/image/);
  }
});

test("all supported regions use vector landscapes without screenshot layers", () => {
  for (const region of REGION_PRESENTATION.map(r => r.id)) {
    const html = renderToStaticMarkup(createElement(RegionLandscape, { region }));
    assert.match(html, /<svg/);
    assert.match(html, /land-far/);
    assert.doesNotMatch(html, /<img|region-game-art|game\/regions/);
  }
});

test("all supported collection and detail contexts render validated HQ dimensions without upscale assets", () => {
  for (const record of ANIMALS) {
    const collection = renderToStaticMarkup(createElement(AnimalArtwork, { ...record, context: "collection" }));
    const detail = renderToStaticMarkup(createElement(AnimalArtwork, { ...record, context: "detail" }));
    const artwork = getAnimalDisplayArtwork(record.imagePath)!;
    assert.equal(artwork.src, `/game/animals-hq/${record.regionId}/${record.id}.png`);
    assert.equal(artwork.isHq, true);
    for (const html of [collection, detail]) {
      assert.ok(html.includes(`src="${artwork.src}"`));
      assert.match(html, /data-art-source="hq"/);
      assert.doesNotMatch(html, /scale4x|sprite-upscale|game\/derived/);
    }
    const png = readFileSync(join(process.cwd(), "public", artwork.src));
    assert.equal(png.readUInt32BE(16), artwork.width);
    assert.equal(png.readUInt32BE(20), artwork.height);
    assert.equal(png[25], 6);
  }
});

test("missing manifest entry or failed HQ loads use canonical art; failed canonical loads use the unavailable state", () => {
  const original = "/game/animals/farm/pig.png";
  const hq = getAnimalDisplayArtwork(original)!;
  assert.deepEqual(getAnimalDisplayArtwork(original, hq.src), { src: original, width: 32, height: 23, isHq: false });
  assert.equal(getAnimalDisplayArtwork(original, original), null);
  assert.deepEqual(getAnimalDisplayArtwork("/game/animals/farm/unresolved-test.png"), {
    src: "/game/animals/farm/unresolved-test.png", width: 32, height: 23, isHq: false,
  });
  assert.equal(getAnimalDisplayArtwork(), null);
});

test("missing artwork uses an accessible fallback without substitute animal drawings", () => {
  const html = renderToStaticMarkup(createElement(AnimalArtwork, { id: "missing-test", name: "Test animal" }));
  assert.match(html, /Test animal artwork unavailable/);
  assert.doesNotMatch(html, /<img|<svg/);
});
