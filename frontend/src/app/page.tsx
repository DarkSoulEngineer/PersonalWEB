import HomeView from "@/components/home/HomeView";
import JsonLd from "@/components/ui/JsonLd";
import { getCv } from "@/lib/cv";
import { getPostList } from "@/lib/posts";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";
import { profilePageSchema } from "@/lib/structured-data";

export default function HomePage() {
  return (
    <>
      <JsonLd data={profilePageSchema("/", SITE_TITLE, SITE_DESCRIPTION)} />
      {/* Four entries keep the original research note linked from the homepage
          alongside the three beginner explainers. */}
      <HomeView cv={getCv()} posts={getPostList().slice(0, 4)} />
    </>
  );
}
