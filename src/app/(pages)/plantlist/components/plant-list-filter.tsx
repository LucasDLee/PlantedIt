'use client';

import PlantCard, { type Flower } from "./plant-card";
import { useMemo, useState } from "react";

const PAGE_SIZE = 48;

export default function PlantListFilter({ flowers }: { flowers: Flower[] }) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flowers;
    return flowers.filter((flower) =>
      flower.flower_name.toLowerCase().includes(q) ||
      (flower.flower_group ?? "").toLowerCase().includes(q)
    );
  }, [flowers, query]);

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE);
          }}
          placeholder="Search by name or group…"
          aria-label="Search plants"
          className="w-full rounded-md border-2 border-transparent bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-primary sm:max-w-sm"
        />
        <p className="text-sm text-muted">
          {filtered.length.toLocaleString()} {filtered.length === 1 ? "plant" : "plants"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-muted">No plants match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
  );
}
