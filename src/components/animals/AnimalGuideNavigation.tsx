import { TransitionLink as Link } from "../navigation/TransitionLink";
import type { AnimalCardPreview } from "./DEV_MOCK_ANIMALS";

export function AnimalGuideNavigation({ animals, currentId, regionName }: { animals: readonly AnimalCardPreview[]; currentId: string; regionName: string }) {
  const index = animals.findIndex((animal) => animal.id === currentId);
  const previous = index > 0 ? animals[index - 1] : undefined;
  const next = index >= 0 ? animals[index + 1] : undefined;
  return (
    <nav className="animal-guide-navigation" aria-label={`More ${regionName} animal guides`}>
      <span className="eyebrow">MORE FROM {regionName.toUpperCase()}</span>
      <div className="animal-guide-nav-links">
        {previous ? <Link href={`/regions/${previous.regionId}/${previous.id}`}><span className="guide-nav-direction">← PREVIOUS ANIMAL</span><strong>{previous.name}</strong></Link>
          : <Link href={`/regions/${animals[0]?.regionId ?? "farm"}#wildlife`}><span className="guide-nav-direction">← THE COLLECTION</span><strong>All {regionName} animals</strong></Link>}
        {next ? <Link href={`/regions/${next.regionId}/${next.id}`}><span className="guide-nav-direction">NEXT ANIMAL →</span><strong>{next.name}</strong></Link>
          : <Link href="/#regions"><span className="guide-nav-direction">KEEP EXPLORING →</span><strong>All regions</strong></Link>}
      </div>
    </nav>
  );
}
