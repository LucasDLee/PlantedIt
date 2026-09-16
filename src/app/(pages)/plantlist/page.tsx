import { getAllFlowers, organizeFlowerGroup } from "@/src/services/flowers.service";
import Header from "@/src/components/header";

export default async function PlantList() {
  const flowers = await getAllFlowers();
  // const group = await organizeFlowerGroup("agaves");
  // console.log(group);
  console.log(flowers);
  return (
    <>
      <Header />
      <p>plant list</p>
      {
        flowers.map((row, index) => <p key={index}>{row.flower_name}</p>)
      }
    </>
  );
}
