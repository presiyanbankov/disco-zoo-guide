import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ANIMALS } from "../../data/animals";
import { AnimalArtwork } from "./AnimalArtwork";
import { getAnimalGuidePresentation } from "./animalGuidePresentation";
import { RegionLandscape } from "../regions/RegionLandscape";

test("all 30 guide records resolve original-size RGBA icons and render their real PNG paths", () => {
  assert.equal(ANIMALS.length, 30);
  for (const record of ANIMALS) {
    const animal = getAnimalGuidePresentation(record.regionId, record.id)!;
    assert.equal(animal.imagePath, record.imagePath);
    const png = readFileSync(join(process.cwd(), "public", record.imagePath));
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(png.readUInt32BE(16), 32);
    assert.equal(png.readUInt32BE(20), 23);
    assert.equal(png[25], 6, "Icon must preserve RGBA channels");
    const html = renderToStaticMarkup(createElement(AnimalArtwork, animal));
    assert.ok(html.includes(`src="${record.imagePath}"`));
    assert.ok(html.includes(`alt="${record.name}"`));
    assert.doesNotMatch(html, /<svg|_next\/image/);
  }
});

test("only approved regions render screenshot crops; Outback and Northern keep original artwork", () => {
  for (const region of ["farm", "savanna", "polar"]) {
    const html = renderToStaticMarkup(createElement(RegionLandscape, { region }));
    assert.match(html, /region-game-art/);
    assert.doesNotMatch(html, /<svg/);
  }
  for (const region of ["outback", "northern"]) {
    const html = renderToStaticMarkup(createElement(RegionLandscape, { region }));
    assert.match(html, /<svg/);
    assert.doesNotMatch(html, /<img|region-game-art/);
  }
});

test("missing artwork uses an accessible fallback without substitute animal drawings", () => {
  const html = renderToStaticMarkup(createElement(AnimalArtwork, { id: "missing-test", name: "Test animal" }));
  assert.match(html, /Test animal artwork unavailable/);
  assert.doesNotMatch(html, /<img|<svg/);
});
