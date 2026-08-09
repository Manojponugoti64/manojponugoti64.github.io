import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#writing", label: "Writing" },
];

export default function Header() {
  return (
    <header>
      <nav>
        <Link className="logo" href="/">
          Manoj&apos;s Blog
        </Link>
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
