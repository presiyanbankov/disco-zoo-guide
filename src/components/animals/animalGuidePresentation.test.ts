import assert from "node:assert/strict";
import test from "node:test";
import type { Animal, StaticSearchResult } from "../../types/game";
import { getAnimalGuidePresentation, presentOwnerAnimal } from "./animalGuidePresentation";

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

test("preview lookup is region-scoped and never supplies a fake pattern or result", () => {
  const pig = getAnimalGuidePresentation("farm", "pig");
  assert.equal(pig?.source, "development-preview");
  assert.equal(pig?.pattern, undefined);
  assert.equal(pig?.strategy, undefined);
  assert.equal(getAnimalGuidePresentation("polar", "pig"), undefined);
  assert.equal(getAnimalGuidePresentation("farm", "timeless"), undefined);
  assert.equal(getAnimalGuidePresentation("locked-test", "pig"), undefined);
});
