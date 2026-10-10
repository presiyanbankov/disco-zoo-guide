import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimalGuideGrids } from "../../../../components/animals/AnimalGuideGrids";
import { AnimalGuideHero } from "../../../../components/animals/AnimalGuideHero";
import { AnimalGuideNavigation } from "../../../../components/animals/AnimalGuideNavigation";
import { getAnimalGuidePresentation, getRegionAnimalPresentations } from "../../../../components/animals/animalGuidePresentation";
import { SiteFooter } from "../../../../components/layout/SiteFooter";
import { SiteHeader } from "../../../../components/layout/SiteHeader";
import { getRegionPresentation, REGION_PRESENTATION } from "../../../../components/regions/regionPresentation";
import { ProgressGuard } from "../../../../components/progress/ProgressGuard";
import { pageMetadata } from "../../../../components/seo/pageMetadata";
import { BreadcrumbJsonLd } from "../../../../components/seo/BreadcrumbJsonLd";

type Props = { params: Promise<{ regionId: string; animalId: string }> };

export function generateStaticParams() {
  return REGION_PRESENTATION.flatMap((region) => getRegionAnimalPresentations(region.id).map((animal) => ({ regionId: region.id, animalId: animal.id })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { regionId, animalId } = await params;
  const animal = getRegionAnimalPresentations(regionId).find((record) => record.id === animalId);
  const region = getRegionPresentation(regionId);
  if (!animal || !region) return { title: "Page not found – Disco Zoo Guide", robots: { index: false } };
  return pageMetadata(`${animal.name}${animal.rarity === "timeless" ? " Timeless" : ""} Pattern – Disco Zoo Guide`, `Find the exact ${animal.name} rescue pattern in Disco Zoo. See its ${animal.rarity} rarity, ${region.name} region and search order, or open it in the Rescue Assistant.`, `/regions/${region.id}/${animal.id}`);
}

export default async function AnimalPage({ params }: Props) {
  const { regionId, animalId } = await params;
  const region = getRegionPresentation(regionId);
  const animal = getAnimalGuidePresentation(regionId, animalId);
  if (!region || !animal) notFound();
  const animals = getRegionAnimalPresentations(region.id);

  return (
    <div className={`site-shell region-page animal-page region-${region.id}`} data-route-page={`/regions/${region.id}/${animal.id}`}>
      <a className="skip-link" href="#rescue-guide">Skip to rescue guide</a>
      <SiteHeader regionId={region.id} animalId={animal.id} />
      <main>
        <ProgressGuard regionId={region.id} rarity={animal.rarity}>
        <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: region.name, path: `/regions/${region.id}` }, { name: animal.name, path: `/regions/${region.id}/${animal.id}` }]} />
        <AnimalGuideHero animal={animal} region={region} index={animals.findIndex((record) => record.id === animal.id)} />
        <AnimalGuideGrids key={animal.id} animalId={animal.id} animalName={animal.name} pattern={animal.pattern} strategy={animal.strategy} strategyUnavailableReason={animal.strategyUnavailableReason} strategyError={animal.strategyError} />
        <AnimalGuideNavigation animals={animals} currentId={animal.id} regionName={region.name} />
        </ProgressGuard>
      </main>
      <SiteFooter />
    </div>
  );
}
