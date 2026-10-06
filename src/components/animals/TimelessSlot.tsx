export function TimelessSlot() {
  return (
    <aside className="timeless-slot" aria-labelledby="timeless-title">
      <div className="timeless-symbol" aria-hidden="true">?<span /><span /><span /></div>
      <div className="timeless-copy">
        <span className="eyebrow">THE SEVENTH DISCOVERY</span>
        <h3 id="timeless-title">Timeless<span className="unknown-tag">UNKNOWN</span></h3>
        <p>Some stories are still waiting to be discovered.</p>
      </div>
      <span className="timeless-seal" aria-hidden="true">07 / ?</span>
    </aside>
  );
}
