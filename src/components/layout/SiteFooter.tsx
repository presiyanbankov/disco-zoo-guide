export function SiteFooter({ backTo = "#page-title" }: { backTo?: string }) {
  return (
    <footer className="site-footer">
      <span className="footer-brand">Disco Zoo / unofficial guide</span>
      <p>
        Unofficial fan-made guide. Disco Zoo is created by Milkbag Games and published by NimbleBit.<br />
        Not affiliated with or endorsed by Milkbag Games or NimbleBit.
      </p>
      <a href={backTo}>Back to top ↑</a>
    </footer>
  );
}
