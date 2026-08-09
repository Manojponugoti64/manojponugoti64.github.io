import HomeTabs from "@/components/HomeTabs";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts();

  return <HomeTabs posts={posts} />;
}
