"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Nav from "@/app/components/Nav/Nav";

export default function ConditionalNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const hasCheckedRef = useRef(false);

  // Don't show nav on admin pages
  if (pathname?.startsWith('/secure/admin')) {
    return null;
  }

  const checkAuth = async () => {
    try {
      const r = await fetch('/api/auth/me');
      setIsLoggedIn(r.ok);
    } catch {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasCheckedRef.current) {
      hasCheckedRef.current = true;
      checkAuth();
    }
  }, []);

  // Re-check auth when route changes (e.g., after login redirect)
  useEffect(() => {
    if (!isLoading && hasCheckedRef.current) {
      hasCheckedRef.current = false;
      checkAuth();
    }
  }, [pathname]);

  // Hide nav completely on dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  // Show Nav immediately, hide login/signup links if logged in
  // Don't block rendering on auth check
  return <Nav isLoggedIn={isLoggedIn} />;
}
