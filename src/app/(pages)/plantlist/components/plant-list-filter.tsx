'use client';

import { type Facet, type FacetKey } from "../facets";
import { type FacetCounts, PAGE_SIZE, type PlantFilters, toSearch } from "../filter-plants";
import PlantCard, { type Plant } from "./plant-card";
import { useCallback, useEffect, useOptimistic, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import PlantFilterPanel from "./plant-filter-panel";

export default function PlantListFilter({
  counts,
  facets,
  filters,
  plants,
  show,
  total
}: {
  counts: FacetCounts;
  facets: Facet[];
  filters: PlantFilters;
  plants: Plant[];
  show: number;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  // Reflects clicks immediately while the server renders the new results
  const [current, setCurrent] = useOptimistic(filters);
  const [query, setQuery] = useState(filters.query);
  const [showFilters, setShowFilters] = useState(false);

  const apply = useCallback((next: PlantFilters, nextShow?: number) => {
    startTransition(() => {
      setCurrent(next);
      const search = toSearch(next, nextShow);
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    });
  }, [pathname, router, setCurrent]);

  // Search after typing pauses
  useEffect(() => {
    if (query.trim() === current.query) return;
    const timer = setTimeout(() => apply({ ...current, query: query.trim() }), 300);
    return () => clearTimeout(timer);
  }, [apply, current, query]);

  const toggle = (key: FacetKey, value: string) => {
    const values = current.selected[key] ?? [];
    const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
    const selected = { ...current.selected, [key]: next };
    if (!next.length) delete selected[key];
    apply({ ...current, selected });
  };

  const changeZone = (zone: string) => apply({ ...current, zone });

  const active = (Object.entries(current.selected) as [FacetKey, string[]][])
    .flatMap(([key, values]) => values.map((value) => ({ key, value })));
  const activeCount = active.length + (current.zone ? 1 : 0);

  return (
    <div className="mt-8 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
      <aside className={`${showFilters ? "block" : "hidden"} mb-6 lg:mb-0 lg:block`} aria-label="Filters">
        <PlantFilterPanel
          counts={counts}
          facets={facets}
          hardiness={current.zone}
          onHardinessChange={changeZone}
          onToggle={toggle}
          selected={current.selected}
        />
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 sm:max-w-sm sm:flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
          <p className="text-sm text-muted" aria-live="polite">
            {isPending ? "Updating…" : `${total.toLocaleString()} ${total === 1 ? "plant" : "plants"}`}
          </p>
        </div>

        {activeCount > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {current.zone && (
              <button
                type="button"
                onClick={() => changeZone("")}
                className="rounded bg-primary px-2 py-1 text-xs font-medium text-on-primary hover:bg-primary-strong"
              >
                Zone {current.zone} <span aria-hidden>×</span>
              </button>
            )}
            {active.map(({ key, value }) => (
              <button
                key={`${key}:${value}`}
                type="button"
                onClick={() => toggle(key, value)}
                aria-label={`Remove filter ${value}`}
                className="rounded bg-tint px-2 py-1 text-xs font-medium text-primary-strong hover:bg-line"
              >
                {value} <span aria-hidden>×</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => apply({ ...current, selected: {}, zone: "" })}
              className="px-1 text-xs font-semibold text-primary hover:text-primary-strong"
            >
              Clear all
            </button>
          </div>
        )}

        <div className={`transition-opacity ${isPending ? "opacity-60" : ""}`}>
          {total === 0 ? (
            <p className="mt-12 text-muted">No plants match your search and filters.</p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {plants.map((plant) => (
                <PlantCard key={plant.uuid} plant={plant} />
              ))}
            </div>
          )}

          {show < total && (
            <div className="mt-8 flex">
              <button
                type="button"
                onClick={() => apply(current, show + PAGE_SIZE)}
                disabled={isPending}
                className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-strong disabled:opacity-60"
              >
                Show more
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
