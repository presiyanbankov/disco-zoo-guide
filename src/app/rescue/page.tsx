import type { Metadata } from "next";
import { ANIMALS } from "../../data/animals";
import { SiteHeader } from "../../components/layout/SiteHeader";
import { SiteFooter } from "../../components/layout/SiteFooter";
import { REGION_PRESENTATION } from "../../components/regions/regionPresentation";
import { RescueAssistant } from "../../components/rescue/RescueAssistant";
import { resolveRescueSetupContext } from "../../components/rescue/rescueSetupContext";
import { pageMetadata } from "../../components/seo/pageMetadata";

export const metadata: Metadata = pageMetadata("Disco Zoo Rescue Assistant – Best Tile to Reveal Next", "Choose the animals or pet present in your Disco Zoo rescue. Report empty tiles and identified hits to get the next recommended tile on the 5×5 board.", "/rescue");

export default async function RescuePage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> } = {}) {
  const query = await searchParams ?? {};
  const initialContext = resolveRescueSetupContext(query.region, query.animal);
  const animals = ANIMALS.filter(a => !a.hidden && REGION_PRESENTATION.some(r => r.id === a.regionId));
  return <div className="site-shell" data-route-page="/rescue">
    <a className="skip-link" href="#rescue-assistant">Skip to rescue assistant</a>
    <SiteHeader />
    <main id="rescue-assistant">
      <div className="rescue-intro"><span className="eyebrow">RESCUE TOOLS / 5 × 5</span><h1>Rescue assistant.</h1><p>Get the best tile to reveal next in your Disco Zoo rescue. Select participants guaranteed to be present, then report each result from the game.</p></div>
      {/* A new URL context gets fresh local state; edits do not synchronize back to the query. */}
      <RescueAssistant key={JSON.stringify([query.region ?? null, query.animal ?? null])} animals={animals} initialContext={initialContext} />
    </main>
    <SiteFooter />
  </div>;
}
