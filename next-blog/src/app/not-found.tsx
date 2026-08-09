import Link from "next/link";

export default function NotFound() {
  return (
    <div className="about-bio-container">
      <h1>404</h1>
      <p>This page doesn&apos;t exist.</p>
      <Link href="/" className="read-more">
        Go home &rarr;
      </Link>
    </div>
  );
}
