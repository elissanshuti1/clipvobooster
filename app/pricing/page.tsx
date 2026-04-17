import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing - Affordable Email Marketing Plans | ClipVoBooster",
  description: "Choose your plan: Starter $29/mo, Professional $49/mo, or Lifetime $60 one-time. AI email marketing for every budget. Start free today.",
  keywords: ["email marketing pricing", "AI email cost", "email marketing plans", "affordable email software", "lifetime email plan"],
  openGraph: {
    title: "Pricing - ClipVoBooster",
    description: "Affordable AI email marketing plans for every business size.",
    url: "https://clipvo.site/pricing",
    type: "website",
  },
  alternates: {
    canonical: "https://clipvo.site/pricing",
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
