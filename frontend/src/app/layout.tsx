import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import RadioProvider from "@/components/radio/RadioProvider";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Same face as the "DarkSoul ENGINEER_" banner on GitHub; used for the site logo.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-brand",
  subsets: ["latin", "latin-ext"],
  weight: ["700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Milchis Catalin-Marian",
    template: "%s · Milchis",
  },
  description:
    "Penetration tester and software engineer in Brasov, Romania, working in cybersecurity. Projects, articles and CV.",
  icons: {
    icon: "/avatar.png",
  },
  // SomaFM answers 403 when the Referer is localhost, so send none.
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#222325" },
    { media: "(prefers-color-scheme: light)", color: "#eceee6" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plexSans.variable} ${plexMono.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>
        <RadioProvider>
          <SiteHeader />
          <main className="site-main">
            <div className="container">{children}</div>
          </main>
          <SiteFooter />
        </RadioProvider>
      </body>
    </html>
  );
}
