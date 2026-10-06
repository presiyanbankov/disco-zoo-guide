export function SiteFooter({ backTo = "#page-title" }: { backTo?: string }) {
  return (
    <footer className="site-footer">
      <span className="footer-brand">Made for the love of the zoo.</span>
      <p>
        Unofficial fan-made guide. Disco Zoo is created by NimbleBit.<br />
        Not affiliated with or endorsed by NimbleBit.
      </p>
      <a href={backTo}>Back to top ↑</a>
    </footer>
  );
}
