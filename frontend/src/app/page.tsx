import HomeView from "@/components/home/HomeView";
import { getCv } from "@/lib/cv";
import { getPostList } from "@/lib/posts";

export default function HomePage() {
  const cv = getCv();

  return (
    <HomeView
      profile={cv.profile}
      email={cv.contact.email}
      currentRole={cv.experience.find((job) => job.current) ?? null}
      projects={cv.featuredProjects}
      posts={getPostList().slice(0, 3)}
      highlights={cv.print.achievements}
    />
  );
}
