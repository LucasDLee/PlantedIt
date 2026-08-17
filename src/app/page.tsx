'use client';

import Header from "@/src/components/header";
import LocationDescriptor from "./(pages)/components/location-descriptor";
import dynamic from 'next/dynamic';
// import Footer from "@/src/components/footer";
// import MainContent from "@/src/components/main-content";

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
          <p>USDA Zone</p> {/* Coords.zone */}
          <p>Local Zone</p> {/* Coords.zone */}
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