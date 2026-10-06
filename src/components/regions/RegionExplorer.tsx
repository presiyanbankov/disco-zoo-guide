"use client";
import { useState } from "react";
import { RegionLandscape } from "./RegionLandscape";

// Presentation metadata only. Does not define canonical region or animal data.
const destinations = [
  {id:"farm",name:"Farm",mood:"Where it all begins",detail:"Pastures, picket fences, and familiar faces. Your first stop on a much bigger adventure.",climate:"PASTORAL"},
  {id:"outback",name:"Outback",mood:"A little further afield",detail:"Follow the red earth toward a sun-soaked horizon. There’s a whole new habitat to explore.",climate:"ARID"},
  {id:"savanna",name:"Savanna",mood:"Into the golden grass",detail:"Wide open skies and golden grasslands. Take a moment to look beyond the tall grass.",climate:"GRASSLAND"},
  {id:"northern",name:"Northern",mood:"Answer the call of the wild",detail:"Quiet forests beneath mountain peaks. Head north and discover a cooler side of the zoo.",climate:"BOREAL"},
  {id:"polar",name:"Polar",mood:"Beyond the snow line",detail:"Snow-covered shores and crisp, still air. The next adventure lies at the edge of the ice.",climate:"FROZEN"},
];
export function RegionExplorer(){
  const [selected,setSelected]=useState<string|null>(null);
  const destination=destinations.find(item=>item.id===selected);
  return <section id="regions" className="explorer" aria-labelledby="regions-title">
    <div className="section-heading"><div><span className="eyebrow">THE WORLD OF DISCO ZOO</span><h2 id="regions-title">Choose your next destination<span>.</span></h2></div><span className="region-count"><strong>05</strong><span>REGIONS TO EXPLORE</span></span></div>
    <div className="region-grid">
      {destinations.map((region,index)=><button key={region.id} className={`region-card region-${region.id}${selected===region.id?" is-selected":""}`} onClick={()=>setSelected(selected===region.id?null:region.id)} aria-expanded={selected===region.id} aria-controls="region-preview">
        <div className="card-art"><RegionLandscape region={region.id}/><span className="region-number">0{index+1} <span>/ {region.climate}</span></span><span className="art-spark spark-one"/><span className="art-spark spark-two"/><span className="art-spark spark-three"/></div>
        <div className="card-copy"><div><h3>{region.name}</h3><p>{region.mood}</p></div><span className="card-arrow" aria-hidden="true">↗</span></div>
      </button>)}
      <div className="locked-card"><div className="locked-art" aria-hidden="true"><span className="mystery-symbol">?</span><span className="locked-lines"/></div><div className="card-copy"><div><h3>Uncharted territory</h3><p>More discoveries await.</p></div><svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true"><path d="M5 8V5a4 4 0 0 1 8 0v3M3 8h12v10H3z" stroke="currentColor" strokeWidth="1.4"/></svg></div><span className="locked-caption">LATER REGIONS · LOCKED</span></div>
    </div>
    <div id="region-preview" aria-live="polite">{destination&&<div className={`region-preview region-${destination.id}`}><div><span className="eyebrow">DESTINATION SELECTED</span><h3>{destination.name}</h3><p>{destination.detail}</p></div><span className="preview-note">Animal field guides arrive in the next alpha update.</span><button className="close-preview" onClick={()=>setSelected(null)} aria-label="Close region preview">×</button></div>}</div>
    <p className="explorer-note"><span aria-hidden="true">✦</span> Five familiar habitats. A world of discoveries ahead.</p>
  </section>;
}
