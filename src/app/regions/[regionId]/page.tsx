import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimalCollection } from "../../../components/animals/AnimalCollection";
import { getPreviewAnimals } from "../../../components/animals/DEV_MOCK_ANIMALS";
import { SiteFooter } from "../../../components/layout/SiteFooter";
import { SiteHeader } from "../../../components/layout/SiteHeader";
import { RegionHero } from "../../../components/regions/RegionHero";
import { RegionNavigation } from "../../../components/regions/RegionNavigation";
import { getRegionPresentation, REGION_PRESENTATION } from "../../../components/regions/regionPresentation";

type Props = { params: Promise<{ regionId: string }> };

export function generateStaticParams() {
  return REGION_PRESENTATION.map((region) => ({ regionId: region.id }));
}

// Only the five explicitly available regions get public-facing pages.
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { regionId } = await params;
  const region = getRegionPresentation(regionId);
  if (!region) return { title: "Uncharted territory — Disco Zoo Field Guide" };
  return {
    title: `${region.name} — Disco Zoo Field Guide`,
    description: `${region.mood}. Explore the ${region.name} animal collection in this unofficial Disco Zoo guide.`,
  };
}

export default async function RegionPage({ params }: Props) {
  const { regionId } = await params;
  const region = getRegionPresentation(regionId);
  if (!region) notFound();

  return (
    <div className={`site-shell region-page region-${region.id}`} data-route-page={`/regions/${region.id}`}>
      <a className="skip-link" href="#wildlife">Skip to animals</a>
      <SiteHeader />
      <main>
        <RegionHero region={region} index={REGION_PRESENTATION.indexOf(region)} />
        <AnimalCollection animals={getPreviewAnimals(region.id)} />
        <div className="region-field-note"><span aria-hidden="true">✦</span><p>{region.fieldNote}</p></div>
        <RegionNavigation currentId={region.id} />
      </main>
      <SiteFooter />
    </div>
  );
}
