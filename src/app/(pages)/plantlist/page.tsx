import Header from "@/src/components/header";
import { getAllFlowers } from "@/src/services/flowers.service";

export default async function PlantList() {
  const flowers = await getAllFlowers();
  console.log(flowers);
  return (
    <>
      <Header />
      <p>plant list</p>
    </>
  );
}
