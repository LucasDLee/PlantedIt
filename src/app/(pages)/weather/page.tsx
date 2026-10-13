import Card from "@/src/components/card";
import PageHeading from "@/src/components/page-heading";

export default function WeatherData() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeading eyebrow="Climate" title="Weather">
        Frost dates and temperature ranges for your saved location.
      </PageHeading>
      <Card className="mt-8">
        <p className="text-sm text-muted">Weather data is coming soon.</p>
      </Card>
    </div>
  );
}
