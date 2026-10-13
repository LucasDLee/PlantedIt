import Card from "@/src/components/card";
import PageHeading from "@/src/components/page-heading";

export default function Contact() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeading eyebrow="About" title="About Planted It">
        Planted It helps you find plants suited to where you live, using your location&apos;s
        hardiness zone and climate.
      </PageHeading>
      <Card className="mt-8" label="Links">
        <ul className="mt-3 space-y-1 text-sm">
          <li>GitHub</li>
          <li>LinkedIn</li>
        </ul>
      </Card>
    </div>
  );
}
