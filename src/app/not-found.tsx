import { TransitionLink as Link } from "../components/navigation/TransitionLink";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";

export default function NotFound() {
  return (
    <div className="site-shell" data-route-page="not-found">
      <SiteHeader />
      <main className="uncharted-page">
        <span className="eyebrow">OUTSIDE THE FIELD GUIDE / 404</span>
        <h1 id="page-title">Uncharted<br /><span>territory.</span></h1>
        <p>This part of the map isn’t available in the guide yet.</p>
        <Link className="back-link" href="/#regions"><span aria-hidden="true">←</span> Back to available regions</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
