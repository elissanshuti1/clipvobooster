"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth/me");
        const data = await res.json();

        if (!data.authenticated) {
          router.push("/secure/admin");
          return;
        }

        setAdmin(data.admin);
      } catch (error) {
        router.push("/secure/admin");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/secure/admin");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090d] flex items-center justify-center">
        <style>{`
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(99, 102, 241, 0.2);
            border-radius: 50%;
            border-top-color: #6366f1;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const navItems = [
    { href: "/secure/admin/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/secure/admin/users", label: "Users", icon: "👥" },
    { href: "/secure/admin/emails", label: "Email Campaigns", icon: "📧" },
    { href: "/secure/admin/analytics", label: "Analytics", icon: "📈" },
    { href: "/secure/admin/ai-insights", label: "AI Insights", icon: "🤖" },
    { href: "/secure/admin/support", label: "Support Messages", icon: "💬" },
    { href: "/secure/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-[#08090d]">
      <style>{`
        :root {
          --bg: #08090d;
          --bg1: #0e1018;
          --bg2: #12151f;
          --bg3: #181c27;
          --line: rgba(255,255,255,0.07);
          --text: #dde1e9;
          --muted: #5a6373;
          --dim: #8b95a5;
          --white: #ffffff;
          --primary: #6366f1;
        }
        .admin-sidebar {
          width: 260px;
          background: var(--bg1);
          border-right: 1px solid var(--line);
          position: fixed;
          height: 100vh;
          overflow-y: auto;
        }
        .admin-main {
          margin-left: 260px;
          min-height: 100vh;
        }
        .admin-header {
          background: var(--bg1);
          border-bottom: 1px solid var(--line);
          padding: 20px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .admin-logo {
          font-size: 20px;
          font-weight: 700;
          color: var(--white);
        }
        .admin-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .admin-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          color: var(--text);
          text-decoration: none;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }
        .nav-item:hover {
          background: var(--bg2);
          color: var(--white);
        }
        .nav-item.active {
          background: var(--bg2);
          border-left-color: var(--primary);
          color: var(--white);
        }
        .nav-section {
          padding: 16px 20px;
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .logout-btn {
          padding: 10px 20px;
          background: var(--bg2);
          border: 1px solid var(--line);
          color: var(--text);
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: var(--bg3);
          color: var(--white);
        }
        @media (max-width: 768px) {
          .admin-sidebar {
            width: 100%;
            height: auto;
            position: relative;
          }
          .admin-main {
            margin-left: 0;
          }
        }
      `}</style>

      {/* Sidebar */}
      <div className="admin-sidebar">
        <div style={{ padding: "24px 20px" }}>
          <div className="admin-logo">🚀 ClipVo Admin</div>
        </div>

        <div className="nav-section">Main</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname === item.href ? "active" : ""}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="nav-section">Account</div>
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{
            width: "100%",
            textAlign: "left",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-header">
          <div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "var(--white)",
                margin: 0,
              }}
            >
              {navItems.find((n) => n.href === pathname)?.label || "Admin"}
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "var(--muted)",
                margin: "4px 0 0 0",
              }}
            >
              Manage your ClipVoBooster platform
            </p>
          </div>
          <div className="admin-user">
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--white)",
                }}
              >
                {admin?.name}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                {admin?.role}
              </div>
            </div>
            <div className="admin-avatar">
              {admin?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ padding: "32px" }}>{children}</div>
      </div>
    </div>
  );
}
