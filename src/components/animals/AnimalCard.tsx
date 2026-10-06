import { AnimalArtwork } from "./AnimalArtwork";
import { TransitionLink as Link } from "../navigation/TransitionLink";
import type { AnimalCardPreview } from "./DEV_MOCK_ANIMALS";

export function AnimalCard({ animal, index }: { animal: AnimalCardPreview; index: number }) {
  return (
    <Link href={`/regions/${animal.regionId}/${animal.id}`} className={`animal-card rarity-${animal.rarity}`} aria-labelledby={`animal-${animal.id}`}>
      <div className="animal-art-stage">
        <span className="animal-card-index" aria-hidden="true">0{index + 1}</span>
        <span className="rarity-badge">{animal.rarity}</span>
        <AnimalArtwork id={animal.id} name={animal.name} imagePath={animal.imagePath} transitionName={`animal-${animal.regionId}-${animal.id}`} />
        <span className="animal-ground" />
        {animal.rarity === "mythical" && <span className="mythical-star" aria-hidden="true">✦</span>}
      </div>
      <div className="animal-card-copy">
        <h3 id={`animal-${animal.id}`}>{animal.name}</h3>
        <span className="animal-guide-status">View field notes <span aria-hidden="true">↗</span></span>
      </div>
    </Link>
  );
}
