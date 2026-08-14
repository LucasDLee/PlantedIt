import Link from "next/link";

interface NavLink {
  href: string;
  name: string;
}

export default function NavigationBar() {
  const urls: NavLink[] = [
    {
      href: "/",
      name: "Home"
    },
    // {
    //   href: "/map",
    //   name: "Map"
    // },
    {
      href: "/plantlist",
      name: "Plant List"
    },
    {
      href: "/weather",
      name: "Weather"
    },
    {
      href: "/about",
      name: "About"
    }
  ];

  return (
    <nav className="bg-sky-950 flex justify-center rounded-b-3xl w-full">
      <ul className="items-center gap-4 flex flex-row list-none p-3">
        {urls.map((val, id) => <li key={id}><Link href={val.href}>{val.name}</Link></li>)}
      </ul>
    </nav>
  );
}