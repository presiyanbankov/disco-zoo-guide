import { TransitionLink as Link } from "../navigation/TransitionLink";
export function RescueHero() {
  return <section className="rescue-hero" id="rescue" aria-labelledby="page-title">
    <div className="rescue-hero-copy"><span className="eyebrow"><span className="status-dot" /> LIVE RESCUE TOOL</span><h1 id="page-title">Rescue<br /><span>assistant.</span></h1><p>Select participants. Report each result.</p><Link className="rescue-primary hero-start" href="/rescue">START RESCUE <span aria-hidden="true">&#8599;</span></Link><span className="eyebrow hero-footnote">5 &#215; 5 BOARD &#183; ANIMALS + OPTIONAL PET</span></div>
    <div className="rescue-hero-visual" aria-hidden="true"><span className="hero-orbit" /><div className="hero-demo-board">{Array.from({ length: 25 }, (_, i) => <span key={i} className={i === 12 ? "demo-recommended" : ""}>{i === 12 ? "+" : ""}</span>)}</div><span className="hero-demo-caption">NEXT CELL</span><i className="hero-mote mote-a" /><i className="hero-mote mote-b" /></div>
  </section>;
}
