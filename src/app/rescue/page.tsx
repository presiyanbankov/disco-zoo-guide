import type { Metadata } from "next";
import { ANIMALS } from "../../data/animals";
import { SiteHeader } from "../../components/layout/SiteHeader";
import { SiteFooter } from "../../components/layout/SiteFooter";
import { REGION_PRESENTATION } from "../../components/regions/regionPresentation";
import { RescueAssistant } from "../../components/rescue/RescueAssistant";
import { resolveRescueSetupContext } from "../../components/rescue/rescueSetupContext";

export const metadata: Metadata = {
  title: "Rescue assistant — Disco Zoo Field Guide",
  description: "An interactive 5×5 rescue guide for one to three guaranteed participants, including an optional pet.",
};

export default async function RescuePage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> } = {}) {
  const query = await searchParams ?? {};
  const initialContext = resolveRescueSetupContext(query.region, query.animal);
  const animals = ANIMALS.filter(a => !a.hidden && a.rarity !== "timeless" && REGION_PRESENTATION.some(r => r.id === a.regionId));
  return <div className="site-shell" data-route-page="/rescue">
    <a className="skip-link" href="#rescue-assistant">Skip to rescue assistant</a>
    <SiteHeader />
    <main id="rescue-assistant">
      <div className="rescue-intro"><span className="eyebrow">RESCUE TOOLS / 5 × 5</span><h1>Rescue assistant.</h1><p>Select participants guaranteed to be present. Report the cells you open in the game.</p></div>
      {/* A new URL context gets fresh local state; edits do not synchronize back to the query. */}
      <RescueAssistant key={JSON.stringify([query.region ?? null, query.animal ?? null])} animals={animals} initialContext={initialContext} />
    </main>
    <SiteFooter />
  </div>;
}
