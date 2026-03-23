"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function VisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page visit
    const trackVisit = async () => {
      try {
        await fetch("/api/track-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""),
            userId: null, // Will be null for anonymous visitors
          }),
        });
      } catch (error) {
        // Silently fail - tracking is not critical
        console.error("Failed to track visit:", error);
      }
    };

    trackVisit();
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
}
