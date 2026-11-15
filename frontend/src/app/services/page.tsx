import Link from "next/link";
import JsonLd from "@/components/ui/JsonLd";
import PageHeader from "@/components/ui/PageHeader";
import { LinkedInIcon, MailIcon } from "@/components/ui/icons";
import { getCv } from "@/lib/cv";
import { pageMetadata } from "@/lib/seo";
import { PERSON_ID, absoluteUrl } from "@/lib/site";
import { breadcrumbSchema } from "@/lib/structured-data";

const DESCRIPTION =
  "Web application and API penetration testing: agreed scope, manual validation, reproducible findings, remediation guidance and retesting.";

export const metadata = pageMetadata({
  title: "Penetration Testing Services",
  description: DESCRIPTION,
  path: "/services",
});

export default function ServicesPage() {
  const { profile, contact } = getCv();
  const emailHref = `mailto:${contact.email}?subject=${encodeURIComponent("Penetration testing enquiry")}`;

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
        name: "Web application and API penetration testing",
        serviceType: "Penetration testing",
        description: DESCRIPTION,
        provider: { "@id": PERSON_ID },
      }} />

      <PageHeader eyebrow="Services" title="Penetration Testing Services">
        I test web applications and APIs for weaknesses in how they handle access, data and business logic.
        The goal is a finding your team can reproduce, understand and fix.
      </PageHeader>

      <div className="btn-row">
        <a href={emailHref} className="btn"><MailIcon />Discuss a test</a>
        <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="btn">
          <LinkedInIcon />Contact on LinkedIn
        </a>
      </div>

      <div className="prose services-copy">
        <h2>What I test</h2>
        <p>
          My client assessment experience is in web application and API security.
          My telecom and embedded projects inform how I approach systems, but they are not a claim
          that every type of infrastructure or device is covered by the same engagement.
        </p>
        <h3>Web applications</h3>
        <p>
          Authentication, session handling, account recovery, access control between users and roles,
          input handling, file uploads and business workflows. Testing includes the application as
          an authenticated user, not just the public login page.
        </p>
        <h3>APIs</h3>
        <p>
          Object-level and function-level authorization, token handling, unintended data exposure,
          input validation and abuse of documented workflows. API documentation and test accounts
          help establish coverage; undocumented endpoints are assessed only within the agreed scope.
        </p>
        <h3>Wireless, hardware and protocol research</h3>
        <p>
          Sub-GHz radio, embedded systems and industrial protocols are also part of my project work.
          If your question involves one of these, send the device and lab details first.
          Feasibility, equipment and safety constraints need a separate discussion.
          This is not an offer to test live industrial processes or transmit against third-party devices.
        </p>

        <h2>Scope before testing</h2>
        <p>
          Before any traffic is sent, we agree in writing on the assets, objectives, test window
          and permitted techniques. You must own the systems or have authority to approve testing.
          Third-party hosting or integrations may need separate permission.
        </p>
        <ul>
          <li>Domains, applications, API endpoints and environments that are in scope.</li>
          <li>User roles, test accounts, documentation and any source access being provided.</li>
          <li>Excluded systems, sensitive workflows, request limits and stop conditions.</li>
          <li>A named contact for urgent findings or unexpected service impact.</li>
          <li>Evidence handling, report recipients, retention and deletion arrangements.</li>
        </ul>
        <p>
          Staging with representative test data is preferable where possible. Denial of service,
          social engineering, destructive changes and access to unrelated customer data are not
          included by default. Any exception requires explicit agreement.
        </p>

        <h2>How the assessment works</h2>
        <ol>
          <li>
            <strong>Map the application.</strong> Identify entry points, roles, trust boundaries
            and the workflows that matter to your business.
          </li>
          <li>
            <strong>Test the controls.</strong> Use manual testing supported by tooling,
            with relevant OWASP Web Security Testing Guide and API Security guidance as references.
            A scanner result is a lead to investigate, not a confirmed finding.
          </li>
          <li>
            <strong>Validate the impact.</strong> Reproduce issues with the minimum evidence
            needed to explain them. Stop and notify the agreed contact if testing risks service
            availability or exposes unexpected sensitive data.
          </li>
          <li>
            <strong>Report and discuss fixes.</strong> Explain the affected behavior,
            prerequisites, impact and remediation. Critical issues are raised during the test,
            not held until the final report.
          </li>
          <li>
            <strong>Retest agreed fixes.</strong> Where included in the scope, check whether
            the original issue is resolved and document any remaining limitations.
          </li>
        </ol>

        <h2>What you receive</h2>
        <ul>
          <li>A concise summary of the main risks and their business context.</li>
          <li>The tested scope, approach, coverage gaps and limitations.</li>
          <li>Confirmed findings with affected assets, reproduction steps and redacted evidence.</li>
          <li>Severity rationale, practical remediation advice and a technical handover.</li>
          <li>A retest update when retesting is part of the agreement.</li>
        </ul>
        <p>
          This is a time-bounded assessment, not a guarantee that a system has no vulnerabilities,
          a compliance certification or a substitute for ongoing security work.
        </p>

        <h2>Discuss your scope</h2>
        <p>
          Email <a href={emailHref}>{contact.email}</a> or contact me on{" "}
          <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>.
          Include a short description of the application, the environment, approximate size,
          user roles and your preferred dates. Availability, timing and fees are agreed after
          reviewing the scope.
        </p>
        <p>
          Do not send passwords, API keys, customer data or vulnerability evidence in the first message.
          We can agree on an appropriate channel for sensitive material.
          Engagement arrangements and authorization are confirmed before work starts;
          this page does not imply endorsement by my employers.
        </p>
        <p>
          For background, see my <Link href="/cv">CV</Link>,{" "}
          <Link href="/projects">project work</Link> and{" "}
          <Link href="/posts/cc1101-packet-mode-and-raw-capture">CC1101 research note</Link>.
        </p>
      </div>
    </>
  );
}
