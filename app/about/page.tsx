import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us - ClipVoBooster | AI Email Marketing Company",
  description: "Learn about ClipVoBooster - your trusted AI email marketing partner. Based in Kigali, Rwanda. Helping businesses grow with smart email solutions.",
  keywords: ["about ClipVoBooster", "email marketing company", "AI email startup", "Kigali tech company", "Rwanda software"],
  openGraph: {
    title: "About - ClipVoBooster",
    description: "Your trusted AI email marketing partner.",
    url: "https://clipvo.site/about",
    type: "website",
  },
  alternates: {
    canonical: "https://clipvo.site/about",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
