import Link from "next/link";
import JsonLd from "@/components/ui/JsonLd";
import PageHeader from "@/components/ui/PageHeader";
import { LinkedInIcon, MailIcon } from "@/components/ui/icons";
import { getCv } from "@/lib/cv";
import { pageMetadata } from "@/lib/seo";
import { PERSON_ID, absoluteUrl } from "@/lib/site";
import { breadcrumbSchema } from "@/lib/structured-data";

const DESCRIPTION =
  "Authorized, time-boxed security assessment: scoped manual review, reproducible findings, remediation guidance and optional retesting.";

const PHASES = [
  {
    title: "Scoping",
    detail: "Confirm the assets, user roles, environments, test window, exclusions and escalation contacts. Authority to test is recorded before work starts.",
    output: "Written scope and rules of engagement",
  },
  {
    title: "Mapping",
    detail: "Identify entry points, roles, trust boundaries and the workflows that carry business risk.",
    output: "Coverage map and test plan",
  },
  {
    title: "Review",
    detail: "Manual review supported by tooling. Relevant security testing guidance informs the checklist; scanner output is treated as a lead, not a finding.",
    output: "Validated observations",
  },
  {
    title: "Validation",
    detail: "Reproduce each issue with the minimum evidence needed to explain it. Stop and notify the agreed contact if availability or sensitive data is put at risk.",
    output: "Confirmed findings and reproduction steps",
  },
  {
    title: "Reporting",
    detail: "Document the affected behavior, prerequisites, impact and remediation. Critical issues are raised during the assessment, not held for the final report.",
    output: "Prioritized report and technical handover",
  },
  {
    title: "Retest",
    detail: "Where included, recheck the agreed fixes and document any residual limitations.",
    output: "Retest update",
  },
];

const DELIVERABLES = [
  {
    title: "Executive summary",
    body: "The main risks, their business context and the order in which to address them.",
  },
  {
    title: "Technical findings",
    body: "Affected assets, prerequisites, reproduction steps, redacted evidence and severity rationale.",
  },
  {
    title: "Remediation guidance",
    body: "Practical fixes and verification advice for the engineering team.",
  },
  {
    title: "Handover and retest",
    body: "A technical walkthrough and a retest update when retesting is in scope.",
  },
];

export const metadata = pageMetadata({
  title: "Security Assessment",
  description: DESCRIPTION,
  path: "/services",
});

export default function ServicesPage() {
  const { profile, contact } = getCv();
  const emailHref = `mailto:${contact.email}?subject=${encodeURIComponent("Security assessment enquiry")}`;

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Services", path: "/services" },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${absoluteUrl("/services")}#service`,
        url: absoluteUrl("/services"),
        name: "Security assessment",
        serviceType: "Security assessment",
        description: DESCRIPTION,
        provider: { "@id": PERSON_ID },
      }} />

      <PageHeader eyebrow="Services" title="Security assessment">
        A structured, time-boxed review of how a system handles access, data and business
        logic. The result is a prioritized, reproducible report your engineers can act on.
      </PageHeader>

      <div className="btn-row">
        <a href={emailHref} className="btn btn-primary">
          <MailIcon />Request a scoping discussion
        </a>
        <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="btn">
          <LinkedInIcon />Connect on LinkedIn
        </a>
      </div>

      <div className="services-page">
        <section aria-labelledby="assessment-process" className="services-section">
          <h2 id="assessment-process" className="section-title">Assessment process</h2>
          <ol className="services-process">
            {PHASES.map((phase, index) => (
              <li key={phase.title} className="services-process__item">
                <span className="services-process__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="services-process__body">
                  <h3>{phase.title}</h3>
                  <p>{phase.detail}</p>
                  <p className="services-process__output">
                    <span>Output</span>
                    {phase.output}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="assessment-deliverables" className="services-section">
          <h2 id="assessment-deliverables" className="section-title">Deliverables</h2>
          <div className="services-deliverables">
            {DELIVERABLES.map((item) => (
              <div key={item.title} className="services-deliverable">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
          <p className="services-note">
            The assessment is time-bounded. Duration and effort are agreed during scoping and
            stated in the proposal. It is not a guarantee that a system has no vulnerabilities,
            a compliance certification or a substitute for ongoing security work.
          </p>
        </section>

        <section aria-labelledby="scope-authorization" className="services-section">
          <h2 id="scope-authorization" className="section-title">Scope and authorization</h2>
          <div className="services-panel">
            <div>
              <h3>Rules of engagement</h3>
              <ul>
                <li>Written authorization from the system owner before any request is sent.</li>
                <li>Agreed assets, test window, request limits and stop conditions.</li>
                <li>A named contact for critical findings or unexpected service impact.</li>
                <li>Defined evidence handling, report recipients and retention arrangements.</li>
              </ul>
            </div>
            <div>
              <h3>Excluded by default</h3>
              <ul>
                <li>Denial-of-service testing and destructive changes.</li>
                <li>Social engineering and physical access.</li>
                <li>Access to unrelated customer data.</li>
                <li>Anything outside the agreed scope.</li>
              </ul>
            </div>
          </div>
          <p className="services-note">
            Staging with representative test data is preferred. Any exception to the exclusions
            requires explicit written agreement.
          </p>
        </section>

        <section className="services-contact" aria-labelledby="assessment-contact">
          <div>
            <h2 id="assessment-contact">Start a scoping discussion</h2>
            <p>
              Send a short description of the systems, the environment, approximate size, user
              roles and preferred dates.
            </p>
            <p>
              Assessment work begins only after written authorization from the system owner.
              Timing and availability are confirmed once the scope is clear. This page describes
              my assessment approach and does not imply endorsement by my employers.
            </p>
            <p className="services-background">
              For background, see my <Link href="/cv">CV</Link> and <Link href="/projects">project work</Link>.
            </p>
          </div>
          <div className="services-contact__actions">
            <a href={emailHref} className="btn btn-primary">
              <MailIcon />Email me
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="btn">
              <LinkedInIcon />LinkedIn
            </a>
          </div>
        </section>
      </div>
    </>
  );
}