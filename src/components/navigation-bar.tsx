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
    {
      href: "/map",
      name: "Map"
    },
    {
      href: "/plantlist",
      name: "Plant List"
    }
  ];

  return (
    <nav>
      <ul className="bg-sky-950 gap-4 flex flex-row list-none">
        {urls.map((val, id) => <li key={id}><Link href={val.href}>{val.name}</Link></li>)}
      </ul>
    </nav>
  );
}