"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import NotificationBell from "@/app/components/NotificationBell";

const NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    id: "customers",
    label: "Find Customers",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    id: "compose",
    label: "Compose",
    icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  },
  {
    id: "contacts",
    label: "Contacts",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    id: "emails",
    label: "Sent Emails",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        // Fetch user data
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) {
          router.push("/login");
          return;
        }
        const userData = await userRes.json();

        // Check if user is suspended
        if (userData?.isSuspended) {
          console.log("🚫 User is suspended, redirecting to suspended page");
          router.push("/account-suspended");
          return;
        }

        setUser(userData);
        console.log("✅ Dashboard layout: User loaded:", userData.name);

        // No subscription check - users can use the app freely
        setIsLoading(false);
      } catch (err) {
        console.error("Dashboard layout init error:", err);
        router.push("/login");
      }
    };

    initDashboard();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
      window.location.href = "/login";
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const firstName = name.split(" ")[0];
      return firstName.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const currentTab = pathname?.split("/").pop() || "overview";

  if (isLoading) {
    return (
      <>
        <style>{`
          :root {
            --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
            --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
            --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>
        <div
          style={{
            minHeight: "100vh",
            background: "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              border: "4px solid rgba(255,255,255,0.1)",
              borderTop: "4px solid #6366f1",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p
            style={{
              color: "var(--muted)",
              fontSize: 14,
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            Loading dashboard...
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
        }
        .dashboard-shell { display: flex; min-height: 100vh; background: var(--bg); }

        /* Sidebar */
        .dashboard-sidebar {
          width: 260px;
          background: var(--bg1);
          border-right: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 50;
        }
        .dashboard-sidebar.collapsed { width: 72px; }

        /* Sidebar Header */
        .sidebar-header {
          height: 64px;
          display: flex;
          align-items: center;
          padding: 0 20px;
          border-bottom: 1px solid var(--line);
          gap: 12px;
        }
        .sidebar-logo {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--white);
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .sidebar-brand {
          font-family: 'Instrument Serif', serif;
          font-size: 18px;
          font-weight: 600;
          color: var(--white);
          white-space: nowrap;
          transition: opacity 0.2s;
        }
        .dashboard-sidebar.collapsed .sidebar-brand {
          opacity: 0;
          width: 0;
          overflow: hidden;
        }

        /* Sidebar Nav */
        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          overflow-y: auto;
        }
        .sidebar-nav::-webkit-scrollbar { display: none; }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
          color: var(--muted);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          margin-bottom: 4px;
        }
        .nav-link svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--dim);
        }
        .nav-link.active {
          background: rgba(255, 255, 255, 0.08);
          color: var(--white);
        }
        .nav-label {
          white-space: nowrap;
          transition: opacity 0.2s;
        }
        .dashboard-sidebar.collapsed .nav-label {
          opacity: 0;
          width: 0;
          overflow: hidden;
        }

        /* Sidebar Footer - User Profile */
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--line);
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--line);
          transition: all 0.2s;
          position: relative;
        }
        .user-profile:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--line2);
        }
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: grid;
          place-items: center;
          flex-shrink: 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--white);
          letter-spacing: 0.02em;
        }
        .user-info {
          overflow: hidden;
          transition: opacity 0.2s;
          flex: 1;
          min-width: 0;
        }
        .dashboard-sidebar.collapsed .user-info {
          opacity: 0;
          width: 0;
          overflow: hidden;
        }
        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-email {
          font-size: 11px;
          color: var(--muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--line);
          background: transparent;
          cursor: pointer;
          color: var(--muted);
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .logout-btn:hover {
          border-color: #f87171;
          color: #f87171;
          background: rgba(248, 113, 113, 0.1);
        }
        .dashboard-sidebar.collapsed .logout-btn {
          display: none;
        }

        /* Main Content */
        .dashboard-main {
          flex: 1;
          margin-left: 260px;
          transition: margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }
        .dashboard-sidebar.collapsed ~ .dashboard-main {
          margin-left: 72px;
        }

        /* Topbar */
        .dashboard-topbar {
          height: 64px;
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          padding: 0 32px;
          gap: 16px;
          background: var(--bg);
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .sidebar-toggle {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid var(--line);
          background: transparent;
          display: grid;
          place-items: center;
          cursor: pointer;
          color: var(--muted);
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .sidebar-toggle:hover {
          border-color: var(--line2);
          color: var(--dim);
        }
        .topbar-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--white);
          letter-spacing: -0.01em;
        }
        .topbar-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .credit-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg2);
          border: 1px solid var(--line);
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .credit-badge svg {
          width: 14px;
          height: 14px;
          color: #fbbf24;
        }
        .new-boost-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--white);
          color: var(--bg);
          font-family: 'Figtree', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 9px 16px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .new-boost-btn:hover {
          opacity: 0.88;
        }

        /* Content Area */
        .dashboard-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
        }
        .dashboard-content::-webkit-scrollbar {
          width: 6px;
        }
        .dashboard-content::-webkit-scrollbar-thumb {
          background: var(--line2);
          border-radius: 3px;
        }

        @media (max-width: 768px) {
          .dashboard-sidebar {
            transform: translateX(-100%);
          }
          .dashboard-sidebar.mobile-open {
            transform: translateX(0);
          }
          .dashboard-main {
            margin-left: 0 !important;
          }
        }
      `}</style>

      <div className="dashboard-shell">
        {/* Sidebar */}
        <aside
          className={`dashboard-sidebar ${sidebarOpen ? "" : "collapsed"}`}
        >
          {/* Header */}
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="#08090d"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="sidebar-brand">ClipVoBooster</span>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/${item.id}`}
                className={`nav-link ${currentTab === item.id ? "active" : ""}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.icon} />
                </svg>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="sidebar-footer">
            <div className="user-profile">
              <div className="user-avatar">
                {getInitials(user?.name, user?.email)}
              </div>
              <div className="user-info">
                <div className="user-name">
                  {user?.name || user?.email?.split("@")[0] || "User"}
                </div>
                <div className="user-email">{user?.email || ""}</div>
                {user?.subscription && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#10b981",
                      marginTop: "4px",
                      fontWeight: 600,
                    }}
                  >
                    ✅ {user.subscription.planName || user.subscription.plan}{" "}
                    Plan
                  </div>
                )}
              </div>
              <button
                className="logout-btn"
                onClick={handleLogout}
                title="Logout"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="dashboard-main">
          {/* Topbar */}
          <div className="dashboard-topbar">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="topbar-title">
              {NAV_ITEMS.find((n) => n.id === currentTab)?.label || "Dashboard"}
            </span>
            <div className="topbar-right">
              <NotificationBell />
            </div>
          </div>

          {/* Content */}
          <div className="dashboard-content">{children}</div>
        </div>
      </div>
      {/* Hidden element to pass user data to children */}
      <div
        id="user-data"
        data-user-name={user?.name || ""}
        data-user-email={user?.email || ""}
        style={{ display: "none" }}
      />
    </>
  );
}
