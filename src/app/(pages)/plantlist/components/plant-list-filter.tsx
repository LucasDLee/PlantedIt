'use client';

import { type Facet, type FacetKey, formatOption, matchesZone } from "../facets";
import PlantCard, { type Flower } from "./plant-card";
import PlantFilterPanel, { type Selection } from "./plant-filter-panel";
import { useMemo, useState } from "react";

const PAGE_SIZE = 48;

// Values within a facet are OR'd, facets are AND'd. `skip` ignores one facet,
// which gives each facet's option counts as if that facet were unfiltered.
function matchesSelection(flower: Flower, selected: Selection, skip?: FacetKey): boolean {
  return (Object.entries(selected) as [FacetKey, string[]][]).every(([key, values]) =>
    key === skip ||
    values.length === 0 ||
    values.some((value) => flower.facets[key]?.includes(value))
  );
}

export default function PlantListFilter({ facets, flowers }: { facets: Facet[]; flowers: Flower[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Selection>({});
  const [hardiness, setHardiness] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Search and hardiness narrow the pool every facet counts from
  const base = useMemo(() => {
    const q = query.trim().toLowerCase();
    return flowers.filter((flower) =>
      (!q ||
        flower.flower_name.toLowerCase().includes(q) ||
        (flower.flower_group ?? "").toLowerCase().includes(q)) &&
      (!hardiness || matchesZone(flower.hardiness_zone, hardiness))
    );
  }, [flowers, query, hardiness]);

  const filtered = useMemo(
    () => base.filter((flower) => matchesSelection(flower, selected)),
    [base, selected]
  );

  const counts = useMemo(() => {
    const result = new Map<FacetKey, Map<string, number>>();
    for (const facet of facets) {
      const tally = new Map<string, number>();
      for (const flower of base) {
        if (!matchesSelection(flower, selected, facet.key)) continue;
        for (const value of flower.facets[facet.key] ?? []) {
          tally.set(value, (tally.get(value) ?? 0) + 1);
        }
      }
      result.set(facet.key, tally);
    }
    return result;
  }, [base, facets, selected]);

  const active = (Object.entries(selected) as [FacetKey, string[]][])
    .flatMap(([key, values]) => values.map((value) => ({ key, value })));
  const activeCount = active.length + (hardiness ? 1 : 0);

  const toggle = (key: FacetKey, value: string) => {
    setSelected((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
    setVisible(PAGE_SIZE);
  };

  const changeHardiness = (zone: string) => {
    setHardiness(zone);
    setVisible(PAGE_SIZE);
  };

  const clearAll = () => {
    setSelected({});
    setHardiness("");
    setVisible(PAGE_SIZE);
  };

  return (
    <div className="mt-8 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
      <aside className={`${showFilters ? "block" : "hidden"} mb-6 lg:mb-0 lg:block`} aria-label="Filters">
        <PlantFilterPanel
          counts={counts}
          facets={facets}
          hardiness={hardiness}
          onHardinessChange={changeHardiness}
          onToggle={toggle}
          selected={selected}
        />
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 sm:max-w-sm sm:flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Search by name or group…"
              aria-label="Search plants"
              className="w-full rounded-md border-2 border-transparent bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className="shrink-0 rounded-md bg-surface px-4 py-2.5 text-sm font-semibold text-primary-strong hover:bg-tint lg:hidden"
            >
              Filters{activeCount > 0 && ` (${activeCount})`}
            </button>
          </div>
          <p className="text-sm text-muted">
            {filtered.length.toLocaleString()} {filtered.length === 1 ? "plant" : "plants"}
          </p>
        </div>

        {activeCount > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {hardiness && (
              <button
                type="button"
                onClick={() => changeHardiness("")}
                className="rounded bg-primary px-2 py-1 text-xs font-medium text-on-primary hover:bg-primary-strong"
              >
                Zone {hardiness} <span aria-hidden>×</span>
              </button>
            )}
            {active.map(({ key, value }) => (
              <button
                key={`${key}:${value}`}
                type="button"
                onClick={() => toggle(key, value)}
                aria-label={`Remove filter ${formatOption(key, value)}`}
                className="rounded bg-tint px-2 py-1 text-xs font-medium text-primary-strong hover:bg-line"
              >
                {formatOption(key, value)} <span aria-hidden>×</span>
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="px-1 text-xs font-semibold text-primary hover:text-primary-strong"
            >
              Clear all
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="mt-12 text-muted">No plants match your search and filters.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.slice(0, visible).map((flower) => (
              <PlantCard key={flower.uuid} flower={flower} />
            ))}
          </div>
        )}

        {visible < filtered.length && (
          <div className="mt-8 flex">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-strong"
            >
              Show more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
