import type { DisplayParticipant } from "./rescueParticipants";
import { AnimalArtwork } from "../animals/AnimalArtwork";
import { PetArtwork } from "../pets/PetArtwork";
export function ParticipantArtwork({ participant }: { participant: DisplayParticipant }) {
  return participant.kind === "pet" ? <PetArtwork name={participant.name} imagePath={participant.imagePath} /> : <AnimalArtwork id={participant.id} name={participant.name} imagePath={participant.imagePath} />;
}
