export default function LoadingRegion() {
  return (
    <div className="site-shell region-loading" role="status" aria-live="polite">
      <span className="eyebrow"><span className="status-dot" /> OPENING FIELD NOTES</span>
      <div className="loading-landscape" />
      <p>Discovering your next destination…</p>
    </div>
  );
}
