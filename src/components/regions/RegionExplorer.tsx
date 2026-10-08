import { TransitionLink as Link } from "../navigation/TransitionLink";
import { RegionLandscape } from "./RegionLandscape";
import { REGION_PRESENTATION, REGION_GROUPS } from "./regionPresentation";
import { RegionAtmosphere } from "../effects/RegionAtmosphere";

export function RegionExplorer() {
  return (
    <section id="regions" className="explorer" aria-labelledby="regions-title">
      <div className="section-heading">
        <div><span className="eyebrow">REGIONS</span><h2 id="regions-title">Select a region<span>.</span></h2></div>
        <span className="region-count"><strong>{String(REGION_PRESENTATION.length).padStart(2, "0")}</strong><span>REGIONS TO EXPLORE</span></span>
      </div>
      {REGION_GROUPS.map(group => <section key={group.id} className={`region-group group-${group.id}`} aria-labelledby={`${group.id}-title`}>
        <div className="region-group-heading"><span className="orbital-divider" aria-hidden="true" /><h3 id={`${group.id}-title`}>{group.name}</h3><span className="eyebrow">{group.destinations.length} DESTINATIONS</span></div>
      <div className="region-grid">
        {group.destinations.map((name, index) => { const region = REGION_PRESENTATION.find(r => r.name === name); return region ? (
          <Link key={region.id} className={`region-card region-${region.id}`} href={`/regions/${region.id}`}>
            <div className="card-art" style={{ viewTransitionName: `region-art-${region.id}` }}>
              <RegionLandscape region={region.id} />
              <RegionAtmosphere region={region.id} />
              <span className="region-number">{String(index + 1).padStart(2, "0")} <span>/ {region.climate}</span></span>
              <span className="art-spark spark-one" /><span className="art-spark spark-two" /><span className="art-spark spark-three" />
            </div>
            <div className="card-copy"><div><h3>{region.name}</h3></div><span className="card-arrow" aria-hidden="true">↗</span></div>
          </Link>
        ) : <div className="locked-card" key={name} data-region-locked="true" aria-label={`${group.name} destination ${index + 1}: locked`}>
          <div className="locked-art" aria-hidden="true"><span className="region-number">{String(index + 1).padStart(2, "0")}</span><span className="mystery-symbol">?</span><span className="locked-lines" /></div>
          <div className="card-copy"><h3>Unknown region</h3><svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true"><path d="M5 8V5a4 4 0 0 1 8 0v3M3 8h12v10H3z" stroke="currentColor" strokeWidth="1.4" /></svg></div><span className="locked-caption">LOCKED</span>
        </div>; })}
      </div>
      </section>)}
    </section>
  );
}
