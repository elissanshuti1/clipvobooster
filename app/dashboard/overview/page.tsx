"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardOverview() {
  const router = useRouter();
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    picture?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        // Fetch user data
        const userRes = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        const userData = userRes.ok ? await userRes.json() : null;

        if (!userData) {
          router.push("/login");
          return;
        }

        setUser(userData);
        setIsLoading(false);
      } catch (err) {
        console.error("Dashboard init error:", err);
        router.push("/login");
      }
    };

    initData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white flex items-center justify-center">
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(255,255,255,0.1)",
            borderTop: "3px solid #6366f1",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const firstName =
    user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  return (
    <>
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
        }

        .fresh-start-card {
          background: linear-gradient(135deg, var(--bg1), var(--bg2));
          border: 1px solid var(--line2);
          border-radius: 24px;
          padding: 60px 40px;
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .fresh-start-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 32px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fresh-start-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 12px;
        }

        .fresh-start-subtitle {
          font-size: 16px;
          color: var(--muted);
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .btn {
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }

        .btn-primary:hover {
          opacity: 0.9;
          transform: scale(1.02);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
        }
      `}</style>

      <div>
        {/* Fresh Start Card */}
        <div className="fresh-start-card">
          <div className="fresh-start-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>

          <h1 className="fresh-start-title">Welcome, {firstName}! 👋</h1>
          <p className="fresh-start-subtitle">
            Ready to find new customers? Our AI will help you discover people
            who are actively looking for products like yours.
          </p>

          <button
            className="btn btn-primary"
            onClick={() => router.push("/dashboard/customers")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Find Customers Now
          </button>
        </div>
      </div>
    </>
  );
}
