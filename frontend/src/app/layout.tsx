import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import RadioProvider from "@/components/radio/RadioProvider";
import JsonLd from "@/components/ui/JsonLd";
import { getProfile } from "@/lib/profile";
import { THEME_SCRIPT } from "@/lib/theme";
import {
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";
import { siteGraph } from "@/lib/structured-data";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const display = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const profile = getProfile();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: profile.name, url: SITE_URL }],
  creator: profile.name,
  publisher: profile.name,
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, address: false, email: false },
  // SomaFM rejects stream requests that carry a localhost Referer.
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1216" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        <JsonLd data={siteGraph()} />
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <RadioProvider>
          <SiteHeader />
          <main id="content" className="container-page flex-1 py-12 sm:py-16">
            {children}
          </main>
          <SiteFooter />
        </RadioProvider>
      </body>
    </html>
  );
}
