import { PET_SPECIES } from "../../data/pets";
import { PetArtwork } from "../../components/pets/PetArtwork";
import { SiteHeader } from "../../components/layout/SiteHeader";
import { SiteFooter } from "../../components/layout/SiteFooter";
import { TransitionLink as Link } from "../../components/navigation/TransitionLink";
export default function PetsPage() {
  return <div className="site-shell" data-route-page="/pets"><SiteHeader /><main className="pets-page"><Link href="/" className="back-link">&#8592; Field guide</Link><span className="eyebrow">8 SPECIES / RESCUE PATTERNS</span><h1>Pet patterns<span>.</span></h1><p>Cosmetic appearance does not affect the rescue pattern. Search uses the species pattern.</p><div className="pets-grid">{PET_SPECIES.map(pet => {
    const rows = Math.max(...pet.pattern.cells.map(c => c.row)) + 1;
    const cols = Math.max(...pet.pattern.cells.map(c => c.col)) + 1;
    const occupied = new Set(pet.pattern.cells.map(c => `${c.row}:${c.col}`));
    return <article key={pet.id} className="pet-reference-card" data-pet-species={pet.id}><div className="pet-reference-heading"><PetArtwork name={pet.name} imagePath={pet.imagePath} /><h2>{pet.name}</h2></div><div className="pet-pattern" role="img" aria-label={`${pet.name} pattern: ${pet.pattern.cells.map(c => `row ${c.row + 1} column ${c.col + 1}`).join(", ")}`} style={{ gridTemplateColumns: `repeat(${cols}, var(--pet-pattern-cell))` }}>{Array.from({ length: rows * cols }, (_, i) => <span key={i} data-pattern-occupied={occupied.has(`${Math.floor(i / cols)}:${i % cols}`)} />)}</div><span className="eyebrow">5 TILES</span></article>;
  })}</div></main><SiteFooter /></div>;
}
