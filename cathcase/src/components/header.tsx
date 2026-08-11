import Link from "next/link";

const nav = [
  { href: "/cases", label: "Cases" },
  { href: "/atlas", label: "Atlas" },
];

export function Header() {
  return (
    <header className="border-b border-card-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="mentor-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <span className="font-semibold tracking-tight group-hover:text-accent transition-colors">
              CathLab Mentor
            </span>
            <span className="hidden sm:inline text-muted text-xs ml-2">
              learn the move before the wire
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/cases/lad-om1-bifurcation"
            className="hidden sm:inline-flex px-3 py-1.5 text-xs text-coral hover:text-foreground transition-colors"
          >
            Today&apos;s case
          </Link>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-sm text-muted hover:text-foreground hover:bg-white/5 rounded-md transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
