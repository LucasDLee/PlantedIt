import { buildFacets, extractFacets, zoneRank } from "./facets";
import type { Flower } from "./components/plant-card";
import PageHeading from "@/src/components/page-heading";
import PlantListFilter from "./components/plant-list-filter";
import { getAllFlowers } from "@/src/services/flowers.service";

export default async function PlantList() {
  const rows = await getAllFlowers();

  // Only send the fields the cards and filters use to the client
  const flowers: Flower[] = rows.map((row) => ({
    facets: extractFacets(row),
    flower_color: row.flower_color,
    flower_group: row.flower_group,
    flower_name: row.flower_name,
    hardiness_rank: row.minimum_cold_hardiness ? zoneRank(row.minimum_cold_hardiness) : null,
    life_cycle: row.life_cycle,
    minimum_cold_hardiness: row.minimum_cold_hardiness,
    plant_height: row.plant_height,
    sun_requirements: row.sun_requirements,
    url: row.url,
    uuid: row.uuid
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeading eyebrow="Catalogue" title="Plant list">
        Browse flowers and ornamentals, with sun needs, life cycle and cold hardiness at a glance.
      </PageHeading>
      <PlantListFilter facets={buildFacets(flowers)} flowers={flowers} />
    </div>
  );
}
