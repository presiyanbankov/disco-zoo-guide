import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ANIMALS } from "../../data/animals";
import { AnimalArtwork } from "./AnimalArtwork";
import { getAnimalDisplayArtwork } from "./animalArtworkPresentation";
import { getAnimalGuidePresentation } from "./animalGuidePresentation";
import constellationProfiles from "../../../scripts/constellationExtractionProfiles.json";
import timelessProfiles from "../../../scripts/timelessExtractionProfiles.json";

const profiles = [...constellationProfiles, ...timelessProfiles.filter(p => p.method === "reviewed-mask")];
for (const profile of profiles) test(`${profile.id}: restored display dimensions, guide, and graceful failure`, () => {
  const animal = ANIMALS.find(a => a.id === profile.id && a.regionId === profile.region)!;
  const artwork = getAnimalDisplayArtwork(animal.imagePath)!;
  assert.equal(artwork.isHq, true);
  assert.equal(artwork.src, `/game/animals-hq/${profile.region}/${profile.id}.png`);
  const bytes = readFileSync(`public${artwork.src}`);
  assert.equal(bytes.readUInt32BE(16), artwork.width);
  assert.equal(bytes.readUInt32BE(20), artwork.height);
  assert.equal(bytes[25], 6);
  assert.ok(!existsSync(`public${animal.imagePath}`), "Initial-only SVG removed");
  assert.equal(getAnimalGuidePresentation(profile.region, profile.id)?.imagePath, animal.imagePath);
  for (const context of ["collection", "detail"] as const) {
    const html = renderToStaticMarkup(createElement(AnimalArtwork, { ...animal, context }));
    assert.ok(html.includes(artwork.src));
    assert.ok(html.includes('data-art-source="hq"'));
  }
  assert.equal(getAnimalDisplayArtwork(animal.imagePath, artwork.src), null, "Failed HQ uses accessible unavailable state, no missing SVG request");
});
