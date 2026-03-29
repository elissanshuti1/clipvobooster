import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import ConditionalNav from "@/app/components/ConditionalNav";
import VisitTracker from "@/app/components/VisitTracker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://clipvo.site"),
  title: {
    default: "ClipVoBooster - Find Customers & Close Deals with AI",
    template: "%s | ClipVoBooster",
  },
  description:
    "Stop chasing customers. Our AI finds people actively looking for products like yours on Reddit, then helps you reach them with perfect emails. Start closing deals today.",
  keywords: [
    "find customers",
    "AI customer discovery",
    "Reddit lead generation",
    "close deals",
    "email outreach",
    "AI emails",
    "customer finding tool",
    "warm leads",
    "personalized email",
    "sales automation",
    "B2B customer acquisition",
    "SaaS marketing",
  ],
  authors: [{ name: "ClipVoBooster Team" }],
  creator: "ClipVoBooster",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clipvo.site",
    siteName: "ClipVoBooster",
    title: "ClipVoBooster - Find Customers & Close Deals",
    description:
      "AI finds people actively looking for your product. Perfect emails turn them into customers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ClipVoBooster - AI Customer Discovery & Email Marketing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClipVoBooster - Find Customers & Close Deals",
    description:
      "AI finds people actively looking for your product. Perfect emails turn them into customers.",
    creator: "@clipvobooster",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/favicon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { url: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://clipvo.site",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" style={{ background: "#08090d" }}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" sizes="180x180" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-[#08090d] text-[#dde1e9] min-h-screen flex flex-col`}
        style={{ background: "#08090d", color: "#dde1e9" }}
      >
        <Suspense fallback={null}>
          <VisitTracker />
        </Suspense>
        <ConditionalNav />
        {/* The flex-grow ensures the footer stays at bottom if content is short */}
        <main className="flex-grow w-full">{children}</main>
      </body>
    </html>
  );
}
