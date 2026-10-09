import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ANIMALS } from "../../data/animals";
import { PET_SPECIES } from "../../data/pets";
import { analyzeDynamicRescue, applyObservation, createDynamicRescueState, getPossibleWorlds } from "../../solver/dynamic/dynamicRescueSolver";
import { RescueBoard } from "./RescueBoard";
import { animalParticipant, petParticipant } from "./rescueParticipants";

const noop = () => {};
for (const participant of [
  ...["jade-rabbit", "sasquatch", "giraffe"].map(id => animalParticipant(ANIMALS.find(a => a.id === id)!)),
  ...PET_SPECIES.map(petParticipant),
]) {
  test(`${participant.name}: hit artwork stays inside a dedicated board containment wrapper`, () => {
    let state = createDynamicRescueState([participant]);
    const placement = getPossibleWorlds(state)[0].participants[0];
    for (const cellIndex of placement.cells) {
      state = applyObservation(state, { type: "hit", cellIndex, participantId: participant.id });
      const html = renderToStaticMarkup(<RescueBoard regionName="Rescue" participants={[participant]} state={state} result={analyzeDynamicRescue(state)} onObservation={noop} onUndo={noop} onReset={noop} onChange={noop} />);
      assert.equal((html.match(/data-cell-index=/g) ?? []).length, 25);
      assert.equal((html.match(/class="rescue-cell-art"/g) ?? []).length, state.observations.length);
      assert.match(html, /class="rescue-cell-art"><(?:img|span)/);
    }
    assert.equal(analyzeDynamicRescue(state).status, "complete");
  });
}
