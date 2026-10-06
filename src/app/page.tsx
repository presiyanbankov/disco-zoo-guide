import { RegionExplorer } from "../components/regions/RegionExplorer";
import Link from "next/link";

export default function Home() {
  return <div className="site-shell">
    <a className="skip-link" href="#regions">Skip to regions</a>
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Disco Zoo Guide home"><span className="brand-mark" aria-hidden="true"><i/><i/><i/><i/></span><span>disco zoo<span className="brand-sub">FIELD GUIDE</span></span></Link>
      <a href="#regions" className="header-link">Explore regions <span aria-hidden="true">↗</span></a><span className="alpha-tag">ALPHA 01</span>
    </header>
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
    <footer className="site-footer"><span className="footer-brand">Made for the love of the zoo.</span><p>Unofficial fan-made guide. Disco Zoo is created by NimbleBit.<br/>Not affiliated with or endorsed by NimbleBit.</p><a href="#page-title">Back to top ↑</a></footer>
  </div>;
}

