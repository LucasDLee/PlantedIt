'use client';

import { type Facet, type FacetKey, HARDINESS_ZONES } from "../facets";
import { type FacetCounts, type Selection } from "../filter-plants";
import { ZONE_EVENT, getZone } from "@/src/lib/storage/zone";
import { useEffect, useState } from "react";

// Sections expanded on first render
const OPEN_BY_DEFAULT: FacetKey[] = ["category", "habit", "sun"];

function useSavedZone(): string | null {
  const [zone, setZone] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setZone(getZone()?.usda_zone ?? null);

    refresh(); // read real data only after mount

    window.addEventListener(ZONE_EVENT, refresh);
    return () => window.removeEventListener(ZONE_EVENT, refresh);
  }, []);

  return zone;
}

function FacetSection({
  counts,
  facet,
  onToggle,
  selected
}: {
  counts: Record<string, number>;
  facet: Facet;
  onToggle: (key: FacetKey, value: string) => void;
  selected: string[];
}) {
  return (
    <details open={OPEN_BY_DEFAULT.includes(facet.key)} className="group border-b border-line py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-primary-strong">
        <span>
          {facet.label}
          {selected.length > 0 && (
            <span className="ml-2 rounded bg-primary px-1.5 py-0.5 text-xs text-on-primary">{selected.length}</span>
          )}
        </span>
        <span className="text-muted transition-transform group-open:rotate-90" aria-hidden>›</span>
      </summary>

      <ul className={`mt-2 space-y-0.5 ${facet.options.length > 12 ? "max-h-60 overflow-y-auto pr-1" : ""}`}>
        {facet.options.map((option) => {
          const checked = selected.includes(option);
          const count = counts[option] ?? 0;
          const disabled = count === 0 && !checked;
          return (
            <li key={option}>
              <label
                className={`flex items-center gap-2 rounded px-1 py-1 text-sm ${
                  disabled ? "text-muted opacity-60" : "cursor-pointer hover:bg-tint"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(facet.key, option)}
                  className="accent-primary"
                />
                <span className="flex-1">{option}</span>
                <span className="text-xs tabular-nums text-muted">{count}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

export default function PlantFilterPanel({
  counts,
  facets,
  hardiness,
  onHardinessChange,
  onToggle,
  selected
}: {
  counts: FacetCounts;
  facets: Facet[];
  hardiness: string;
  onHardinessChange: (zone: string) => void;
  onToggle: (key: FacetKey, value: string) => void;
  selected: Selection;
}) {
  const savedZone = useSavedZone();

  return (
    <div>
      <div className="border-b border-line pb-4">
        <label htmlFor="hardiness" className="text-sm font-semibold text-primary-strong">
          Hardiness zone
        </label>
        <select
          id="hardiness"
          value={hardiness}
          onChange={(e) => onHardinessChange(e.target.value)}
          className="mt-2 w-full rounded-md border-2 border-transparent bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">Any zone</option>
          {HARDINESS_ZONES.map((zone) => (
            <option key={zone} value={zone}>Zone {zone}</option>
          ))}
        </select>
        {savedZone && hardiness !== savedZone && (
          <button
            type="button"
            onClick={() => onHardinessChange(savedZone)}
            className="mt-2 text-sm font-semibold text-primary hover:text-primary-strong"
          >
            Use my zone ({savedZone})
          </button>
        )}
      </div>

      {facets.map((facet) => (
        <FacetSection
          key={facet.key}
          counts={counts[facet.key] ?? {}}
          facet={facet}
          onToggle={onToggle}
          selected={selected[facet.key] ?? []}
        />
      ))}
    </div>
  );
}
