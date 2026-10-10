import assert from "node:assert/strict";
import test from "node:test";
import { configuredSiteOrigin, pageMetadata, SITE_URL } from "./pageMetadata";
import robots from "../../app/robots";
import { generateMetadata as regionMetadata } from "../../app/regions/[regionId]/page";
import { generateMetadata as animalMetadata } from "../../app/regions/[regionId]/[animalId]/page";
import sitemap, { publicPagePaths } from "../../app/sitemap";
import { ANIMALS } from "../../data/animals";
import { REGION_PRESENTATION } from "../regions/regionPresentation";
import { breadcrumbData } from "./BreadcrumbJsonLd";

test("canonical origin must be an explicit HTTPS origin", () => {
  assert.equal(configuredSiteOrigin("") , undefined);
  assert.equal(configuredSiteOrigin("https://guide.example")?.href, "https://guide.example/");
  for (const value of ["http://guide.example", "https://guide.example/path", "https://guide.example?q=x", "https://user:pass@guide.example"]) {
    assert.throws(() => configuredSiteOrigin(value));
  }
});

test("public metadata has distinct titles, descriptions and matching social text", () => {
  const pages = [
    pageMetadata("Disco Zoo Guide & Rescue Assistant", "Rescue patterns and tools.", "/"),
    pageMetadata("Disco Zoo Rescue Assistant – Best Tile to Reveal Next", "Report results to choose your next tile.", "/rescue"),
    pageMetadata("Disco Zoo Pet Patterns", "Pet species rescue patterns.", "/pets"),
  ];
  assert.equal(new Set(pages.map(p => p.title)).size, pages.length);
  for (const page of pages) {
    assert.equal(page.openGraph?.title, page.title);
    assert.equal(page.twitter?.description, page.description);
    assert.doesNotMatch(String(page.description), /coming soon|placeholder/i);
  }
});

test("Rescue canonical defaults to confirmed production origin and supports domain migration", () => {
  const previous = process.env.SITE_URL;
  try {
    process.env.SITE_URL = "https://guide.example";
    const page = pageMetadata("Rescue", "Rescue tool", "/rescue");
    assert.equal(page.alternates?.canonical, "https://guide.example/rescue");
    assert.equal(page.openGraph && "url" in page.openGraph ? page.openGraph.url : undefined, "https://guide.example/rescue");
    delete process.env.SITE_URL;
    const production = pageMetadata("Rescue", "Rescue tool", "/rescue");
    assert.equal(production.alternates?.canonical, `${SITE_URL}/rescue`);
    assert.equal(production.twitter && "images" in production.twitter && Array.isArray(production.twitter.images) ? production.twitter.images[0] : undefined, `${SITE_URL}/opengraph-image`);
  } finally {
    if (previous === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previous;
  }
});

test("robots allows public pages and assets, excluding only research experiments", () => {
  const result = robots();
  assert.deepEqual(result.rules, { userAgent: "*", allow: "/", disallow: "/game/experiments/" });
  assert.equal(result.sitemap, `${configuredSiteOrigin()?.origin}/sitemap.xml`);
});

test("public guide metadata uses canonical region and Timeless names", async () => {
  const region = await regionMetadata({ params: Promise.resolve({ regionId: "constellation" }) });
  const animal = await animalMetadata({ params: Promise.resolve({ regionId: "farm", animalId: "chicken" }) });
  assert.equal(region.title, "Constellation Animals & Patterns – Disco Zoo Guide");
  assert.equal(animal.title, "Chicken Timeless Pattern – Disco Zoo Guide");
  assert.match(String(animal.description), /timeless rarity, Farm region/);
});

test("unknown guide records cannot produce indexable invented metadata", async () => {
  const result = await animalMetadata({ params: Promise.resolve({ regionId: "farm", animalId: "unknown" }) });
  assert.deepEqual(result.robots, { index: false });
});

test("sitemap derives exactly the actual public routes with no query duplicates", () => {
  const paths = publicPagePaths();
  const expected = ["/", "/rescue", "/pets", ...REGION_PRESENTATION.flatMap(r => [
    `/regions/${r.id}`, ...ANIMALS.filter(a => a.regionId === r.id && !a.hidden).map(a => `/regions/${r.id}/${a.id}`),
  ])];
  assert.deepEqual(paths, expected);
  assert.equal(new Set(paths).size, paths.length);
  assert.ok(paths.every(path => !path.includes("?") && !path.includes("experiments")));
  const previous = process.env.SITE_URL;
  try {
    process.env.SITE_URL = "https://guide.example";
    assert.deepEqual(sitemap().map(e => e.url), paths.map(p => new URL(p, process.env.SITE_URL).href));
    assert.equal(robots().sitemap, "https://guide.example/sitemap.xml");
  } finally { if (previous === undefined) delete process.env.SITE_URL; else process.env.SITE_URL = previous; }
});

test("every real guide title is unique and BreadcrumbList uses route hierarchy", async () => {
  const titles: string[] = [];
  for (const region of REGION_PRESENTATION) {
    titles.push(String((await regionMetadata({ params: Promise.resolve({ regionId: region.id }) })).title));
    for (const animal of ANIMALS.filter(a => a.regionId === region.id && !a.hidden)) {
      titles.push(String((await animalMetadata({ params: Promise.resolve({ regionId: region.id, animalId: animal.id }) })).title));
    }
  }
  assert.equal(new Set(titles).size, titles.length);
  const data = breadcrumbData([{ name: "Home", path: "/" }, { name: "Farm", path: "/regions/farm" }, { name: "Chicken", path: "/regions/farm/chicken" }], new URL("https://guide.example"));
  assert.equal(data["@type"], "BreadcrumbList");
  assert.deepEqual(data.itemListElement.map(i => [i.position, i.name]), [[1,"Home"],[2,"Farm"],[3,"Chicken"]]);
  assert.equal(data.itemListElement[2].item,"https://guide.example/regions/farm/chicken");
});

