import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="empty-page">
      <p className="eyebrow">Error 404</p>
      <h1 className="page-title">Page not found</h1>
      <p className="lead">The page you are looking for does not exist or has been moved.</p>
      <div className="btn-row justify-center">
        <Link href="/" className="btn btn-primary">
          Go home
          <ArrowRightIcon />
        </Link>
        <Link href="/projects" className="btn">
          Projects
        </Link>
      </div>
    </div>
  );
}
