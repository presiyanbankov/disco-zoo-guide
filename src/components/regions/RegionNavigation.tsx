import { regionPosition } from "./regionPresentation";
import { TransitionLink as Link } from "../navigation/TransitionLink";
import { REGION_PRESENTATION } from "./regionPresentation";

export function RegionNavigation({ currentId }: { currentId: string }) {
  return (
    <nav className="region-navigation" aria-label="Explore available regions">
      <span className="eyebrow">KEEP EXPLORING</span>
      <div className="region-nav-links">
        {REGION_PRESENTATION.map((region) => (
          <Link key={region.id} className={`region-nav-link region-${region.id}`} href={`/regions/${region.id}`} aria-current={currentId === region.id ? "page" : undefined}>
            <span className="region-nav-number">{regionPosition(region.id).group.toUpperCase()} {String(regionPosition(region.id).number).padStart(2, "0")}</span>{region.name}
            <span className="region-nav-arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
