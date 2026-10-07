import { RegionExplorer } from "../components/regions/RegionExplorer";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { REGION_PRESENTATION } from "../components/regions/regionPresentation";
import { ANIMALS } from "../data/animals";
import { TransitionLink as Link } from "../components/navigation/TransitionLink";

export default function Home() {
  return <div className="site-shell" data-route-page="/">
    <a className="skip-link" href="#regions">Skip to regions</a>
    <SiteHeader />
    <main>
      <section className="intro" aria-labelledby="page-title">
        <div className="eyebrow"><span className="status-dot"/> UNOFFICIAL COMPANION</div>
        <h1 id="page-title">Disco Zoo<br/><span>guide.</span></h1>
        <div className="intro-bottom"><p>Animal patterns and complete search sequences.</p><span className="intro-coordinate">{String(REGION_PRESENTATION.length).padStart(2, "0")} REGIONS <span>/</span> {ANIMALS.filter(animal => !animal.hidden && animal.rarity !== "timeless" && REGION_PRESENTATION.some(region => region.id === animal.regionId)).length} ANIMALS</span></div>
      </section>
      <RegionExplorer/>
      <section className="rescue-teaser" aria-labelledby="rescue-title">
        <div className="teaser-grid" aria-hidden="true">{Array.from({length:25},(_,i)=><span key={i} className={i===12?"target":i===7||i===18?"marked":""}>{i===12?"+":""}</span>)}</div>
        <div><div className="eyebrow">RESCUE TOOLS</div><h2 id="rescue-title">Rescue assistant</h2><p>Select 1–3 animals. Report each result.</p></div><Link href="/rescue" className="coming-soon">OPEN ASSISTANT <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
    <SiteFooter />
  </div>;
}

