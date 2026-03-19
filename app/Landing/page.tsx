"use client";

import Body from "@/app/components/Body/Body";
import Footer from "@/app/components/Footer/Footer";
import Script from "next/script";

export default function Landing() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ClipVoBooster",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web-based",
    "offers": {
      "@type": "Offer",
      "price": "15.00",
      "priceCurrency": "USD"
    },
    "description": "AI-powered email marketing platform that writes, sends, and tracks professional emails with real-time analytics.",
    "featureList": "AI email generation, Email tracking, Gmail integration, Contact management, Analytics dashboard",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Organization",
      "name": "ClipVoBooster Team",
      "url": "https://clipvo.site",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Kigali",
        "addressCountry": "Rwanda"
      }
    },
    "url": "https://clipvo.site",
    "image": "https://clipvo.site/og-image.png",
    "screenshot": "https://clipvo.site/og-image.png"
  };

  return (
    <>
      <Script
        id="software-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        strategy="afterInteractive"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Mono:wght@300;400&display=swap');
        /* Scoped to landing-root to avoid overriding global/site styles */
        .landing-root, .landing-root * { box-sizing: border-box; }

        .landing-root {
          --bg:    #08090d;
          --bg1:   #0e1018;
          --bg2:   #12151f;
          --bg3:   #181c27;
          --line:  rgba(255,255,255,0.07);
          --line2: rgba(255,255,255,0.13);
          --text:  #dde1e9;
          --muted: #5a6373;
          --dim:   #8b95a5;
          --white: #ffffff;
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', system-ui, sans-serif;
          font-weight: 300;
          -webkit-font-smoothing: antialiased;
          line-height: 1.6;
          overflow-x: hidden;
          min-height: 100vh;
        }

        html { scroll-behavior: smooth; }

        /* ── Animations (kept global keyframes) ── */
        @keyframes rise {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes breathe {
          0%,100% { opacity:.35; } 50% { opacity:.9; }
        }

        .landing-root .rise { opacity:0; animation: rise .85s cubic-bezier(.16,1,.3,1) forwards; }
        .landing-root .d1{animation-delay:.04s} .landing-root .d2{animation-delay:.16s}
        .landing-root .d3{animation-delay:.28s} .landing-root .d4{animation-delay:.40s}
        .landing-root .d5{animation-delay:.52s}
      `}</style>

      <div className="landing-root">
        <Body />
        <Footer />
      </div>
    </>
  );
}