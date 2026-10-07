import { TransitionLink as Link } from "../navigation/TransitionLink";
import { SoundToggle } from "../audio/SoundToggle";
import { SITE_VERSION } from "./siteVersion";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Disco Zoo Guide home">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
        <span>disco zoo<span className="brand-sub">FIELD GUIDE</span></span>
      </Link>
      <Link href="/#regions" className="header-link">
        Explore regions <span aria-hidden="true">↗</span>
      </Link>
      <SoundToggle />
      <Link href="/rescue" className="rescue-header-link">Rescue assistant</Link>
      <span className="alpha-tag">{SITE_VERSION}</span>
    </header>
  );
}
