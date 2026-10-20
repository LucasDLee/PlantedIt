'use client';

import Card from "@/src/components/card";
import { Eyebrow } from "@/src/components/page-heading";
import Link from "next/link";
import LocationDescriptor from "./(pages)/components/location-descriptor";
import ZoneDescriptor from "./(pages)/components/zone-descriptor";
import dynamic from 'next/dynamic';

const Map = dynamic(() => import("./(pages)/map/components/map"), {
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted">Loading map…</div>
  ),
  ssr: false
});

const steps = [
  "Click the map to drop a pin on your garden",
  "We look up your USDA hardiness zone",
  "Get plants that suit your climate"
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <section className="grid gap-8 py-10 lg:grid-cols-12 lg:gap-12 lg:py-14">
        <div className="flex flex-col lg:col-span-5">
          <Eyebrow>Find your garden</Eyebrow>
          <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-primary-strong text-balance sm:text-5xl">
            What will grow where you live?
          </h1>
          <p className="mt-5 max-w-md leading-relaxed text-muted">
            Pick a spot on the map and we&apos;ll match plants to its hardiness zone and climate.
          </p>

          <ol className="mt-8 space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-tint text-xs font-bold text-primary-strong">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/recommendations"
              className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-strong"
            >
              Get recommendations
            </Link>
            <Link
              href="/plantlist"
              className="rounded-md bg-surface px-5 py-3 text-sm font-semibold text-primary-strong transition-colors hover:bg-tint"
            >
              Browse all plants
            </Link>
          </div>
        </div>

        <div className="h-[420px] overflow-hidden rounded-lg bg-tint lg:col-span-7 lg:h-auto lg:min-h-[500px]">
          <Map />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <LocationDescriptor />
        </div>
        <div className="lg:col-span-3">
          <ZoneDescriptor />
        </div>
        <Card label="Weather" className="lg:col-span-4">
          <p className="mt-3 text-sm text-muted">
            Frost dates and temperature ranges for your location will appear here.
          </p>
        </Card>
      </section>

      <section className="mt-4 flex flex-col gap-4 rounded-lg bg-primary p-6 text-on-primary sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-xl font-bold">Recommended plants</h2>
          <p className="mt-1 text-sm text-on-primary/80">
            Plants matched to your hardiness zone will appear here.
          </p>
        </div>
        <Link
          href="/plantlist"
          className="self-start rounded-md bg-background px-4 py-2.5 text-sm font-semibold text-primary-strong transition-colors hover:bg-tint sm:self-auto"
        >
          See the catalogue →
        </Link>
      </section>
    </div>
  );
}
