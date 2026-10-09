import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimalCollection } from "../../../components/animals/AnimalCollection";
import { getRegionAnimalPresentations } from "../../../components/animals/animalGuidePresentation";
import { SiteFooter } from "../../../components/layout/SiteFooter";
import { SiteHeader } from "../../../components/layout/SiteHeader";
import { RegionHero } from "../../../components/regions/RegionHero";
import { RegionNavigation } from "../../../components/regions/RegionNavigation";
import { RegionSearch } from "../../../components/regions/RegionSearch";
import { getRegionSearchPresentation } from "../../../components/regions/regionSearchPresentation";
import { getRegionPresentation, REGION_PRESENTATION } from "../../../components/regions/regionPresentation";
import { ProgressGuard } from "../../../components/progress/ProgressGuard";

type Props = { params: Promise<{ regionId: string }> };

export function generateStaticParams() {
  return REGION_PRESENTATION.map((region) => ({ regionId: region.id }));
}

// Only explicitly supported regions get public-facing pages.
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { regionId } = await params;
  const region = getRegionPresentation(regionId);
  if (!region) return { title: "Uncharted territory — Disco Zoo Field Guide" };
  return {
    title: "Region guide — Disco Zoo Field Guide",
    description: "Animal patterns and rescue search sequences with spoiler visibility settings.",
  };
}

export default async function RegionPage({ params }: Props) {
  const { regionId } = await params;
  const region = getRegionPresentation(regionId);
  if (!region) notFound();
  const animals = getRegionAnimalPresentations(region.id);

  return (
    <div className={`site-shell region-page region-${region.id}`} data-route-page={`/regions/${region.id}`}>
      <a className="skip-link" href="#wildlife">Skip to animals</a>
      <SiteHeader regionId={region.id} />
      <main>
        <ProgressGuard regionId={region.id}>
        <RegionHero region={region} index={REGION_PRESENTATION.indexOf(region)} animals={animals} />
        <RegionSearch regionName={region.name} strategy={getRegionSearchPresentation(animals)} />
        <AnimalCollection animals={animals} />
        <RegionNavigation currentId={region.id} />
        </ProgressGuard>
      </main>
      <SiteFooter />
    </div>
  );
}
