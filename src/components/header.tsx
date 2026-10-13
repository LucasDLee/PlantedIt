import Link from "next/link";
import NavigationBar from "./navigation-bar";

export default function Header() {
  return (
    <header className="border-b border-line bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-on-primary">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 21v-8" />
              <path d="M12 13c0-4 3-7 8-7 0 5-3 8-8 7Z" />
              <path d="M12 15c0-3-2.5-5.5-7-5.5 0 4 2.5 6 7 5.5Z" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight text-primary-strong">Planted It</span>
        </Link>
        <NavigationBar />
      </div>
    </header>
  );
}
