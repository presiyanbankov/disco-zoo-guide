export default function LoadingAnimal() {
  return (
    <div className="site-shell animal-loading" role="status">
      <span className="eyebrow"><span className="status-dot" /> OPENING ANIMAL FIELD NOTES</span>
      <div className="animal-loading-boards" aria-hidden="true"><span /><span /></div>
      <p>Getting your rescue guide ready…</p>
    </div>
  );
}
