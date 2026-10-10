import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimalCollection } from "../../../components/animals/AnimalCollection";
import { getRegionAnimalPresentations } from "../../../components/animals/animalGuidePresentation";
import { SiteFooter } from "../../../components/layout/SiteFooter";
import { SiteHeader } from "../../../components/layout/SiteHeader";
import { RegionHero } from "../../../components/regions/RegionHero";
import { RegionNavigation } from "../../../components/regions/RegionNavigation";
import { RegionSearch } from "../../../components/regions/RegionSearch";
import { getRegionPresentation, REGION_PRESENTATION } from "../../../components/regions/regionPresentation";
import { ProgressGuard } from "../../../components/progress/ProgressGuard";
import { pageMetadata } from "../../../components/seo/pageMetadata";
import { BreadcrumbJsonLd } from "../../../components/seo/BreadcrumbJsonLd";

type Props = { params: Promise<{ regionId: string }> };

export function generateStaticParams() {
  return REGION_PRESENTATION.map((region) => ({ regionId: region.id }));
}

// Only explicitly supported regions get public-facing pages.
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { regionId } = await params;
  const region = getRegionPresentation(regionId);
  if (!region) return { title: "Page not found – Disco Zoo Guide", robots: { index: false } };
  return pageMetadata(`${region.name} Animals & Patterns – Disco Zoo Guide`, `Find the ${region.name} animals in Disco Zoo, their rarities, exact rescue patterns and region search sequence. Open a rescue with ${region.name} selected.`, `/regions/${region.id}`);
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
        <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: region.name, path: `/regions/${region.id}` }]} />
        <RegionHero region={region} index={REGION_PRESENTATION.indexOf(region)} animals={animals} />
        <RegionSearch regionName={region.name} animals={animals} />
        <AnimalCollection animals={animals} />
        <RegionNavigation currentId={region.id} />
        </ProgressGuard>
      </main>
      <SiteFooter />
    </div>
  );
}
