import { TransitionLink as Link } from "../navigation/TransitionLink";
import { RegionLandscape } from "./RegionLandscape";
import { REGION_PRESENTATION } from "./regionPresentation";
import { RegionAtmosphere } from "../effects/RegionAtmosphere";

export function RegionExplorer() {
  return (
    <section id="regions" className="explorer" aria-labelledby="regions-title">
      <div className="section-heading">
        <div><span className="eyebrow">REGIONS</span><h2 id="regions-title">Select a region<span>.</span></h2></div>
        <span className="region-count"><strong>05</strong><span>REGIONS TO EXPLORE</span></span>
      </div>
      <div className="region-grid">
        {REGION_PRESENTATION.map((region, index) => (
          <Link key={region.id} className={`region-card region-${region.id}`} href={`/regions/${region.id}`}>
            <div className="card-art" style={{ viewTransitionName: `region-art-${region.id}` }}>
              <RegionLandscape region={region.id} />
              <RegionAtmosphere region={region.id} />
              <span className="region-number">0{index + 1} <span>/ {region.climate}</span></span>
              <span className="art-spark spark-one" /><span className="art-spark spark-two" /><span className="art-spark spark-three" />
            </div>
            <div className="card-copy"><div><h3>{region.name}</h3></div><span className="card-arrow" aria-hidden="true">↗</span></div>
          </Link>
        ))}
        <div className="locked-card">
          <div className="locked-art" aria-hidden="true"><span className="mystery-symbol">?</span><span className="locked-lines" /></div>
          <div className="card-copy">
            <div><h3>Locked regions</h3></div>
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true"><path d="M5 8V5a4 4 0 0 1 8 0v3M3 8h12v10H3z" stroke="currentColor" strokeWidth="1.4" /></svg>
          </div>
          <span className="locked-caption">LATER REGIONS · LOCKED</span>
        </div>
      </div>
    </section>
  );
}
