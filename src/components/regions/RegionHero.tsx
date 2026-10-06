import { TransitionLink as Link } from "../navigation/TransitionLink";
import { RegionLandscape } from "./RegionLandscape";
import type { RegionPresentation } from "./regionPresentation";
import { RegionAtmosphere } from "../effects/RegionAtmosphere";

export function RegionHero({ region, index }: { region: RegionPresentation; index: number }) {
  return (
    <section className="region-hero" aria-labelledby="page-title">
      <div className="region-hero-copy">
        <Link className="back-link" href="/#regions"><span aria-hidden="true">←</span> All regions</Link>
        <div className="eyebrow hero-eyebrow">FIELD NOTES / REGION 0{index + 1}</div>
        <h1 id="page-title">{region.name}<span>.</span></h1>
        <p className="hero-mood">{region.mood}</p>
        <p className="hero-description">{region.description}</p>
        <div className="hero-meta">
          <span><span className="status-dot" /> AVAILABLE TO EXPLORE</span>
          <span>{region.climate}</span>
        </div>
      </div>
      <div className="region-hero-art" style={{ viewTransitionName: `region-art-${region.id}` }}>
        <RegionLandscape region={region.id} />
        <RegionAtmosphere region={region.id} />
        <span className="hero-art-label">0{index + 1} / {region.climate}</span>
        <span className="art-spark spark-one" /><span className="art-spark spark-two" />
        <span className="art-spark spark-three" />
        <span className="hero-art-caption">LANDSCAPE STUDY · ALPHA ARTWORK</span>
      </div>
    </section>
  );
}
