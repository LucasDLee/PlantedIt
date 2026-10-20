'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  name: string;
}

export default function NavigationBar() {
  const pathname = usePathname();

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
      href: "/recommendations",
      name: "Recommendations"
    },
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
    <nav>
      <ul className="flex flex-wrap items-center gap-1 text-sm font-medium">
        {urls.map((val, id) => {
          const active = val.href === "/" ? pathname === "/" : pathname.startsWith(val.href);
          return (
            <li key={id}>
              <Link
                href={val.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-md px-3 py-2 transition-colors ${
                  active
                    ? "bg-tint text-primary-strong"
                    : "text-muted hover:bg-surface hover:text-primary-strong"
                }`}
              >
                {val.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
