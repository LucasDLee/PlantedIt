import { SHOWN, estimateFrost, formatDay, parsePreferences, recommendPlants } from "./recommend-plants";
import PageHeading from "@/src/components/page-heading";
import RecommendationList from "./components/recommendation-list";
import type { SearchParams } from "../plantlist/filter-plants";
import { getAllPlants } from "../plantlist/plants";
import { removeInvasive } from "./invasive";

export default async function Recommendations({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const prefs = parsePreferences(await searchParams);
  const { check, results } = removeInvasive(recommendPlants(await getAllPlants(), prefs), prefs.region);

  const frost = prefs.zone ? estimateFrost(prefs.zone) : null;
  const frostNote = !prefs.zone
    ? null
    : frost
      ? `Estimated frosts: last ~${formatDay(frost.last, prefs.south)}, first ~${formatDay(frost.first, prefs.south)}`
      : "This zone is usually frost-free";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeading eyebrow="For your garden" title="Recommended plants">
        Plants that suit your hardiness zone, sun and space, with what&apos;s in season to plant right now first.
      </PageHeading>
      {/* Only the top picks are sent to the client */}
      <RecommendationList
        frost={frostNote}
        invasive={check}
        prefs={prefs}
        recommendations={results.slice(0, SHOWN)}
        total={results.length}
      />
    </div>
  );
}
