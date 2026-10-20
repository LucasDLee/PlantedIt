'use client';

import { GROW_OPTIONS, type Preferences, type Recommendation, SPACES, SUN_OPTIONS, type Space, toSearch } from "../recommend-plants";
import { type ReactNode, useCallback, useEffect, useOptimistic, useTransition } from "react";
import { getPreferences, savePreferences } from "@/src/lib/storage/preferences";
import { usePathname, useRouter } from "next/navigation";
import { HARDINESS_ZONES } from "../../plantlist/facets";
import type { InvasiveCheck } from "../invasive";
import Link from "next/link";
import PlantCard from "../../plantlist/components/plant-card";
import { getRegion } from "@/src/lib/storage/locations";
import { getZone } from "@/src/lib/storage/zone";

const SPACE_LABELS: Record<Space, string> = { container: "Containers", garden: "Garden bed", indoors: "Indoors" };

function Choice({
  children,
  onClick,
  selected
}: {
  children: ReactNode;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
        selected ? "bg-primary text-on-primary hover:bg-primary-strong" : "bg-tint text-primary-strong hover:bg-line"
      }`}
    >
      {children}
    </button>
  );
}

function Question({ children, label }: { children: ReactNode; label: string }) {
  return (
    <fieldset className="border-b border-line py-4">
      <legend className="text-sm font-semibold text-primary-strong">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function InvasiveNote({ check }: { check: InvasiveCheck | null }) {
  if (!check) {
    return (
      <>
        <Link href="/" className="font-semibold text-primary hover:text-primary-strong">Drop a pin on the map</Link>
        {" "}to leave out plants that are invasive where you live.
      </>
    );
  }
  if (!check.place) return "There's no invasive species list for your area yet, so check local guidance before planting.";
  if (!check.hidden) return `None of these are listed as invasive in ${check.place}.`;
  return `Left out ${check.hidden.toLocaleString()} ${check.hidden === 1 ? "plant" : "plants"} listed as invasive in ${check.place}.`;
}

export default function RecommendationList({
  frost,
  invasive,
  prefs,
  recommendations,
  total
}: {
  frost: string | null;
  invasive: InvasiveCheck | null;
  prefs: Preferences;
  recommendations: Recommendation[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  // Reflects clicks immediately while the server renders the new results
  const [current, setCurrent] = useOptimistic(prefs);

  const apply = useCallback((next: Preferences) => {
    startTransition(() => {
      setCurrent(next);
      const search = toSearch(next);
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    });
  }, [pathname, router, setCurrent]);

  const update = (next: Preferences) => {
    savePreferences({ grow: next.grow, space: next.space, sun: next.sun });
    apply(next);
  };

  // Fill in the saved zone and answers on a fresh visit; a shared link keeps its own. Invasiveness
  // is about where the viewer gardens, so a link without a region picks up theirs.
  useEffect(() => {
    const region = prefs.region || getRegion();
    if (prefs.zone) {
      if (region !== prefs.region) apply({ ...prefs, region });
      return;
    }
    const zone = getZone();
    const saved = getPreferences();
    if (!zone && !saved && !region) return;
    apply({
      grow: saved?.grow ?? prefs.grow,
      region,
      south: zone ? zone.lat < 0 : prefs.south,
      space: saved?.space ?? prefs.space,
      sun: saved?.sun ?? prefs.sun,
      zone: zone?.usda_zone ?? ""
    });
    // Runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleGrow = (value: string) => update({
    ...current,
    grow: current.grow.includes(value) ? current.grow.filter((v) => v !== value) : [...current.grow, value]
  });

  return (
    <div className="mt-8 lg:grid lg:grid-cols-[17rem_1fr] lg:gap-8">
      <aside className="mb-6 lg:mb-0" aria-label="Your garden">
        <label className="block border-b border-line pb-4">
          <span className="text-sm font-semibold text-primary-strong">Hardiness zone</span>
          <select
            value={current.zone}
            onChange={(e) => apply({ ...current, zone: e.target.value })}
            className="mt-2 w-full rounded-md border-2 border-transparent bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Choose a zone</option>
            {HARDINESS_ZONES.map((zone) => (
              <option key={zone} value={zone}>Zone {zone}</option>
            ))}
          </select>
          {frost && <p className="mt-2 text-xs text-muted">{frost}</p>}
        </label>

        <Question label="How much sun does it get?">
          <Choice selected={!current.sun} onClick={() => update({ ...current, sun: "" })}>Any</Choice>
          {SUN_OPTIONS.map((sun) => (
            <Choice key={sun} selected={current.sun === sun} onClick={() => update({ ...current, sun })}>
              {sun}
            </Choice>
          ))}
        </Question>

        <Question label="Where will it grow?">
          {SPACES.map((space) => (
            <Choice key={space} selected={current.space === space} onClick={() => update({ ...current, space })}>
              {SPACE_LABELS[space]}
            </Choice>
          ))}
        </Question>

        <Question label="What do you want to grow?">
          {GROW_OPTIONS.map((value) => (
            <Choice key={value} selected={current.grow.includes(value)} onClick={() => toggleGrow(value)}>
              {value}
            </Choice>
          ))}
        </Question>
      </aside>

      <div className={`min-w-0 transition-opacity ${isPending ? "opacity-60" : ""}`}>
        {!current.zone ? (
          <p className="text-muted">
            <Link href="/" className="font-semibold text-primary hover:text-primary-strong">Drop a pin on the map</Link>
            {" "}or choose a hardiness zone to see what grows well where you live.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted" aria-live="polite">
                {isPending
                  ? "Updating…"
                  : `Top ${recommendations.length} of ${total.toLocaleString()} ${total === 1 ? "match" : "matches"}`}
              </p>
              <Link
                href={`/plantlist?zone=${current.zone}`}
                className="text-sm font-semibold text-primary hover:text-primary-strong"
              >
                Browse every plant for zone {current.zone} →
              </Link>
            </div>
            {!isPending && <p className="mt-1 text-xs text-muted"><InvasiveNote check={invasive} /></p>}

            {total === 0 ? (
              <p className="mt-12 text-muted">No plants match your answers. Try loosening one of them.</p>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {recommendations.map(({ plant, reasons }) => (
                  <PlantCard key={plant.uuid} plant={plant} reasons={reasons} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
