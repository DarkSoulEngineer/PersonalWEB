import ArticlesView from "@/components/articles/ArticlesView";
import { getPostList, getTags } from "@/lib/posts";

export const metadata = {
  title: "Articles",
  description:
    "Articles by Catalin-Marian Milchis on cybersecurity, RF security and software development.",
};

export default function ArticlesPage() {
  return <ArticlesView posts={getPostList()} tags={getTags()} />;
}
