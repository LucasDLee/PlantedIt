import React from "react";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
      <span className="h-0.5 w-6 bg-primary" aria-hidden />
      {children}
    </p>
  );
}

// Asymmetric heading: title on the left, description offset to the right
export default function PageHeading({
  children,
  eyebrow,
  title
}: {
  children?: React.ReactNode;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="grid gap-4 border-b border-line pb-8 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-primary-strong text-balance sm:text-5xl">
          {title}
        </h1>
      </div>
      {children && (
        <div className="text-base leading-relaxed text-muted text-pretty lg:col-span-4 lg:col-start-9">
          {children}
        </div>
      )}
    </div>
  );
}
