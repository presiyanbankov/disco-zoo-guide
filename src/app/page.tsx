import { RegionExplorer } from "../components/regions/RegionExplorer";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";

export default function Home() {
  return <div className="site-shell" data-route-page="/">
    <a className="skip-link" href="#regions">Skip to regions</a>
    <SiteHeader />
    <main>
      <section className="intro" aria-labelledby="page-title">
        <div className="eyebrow"><span className="status-dot"/> A LITTLE KNOWLEDGE. A BIGGER ZOO.</div>
        <h1 id="page-title">Your next great<br/><span>rescue starts here.</span></h1>
        <div className="intro-bottom"><p>A field guide for curious zookeepers.<br/>Explore the habitats. Get to know the wildlife.</p><span className="intro-coordinate">EST. 2014 <span>/</span> STILL EXPLORING</span></div>
      </section>
      <RegionExplorer/>
      <section className="rescue-teaser" aria-labelledby="rescue-title">
        <div className="teaser-grid" aria-hidden="true">{Array.from({length:25},(_,i)=><span key={i} className={i===12?"target":i===7||i===18?"marked":""}>{i===12?"+":""}</span>)}</div>
        <div><div className="eyebrow">LESS GUESSWORK. MORE WILDLIFE.</div><h2 id="rescue-title">Make every rescue count.</h2><p>An interactive rescue optimizer is on the horizon.</p></div><span className="coming-soon"><span className="status-dot"/> COMING SOON</span>
      </section>
    </main>
    <SiteFooter />
  </div>;
}

