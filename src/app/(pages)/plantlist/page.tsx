import { type SearchParams, filterPlants, parseFilters } from "./filter-plants";
import PageHeading from "@/src/components/page-heading";
import PlantListFilter from "./components/plant-list-filter";
import { buildFacets } from "./facets";
import { getAllPlants } from "./plants";

export default async function PlantList({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const plants = await getAllPlants();
  const facets = buildFacets(plants);
  const { show, ...filters } = parseFilters(await searchParams, facets);
  const { counts, results } = filterPlants(plants, filters, facets);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeading eyebrow="Catalogue" title="Plant list">
        Browse flowers, vegetables, fruit and herbs, with sun needs, hardiness and growing details at a glance.
      </PageHeading>
      {/* Only the visible page of results is sent to the client */}
      <PlantListFilter
        counts={counts}
        facets={facets}
        filters={filters}
        plants={results.slice(0, show)}
        show={show}
        total={results.length}
      />
    </div>
  );
}
