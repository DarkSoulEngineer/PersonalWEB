import Link from "next/link";
import { ArrowRightIcon } from "./icons";

export default function SectionHeader({
  id,
  title,
  action,
}: {
  id?: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="section-header">
      <h2 id={id} className="section-title">
        {title}
      </h2>
      {action ? (
        <Link href={action.href} className="link-arrow">
          {action.label}
          <ArrowRightIcon />
        </Link>
      ) : null}
    </div>
  );
}
