import type { PlantFacets, PlantZone } from "../facets";

export interface Plant extends PlantZone {
  // Label/value rows shown on the card
  details: [string, string][];
  facets: PlantFacets;
  group: string | null;
  name: string;
  scientific_name: string | null;
  url: string | null;
  uuid: string;
  zone_label: string | null;
}

export default function PlantCard({ plant }: { plant: Plant }) {
  return (
    <article className="flex flex-col rounded-lg bg-surface p-5 transition-colors hover:bg-tint">
      <div className="flex flex-wrap gap-2">
        {plant.group && (
          <span className="rounded bg-background px-2 py-0.5 text-xs font-medium text-primary-strong">
            {plant.group}
          </span>
        )}
        {plant.zone_label && (
          <span className="rounded bg-primary px-2 py-0.5 text-xs font-medium text-on-primary">
            {plant.zone_label}
          </span>
        )}
      </div>

      <h2 className="mt-3 text-lg font-bold leading-snug tracking-tight text-primary-strong text-balance">
        {plant.name}
      </h2>
      {plant.scientific_name && (
        <p className="mt-0.5 text-sm italic text-muted">{plant.scientific_name}</p>
      )}

      <dl className="mt-4 divide-y divide-line text-sm">
        {plant.details.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 py-1.5">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      {plant.url && (
        <a
          href={plant.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-4 text-sm font-semibold text-primary hover:text-primary-strong"
        >
          View details →
        </a>
      )}
    </article>
  );
}
