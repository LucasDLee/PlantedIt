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
    }
  ]

  return (
    <nav>
      <ul>
        {urls.map((val, id) => <li key={id}><Link href={val.href}>{val.name}</Link></li>)}
        <li>
          <Link href=""></Link>
        </li>
      </ul>
    </nav>
  )
}