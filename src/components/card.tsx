import React from "react";

export default function Card({
  children,
  className = "",
  label
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <section className={`h-full rounded-lg bg-surface p-5 ${className}`}>
      {label && (
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</h2>
      )}
      {children}
    </section>
  );
}
