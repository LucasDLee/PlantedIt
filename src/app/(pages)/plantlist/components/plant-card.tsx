import { type FlowerFacets, formatGroup } from "../facets";

export interface Flower {
  facets: FlowerFacets;
  flower_color: string | null;
  flower_group: string | null;
  flower_name: string;
  hardiness_rank: number | null;
  life_cycle: string | null;
  minimum_cold_hardiness: string | null;
  plant_height: string | null;
  sun_requirements: string | null;
  url: string | null;
  uuid: string;
}

// "Zone 4a -34.4 °C (-30 °F) to ..." -> "Zone 4a"
function formatHardiness(value: string): string {
  return value.match(/^Zone\s+\S+/)?.[0] ?? value;
}

// "Full Sun, Full Sun to Partial Shade" -> "Full Sun"
function firstOf(value: string): string {
  return value.split(",")[0].trim();
}

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 py-1.5">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export default function PlantCard({ flower }: { flower: Flower }) {
  return (
    <article className="flex flex-col rounded-lg bg-surface p-5 transition-colors hover:bg-tint">
      <div className="flex flex-wrap gap-2">
        {flower.flower_group && (
          <span className="rounded bg-background px-2 py-0.5 text-xs font-medium text-primary-strong">
            {formatGroup(flower.flower_group)}
          </span>
        )}
        {flower.minimum_cold_hardiness && (
          <span className="rounded bg-primary px-2 py-0.5 text-xs font-medium text-on-primary">
            {formatHardiness(flower.minimum_cold_hardiness)}
          </span>
        )}
      </div>

      <h2 className="mt-3 text-lg font-bold leading-snug tracking-tight text-primary-strong text-balance">
        {flower.flower_name}
      </h2>

      <dl className="mt-4 divide-y divide-line text-sm">
        <Detail label="Sun" value={flower.sun_requirements && firstOf(flower.sun_requirements)} />
        <Detail label="Life cycle" value={flower.life_cycle} />
        <Detail label="Height" value={flower.plant_height} />
        <Detail label="Color" value={flower.flower_color} />
      </dl>

      {flower.url && (
        <a
          href={flower.url}
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
