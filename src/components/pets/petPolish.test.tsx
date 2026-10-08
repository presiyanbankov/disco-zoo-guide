import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { PET_SPECIES } from "../../data/pets";
import { PetArtwork } from "./PetArtwork";
import { PetSelector } from "./PetSelector";
import tiles from "./petTiles.json";
import Home from "../../app/page";
import PetsPage from "../../app/pets/page";
const noop = () => {};
test("pet disclosure defaults closed with None and all nine accessible choices", () => {
 const html = renderToStaticMarkup(<PetSelector petId={null} disabled={false} disabledReason="" onPet={noop} />);
 assert.match(html,/<details class="pet-disclosure" data-pet-selected="false">/);
 assert.doesNotMatch(html,/<details[^>]* open/);
 assert.match(html,/<h2 id="rescue-pet-heading"><span>03<\/span> Pet<\/h2>/);
 assert.match(html,/<strong>None<\/strong>/);
 assert.equal((html.match(/class="rescue-pet-option"/g)??[]).length,9);
 assert.doesNotMatch(html,/<select/);
});
test("closed selector names the selected species; disabling preserves the selection", () => {
 const html = renderToStaticMarkup(<PetSelector petId="rabbit" disabled={true} disabledReason="A pet allows at most two animals." onPet={noop} />);
 assert.match(html,/<strong>Rabbit<\/strong>/);
 assert.equal((html.match(/data-pet-id="[^"]+" aria-pressed="(?:true|false)" disabled=""/g)??[]).length,8);
 assert.match(html,/data-pet-id="rabbit" aria-pressed="true" disabled=""/);
});
test("all eight reviewed tile assets resolve with their actual PNG dimensions", () => {
 assert.equal(Object.keys(tiles).length,8);
 for (const pet of PET_SPECIES) {
  const art = tiles[pet.id as keyof typeof tiles];
  assert.ok(existsSync(`public${art.src}`));
  const png = readFileSync(`public${art.src}`);
  assert.equal(png.readUInt32BE(16),art.width);assert.equal(png.readUInt32BE(20),art.height);
  const html = renderToStaticMarkup(<PetArtwork name={pet.name} imagePath={pet.imagePath} />);
  assert.match(html,/data-pet-art="tile"/);assert.ok(html.includes(art.src));
 }
});
test("unresolved species retains an accessible unavailable-artwork fallback", () => {
 const html = renderToStaticMarkup(<PetArtwork name="Unknown species" imagePath="/game/pets/artwork-pending.svg" />);
 assert.match(html,/role="img" aria-label="Unknown species: artwork unavailable"/);
});
test("pet overview consistently says Pet patterns and retains every occupied coordinate", () => {
 const home = renderToStaticMarkup(<Home />); const pets = renderToStaticMarkup(<PetsPage />);
 assert.match(home,/Pet patterns/);assert.match(pets,/Pet patterns/);
 assert.doesNotMatch(home,/Pets? references?/i);
 assert.equal((pets.match(/data-pattern-occupied="true"/g)??[]).length,40);
 assert.match(pets,/repeat\(5, var\(--pet-pattern-cell\)\)/);
});

test("selected pet has a visible non-color selection marker and scoped theme state", () => {
 const html = renderToStaticMarkup(<PetSelector petId="rabbit" disabled={false} disabledReason="" onPet={noop} />);
 assert.match(html, /data-pet-selected="true"/);
 assert.equal((html.match(/class="pet-choice-check"/g) ?? []).length, 1);
 assert.match(html, /class="pet-choice-check" aria-hidden="true"/);
});
