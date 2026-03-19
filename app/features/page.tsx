import type { Metadata } from "next";
import Link from "next/link";
import FeaturesClient from "./FeaturesClient";

export const metadata: Metadata = {
  title: "Features - AI Email Marketing Tools | ClipVoBooster",
  description: "Discover powerful features: AI email writing, real-time tracking, Gmail integration, contact management, and analytics. Everything you need for successful email campaigns.",
  keywords: ["email marketing features", "AI email writer", "email tracking", "Gmail automation", "email analytics", "contact management"],
  openGraph: {
    title: "Features - ClipVoBooster",
    description: "AI-powered email marketing with real-time tracking and beautiful designs.",
    url: "https://clipvo.site/features",
    type: "website",
  },
  alternates: {
    canonical: "https://clipvo.site/features",
  },
};

export default function FeaturesPage() {
  return <FeaturesClient />;
}
