"use client";
import { useProgress } from "../progress/ProgressProvider";
import { canViewAnimal } from "../progress/spoilerPreferences";
import type { AnimalCardPreview } from "../animals/DEV_MOCK_ANIMALS";
import { regionPosition } from "./regionPresentation";
import { TransitionLink as Link } from "../navigation/TransitionLink";
import { RegionLandscape } from "./RegionLandscape";
import type { RegionPresentation } from "./regionPresentation";
import { RegionAtmosphere } from "../effects/RegionAtmosphere";

export function RegionHero({ region, animals: records }: { region: RegionPresentation; index: number; animals: readonly AnimalCardPreview[] }) {
  const { preferences } = useProgress();
  const animals = records.filter(a => canViewAnimal(a, preferences));
  return (
    <section className="region-hero" aria-labelledby="page-title">
      <div className="region-hero-copy">
        <Link className="back-link" href="/#regions"><span aria-hidden="true">←</span> All regions</Link>
        <div className="eyebrow hero-eyebrow">{regionPosition(region.id).group.toUpperCase()} {String(regionPosition(region.id).number).padStart(2, "0")}</div>
        <h1 id="page-title">{region.name}<span>.</span></h1>
        <p className="hero-animal-count">{animals.length} ANIMALS</p>
        <p className="hero-roster-summary">{["common", "rare", "mythical", ...(animals.some(a => a.rarity === "timeless") ? ["timeless"] : [])].map((rarity) => `${animals.filter((animal) => animal.rarity === rarity).length} ${rarity.toUpperCase()}`).join(" \u00b7 ")}</p>
        <div className="hero-meta">
          <span><span className="status-dot" /> GUIDE AVAILABLE</span>
          <span>{region.climate}</span>
        </div>
      </div>
      <div className="region-hero-art" style={{ viewTransitionName: `region-art-${region.id}` }}>
        <RegionLandscape region={region.id} />
        <RegionAtmosphere region={region.id} />
        <span className="hero-art-label">{String(regionPosition(region.id).number).padStart(2, "0")} / {region.climate}</span>
        <span className="art-spark spark-one" /><span className="art-spark spark-two" />
        <span className="art-spark spark-three" />
      </div>
    </section>
  );
}
