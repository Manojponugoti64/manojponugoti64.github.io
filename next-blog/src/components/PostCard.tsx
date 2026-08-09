import Link from "next/link";
import { formatDate } from "@/lib/format";

type PostCardProps = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

export default function PostCard({ slug, title, date, excerpt }: PostCardProps) {
  return (
    <article className="post-card">
      <h2>
        <Link href={`/posts/${slug}`}>{title}</Link>
      </h2>
      <div className="post-meta">{formatDate(date)}</div>
      <p className="post-excerpt">{excerpt}</p>
      <Link href={`/posts/${slug}`} className="read-more">
        Read more &rarr;
      </Link>
    </article>
  );
}
