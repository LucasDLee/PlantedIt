import Link from "next/link";

interface NavLink {
  href: string;
  name: string;
}

export default function NavigationBar() {
  const urls: NavLink[] = [
    {
      href: "/pages/map",
      name: "Map"
    },
    {
      href: "/pages/plantlist",
      name: "Plant List"
    }
  ]

  return (
    <nav>
      <ul>
        {urls.map((val, id) => <li key={id}><Link href={val.href}>{val.name}</Link></li>)}
      </ul>
    </nav>
  )
}