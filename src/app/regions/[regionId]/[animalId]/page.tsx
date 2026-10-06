import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimalGuideGrids } from "../../../../components/animals/AnimalGuideGrids";
import { AnimalGuideHero } from "../../../../components/animals/AnimalGuideHero";
import { AnimalGuideNavigation } from "../../../../components/animals/AnimalGuideNavigation";
import { getAnimalGuidePresentation } from "../../../../components/animals/animalGuidePresentation";
import { getPreviewAnimals } from "../../../../components/animals/DEV_MOCK_ANIMALS";
import { SiteFooter } from "../../../../components/layout/SiteFooter";
import { SiteHeader } from "../../../../components/layout/SiteHeader";
import { getRegionPresentation, REGION_PRESENTATION } from "../../../../components/regions/regionPresentation";

type Props = { params: Promise<{ regionId: string; animalId: string }> };

export function generateStaticParams() {
  return REGION_PRESENTATION.flatMap((region) => getPreviewAnimals(region.id).map((animal) => ({ regionId: region.id, animalId: animal.id })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { regionId, animalId } = await params;
  const animal = getAnimalGuidePresentation(regionId, animalId);
  const region = getRegionPresentation(regionId);
  if (!animal || !region) return { title: "Uncharted territory — Disco Zoo Field Guide" };
  return { title: `${animal.name} · ${region.name} — Disco Zoo Field Guide`, description: `${animal.name} field notes from the ${region.name} region. Pattern and search-order presentation in an unofficial Disco Zoo guide.` };
}

export default async function AnimalPage({ params }: Props) {
  const { regionId, animalId } = await params;
  const region = getRegionPresentation(regionId);
  const animal = getAnimalGuidePresentation(regionId, animalId);
  if (!region || !animal) notFound();
  const animals = getPreviewAnimals(region.id);

  return (
    <div className={`site-shell region-page animal-page region-${region.id}`} data-route-page={`/regions/${region.id}/${animal.id}`}>
      <a className="skip-link" href="#rescue-guide">Skip to rescue guide</a>
      <SiteHeader />
      <main>
        <AnimalGuideHero animal={animal} region={region} index={animals.findIndex((record) => record.id === animal.id)} />
        <AnimalGuideGrids key={animal.id} animalId={animal.id} animalName={animal.name} pattern={animal.pattern} strategy={animal.strategy} />
        <AnimalGuideNavigation animals={animals} currentId={animal.id} regionName={region.name} />
      </main>
      <SiteFooter />
    </div>
  );
}
