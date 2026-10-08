import { RegionExplorer } from "../components/regions/RegionExplorer";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { RescueHero } from "../components/rescue/RescueHero";
import { TransitionLink as Link } from "../components/navigation/TransitionLink";
export default function Home() {
  return <div className="site-shell" data-route-page="/">
    <a className="skip-link" href="#rescue">Skip to rescue assistant</a><SiteHeader />
    <main><RescueHero /><RegionExplorer /><section className="pets-reference" aria-labelledby="pets-reference-title"><div><span className="eyebrow">8 SPECIES</span><h2 id="pets-reference-title">Pet patterns</h2><p>Species patterns. Cosmetic appearance does not affect search.</p></div><Link href="/pets" className="back-link">VIEW PATTERNS <span aria-hidden="true">&#8599;</span></Link></section></main><SiteFooter />
  </div>;
}
