"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface NavProps {
  isLoggedIn?: boolean;
}

export default function Nav({ isLoggedIn = false }: NavProps) {
  const [open, setOpen] = useState(false);
  const [isWide, setIsWide] = useState(true);

  useEffect(() => {
    // Detect breakpoint in JS so global CSS cannot force desktop links on mobile
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsWide(e.matches);
    handler(mq);
    if (mq.addEventListener) mq.addEventListener("change", handler as any);
    else mq.addListener(handler as any);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler as any);
      else mq.removeListener(handler as any);
    };
  }, []);

  return (
    <nav
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, display: 'flex', alignItems: 'center', padding: '0 8px', height: 64, background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      className="h-16">
      <div style={{ width: '100%', maxWidth: 1152, margin: '0 auto', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
        <Link href="/" className="flex items-center gap-3 mr-auto text-white no-underline">
          <img src="/favicon.png" alt="ClipVoBooster" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} className="w-8 h-8 rounded-md flex-shrink-0" />
          <span style={{ color: '#ffffff', fontFamily: 'Instrument Serif, serif', fontSize: '18px' }} className="font-serif text-base">ClipVoBooster</span>
        </Link>

        {/* Desktop links - rendered only when viewport is wide */}
        {isWide && (
          <ul style={{ display: "flex", gap: "1.5rem", alignItems: "center", whiteSpace: "nowrap", marginRight: 24 }}>
            <li><Link href="/" style={{ color: '#cbd5e1' }} className="hover:text-slate-100">Home</Link></li>
            <li><Link href="/pricing" style={{ color: '#cbd5e1' }} className="hover:text-slate-100">Pricing</Link></li>
            <li><Link href="/about" style={{ color: '#cbd5e1' }} className="hover:text-slate-100">About</Link></li>
            <li><Link href="/terms" style={{ color: '#cbd5e1' }} className="hover:text-slate-100">Terms</Link></li>
            <li><Link href="/privacy" style={{ color: '#cbd5e1' }} className="hover:text-slate-100">Privacy</Link></li>
            <li><Link href="/refund" style={{ color: '#cbd5e1' }} className="hover:text-slate-100">Refund</Link></li>
          </ul>
        )}

        {/* CTA for desktop */}
        {isWide && (
          <div>
            {isLoggedIn ? (
              <Link href="/dashboard" style={{ background: '#ffffff', color: '#000000', padding: '8px 14px', borderRadius: 8, display: 'inline-flex', alignItems: 'center' }} className="inline-flex items-center gap-2 text-sm font-medium">Dashboard</Link>
            ) : (
              <a href="/api/auth/google" style={{ background: '#ffffff', color: '#000000', padding: '8px 14px', borderRadius: 8, display: 'inline-flex', alignItems: 'center' }} className="inline-flex items-center gap-2 text-sm font-medium">Get Started Free</a>
            )}
          </div>
        )}

        {/* Mobile hamburger */}
        {!isWide && (
          <div style={{ marginLeft: 8 }}>
            <button
              aria-label="Toggle navigation"
              onClick={() => setOpen(!open)}
              className="p-2 rounded-md text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {open ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M3 6h18M3 12h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        )}

        {/* Mobile menu */}
        {!isWide && open && (
          <div style={{ position: 'absolute', right: 16, top: 64, zIndex: 500 }} className="w-48 bg-black/95 rounded-md shadow-lg">
            <ul className="flex flex-col p-3 gap-2 text-slate-300">
              <li><Link href="/" className="block px-2 py-2 hover:text-white" onClick={() => setOpen(false)}>Home</Link></li>
              <li><Link href="/about" className="block px-2 py-2 hover:text-white" onClick={() => setOpen(false)}>About</Link></li>
              <li><Link href="/refund" className="block px-2 py-2 hover:text-white" onClick={() => setOpen(false)}>Refund</Link></li>
              <li><Link href="/privacy" className="block px-2 py-2 hover:text-white" onClick={() => setOpen(false)}>Privacy</Link></li>
              <li><Link href="/terms" className="block px-2 py-2 hover:text-white" onClick={() => setOpen(false)}>Terms</Link></li>
              <li className="pt-2 border-t border-white/6">
                {isLoggedIn ? (
                  <Link href="/dashboard" className="block px-2 py-2 bg-white text-black rounded-md text-center" onClick={() => setOpen(false)}>Dashboard</Link>
                ) : (
                  <a href="/api/auth/google" className="block px-2 py-2 bg-white text-black rounded-md text-center" onClick={() => setOpen(false)}>Get Started Free</a>
                )}
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
