import { REGION_PRESENTATION } from "../regions/regionPresentation";
import assert from "node:assert/strict";
import test from "node:test";
import type { Animal, StaticSearchResult } from "../../types/game";
import { ANIMALS } from "../../data/animals";
import { getAnimalGuidePresentation, getRegionAnimalPresentations, presentOwnerAnimal } from "./animalGuidePresentation";

// Synthetic, unpublished records used only to verify frontend visibility rules.
const ownerRecord: Animal = {
  id: "test-animal",
  name: "Test animal",
  regionId: "farm",
  rarity: "common",
  pattern: { cells: [{ row: 0, col: 0 }] },
  imagePath: "",
};

test("future owner records retain their supplied pattern/result while hidden and unavailable identities are excluded", () => {
  const strategy: StaticSearchResult = { animalId: "test-animal", steps: [] };
  const view = presentOwnerAnimal(ownerRecord, strategy);
  assert.equal(view?.source, "owner-data");
  assert.equal(view?.pattern, ownerRecord.pattern);
  assert.equal(view?.strategy, strategy);
  assert.equal(presentOwnerAnimal({ ...ownerRecord, hidden: true }), undefined);
  assert.equal(presentOwnerAnimal({ ...ownerRecord, rarity: "timeless" }), undefined);
  assert.equal(presentOwnerAnimal({ ...ownerRecord, regionId: "locked-test" as Animal["regionId"] }), undefined);
});

test("approved lookup supplies the original pattern, excludes other regions, and generates a strategy and supplies the approved sprite path", () => {
  const pig = getAnimalGuidePresentation("farm", "pig");
  assert.equal(pig?.source, "owner-data");
  assert.equal(pig?.pattern, ANIMALS.find((animal) => animal.id === "pig")?.pattern);
  assert.equal(pig?.strategy?.animalId, "pig");
  assert.ok(pig?.strategy?.steps.length);
  assert.equal(pig?.imagePath, "/game/animals/farm/pig.png");
  assert.equal(getAnimalGuidePresentation("polar", "pig"), undefined);
  assert.equal(getAnimalGuidePresentation("farm", "timeless"), undefined);
  assert.equal(getAnimalGuidePresentation("locked-test", "pig"), undefined);
});

test("approved roster has exactly six classic animals per region, normalized cells, and intact separated patterns", () => {
  assert.equal(ANIMALS.length, REGION_PRESENTATION.length * 6);
  assert.equal(new Set(ANIMALS.map((animal) => animal.id)).size, ANIMALS.length);
  for (const region of REGION_PRESENTATION.map(r => r.id)) {
    const animals = getRegionAnimalPresentations(region);
    assert.equal(animals.length, 6);
    assert.equal(animals.filter((animal) => animal.rarity === "common").length, 3);
    assert.equal(animals.filter((animal) => animal.rarity === "rare").length, 2);
    assert.equal(animals.filter((animal) => animal.rarity === "mythical").length, 1);
    for (const animal of animals) {
      const cells = animal.pattern!.cells;
      assert.equal(Math.min(...cells.map((cell) => cell.row)), 0);
      assert.equal(Math.min(...cells.map((cell) => cell.col)), 0);
      assert.equal(new Set(cells.map((cell) => `${cell.row},${cell.col}`)).size, cells.length);
      assert.ok(cells.every((cell) => Number.isInteger(cell.row) && Number.isInteger(cell.col) && cell.row < 5 && cell.col < 5));
      assert.deepEqual(cells, ANIMALS.find(record => record.regionId === region && record.id === animal.id)!.pattern.cells);
    }
  }
  assert.deepEqual(getAnimalGuidePresentation("polar", "yeti")?.pattern?.cells, [{ row: 0, col: 0 }, { row: 2, col: 0 }]);
  assert.deepEqual(getAnimalGuidePresentation("polar", "seal")?.pattern?.cells, [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 3 }, { row: 2, col: 2 }]);
  assert.deepEqual(getAnimalGuidePresentation("northern", "beaver")?.pattern?.cells, [{ row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }]);
});
