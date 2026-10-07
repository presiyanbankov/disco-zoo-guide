import { TransitionLink as Link } from "../navigation/TransitionLink";
import { AnimalArtwork } from "./AnimalArtwork";
import type { AnimalGuidePresentation } from "./animalGuidePresentation";
import type { RegionPresentation } from "../regions/regionPresentation";
import { RegionAtmosphere } from "../effects/RegionAtmosphere";

export function AnimalGuideHero({ animal, region, index }: { animal: AnimalGuidePresentation; region: RegionPresentation; index: number }) {
  return (
    <section className="animal-guide-hero" aria-labelledby="page-title">
      <div className="animal-guide-intro">
        <Link className="back-link" href={`/regions/${region.id}#wildlife`}><span aria-hidden="true">←</span> Back to {region.name}</Link>
        <nav className="animal-breadcrumb" aria-label="Breadcrumb"><Link href="/#regions">Regions</Link><span aria-hidden="true">/</span><Link href={`/regions/${region.id}`}>{region.name}</Link><span aria-hidden="true">/</span><span aria-current="page">{animal.name}</span></nav>
        <div className="eyebrow">ANIMAL FIELD NOTES / 0{index + 1}</div>
        <h1 id="page-title">{animal.name}<span>.</span></h1>
        <div className={`animal-guide-taxonomy rarity-${animal.rarity}`}><span className="guide-rarity">{animal.rarity}</span><Link href={`/regions/${region.id}`}>{region.name} region <span aria-hidden="true">↗</span></Link></div>
        {animal.source === "development-preview" && <p className="animal-preview-note"><span className="preview-badge">ALPHA PREVIEW</span>Sample identity awaiting review. Pattern and strategy have not been supplied.</p>}
      </div>
      <div className="animal-guide-art">
        <RegionAtmosphere region={region.id} />
        <span className="guide-art-label">FIELD STUDY / 0{index + 1}</span>
        <div className="guide-art-lines" aria-hidden="true" />
        <AnimalArtwork id={animal.id} name={animal.name} imagePath={animal.imagePath} context="detail" transitionName={`animal-${animal.regionId}-${animal.id}`} />
        <span className="guide-art-ground" />
        <span className="guide-art-caption">{animal.imagePath ? `${region.name} / ${animal.name}` : "ORIGINAL PLACEHOLDER ILLUSTRATION"}</span>
      </div>
    </section>
  );
}
