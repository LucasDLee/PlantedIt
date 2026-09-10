'use client';

import Header from "@/src/components/header";
import LocationDescriptor from "./(pages)/components/location-descriptor";
import ZoneDescriptor from "./(pages)/components/zone-descriptor";
import dynamic from 'next/dynamic';

const Map = dynamic(() => import("./(pages)/map/components/map"), {
  loading: () => <p>Loading map...</p>,
  ssr: false
});

export default function Home() {
  return (
    <>
      <Header />
      <div className="grid grid-cols-2">
        <Map />
        <section>
          <LocationDescriptor />
          <p>Latitude Longitude</p> {/* Nominatim */}
          <ZoneDescriptor />
        </section>
      </div>
      <div>
        <p>Weather data</p>
        <p>Recommended plants based on location</p>
      </div>
      {/* <MainContent /> */}
      {/* <Footer /> */}
    </>
  );
}