"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVisits: 0,
    totalEmailsSent: 0,
    totalClicks: 0,
    activeUsers: 0,
    newUsersToday: 0,
    suspendedUsers: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [pageViews, setPageViews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, usersRes, pagesRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users/recent"),
        fetch("/api/admin/analytics/pages"),
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const pagesData = await pagesRes.json();

      setStats(statsData);
      setRecentUsers(usersData);
      setPageViews(pagesData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
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

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "#6366f1" },
    { label: "Total Visits", value: stats.totalVisits, icon: "👁️", color: "#8b5cf6" },
    { label: "Emails Sent", value: stats.totalEmailsSent, icon: "📧", color: "#10b981" },
    { label: "Link Clicks", value: stats.totalClicks, icon: "🖱️", color: "#f59e0b" },
    { label: "Active Users", value: stats.activeUsers, icon: "✅", color: "#3b82f6" },
    { label: "New Today", value: stats.newUsersToday, icon: "🆕", color: "#ec4899" },
  ];

  return (
    <div>
      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: #0e1018;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 24px;
        }
        .stat-icon {
          font-size: 28px;
          margin-bottom: 12px;
        }
        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 13px;
          color: #5a6373;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        .dashboard-card {
          background: #0e1018;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 24px;
        }
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 16px;
        }
        .user-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .user-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .user-item:last-child {
          border-bottom: none;
        }
        .user-avatar-sm {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }
        .user-info {
          flex: 1;
        }
        .user-name {
          font-size: 13px;
          color: #ffffff;
          font-weight: 500;
        }
        .user-email {
          font-size: 12px;
          color: #5a6373;
        }
        .user-status {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        .page-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .page-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .page-name {
          font-size: 13px;
          color: #dde1e9;
        }
        .page-count {
          font-size: 12px;
          color: #5a6373;
          background: #12151f;
          padding: 4px 10px;
          border-radius: 6px;
        }
        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent Users */}
        <div className="dashboard-card">
          <h2 className="card-title">🕐 Recent Sign Ups</h2>
          <ul className="user-list">
            {recentUsers.map((user: any) => (
              <li key={user._id} className="user-item">
                <div className="user-avatar-sm">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.name || "User"}</div>
                  <div className="user-email">{user.email}</div>
                </div>
                <div className="user-status">Active</div>
              </li>
            ))}
            {recentUsers.length === 0 && (
              <li style={{ color: "#5a6373", textAlign: "center", padding: "20px" }}>
                No recent users
              </li>
            )}
          </ul>
        </div>

        {/* Most Visited Pages */}
        <div className="dashboard-card">
          <h2 className="card-title">📊 Most Visited Pages</h2>
          <ul className="page-list">
            {pageViews.map((page: any) => (
              <li key={page.path} className="page-item">
                <span className="page-name">{page.path}</span>
                <span className="page-count">{page.views} visits</span>
              </li>
            ))}
            {pageViews.length === 0 && (
              <li style={{ color: "#5a6373", textAlign: "center", padding: "20px" }}>
                No page view data
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
