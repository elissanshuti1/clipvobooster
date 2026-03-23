"use client";

import { useEffect, useState } from "react";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [statsRes, visitsRes, pagesRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/analytics/visits"),
        fetch("/api/admin/analytics/pages"),
        fetch("/api/admin/users"),
      ]);

      const stats = await statsRes.json();
      const visits = await visitsRes.json();
      const pages = await pagesRes.json();
      const users = await usersRes.json();

      setAnalytics({ stats, visits, pages, users });
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div style={{ color: "#fff" }}>Loading analytics...</div>;
  }

  return (
    <div>
      <style>{`
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        .analytics-card {
          background: #0e1018;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 24px;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .card-title {
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
        }
        .card-icon {
          font-size: 24px;
        }
        .metric {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .metric:last-child {
          border-bottom: none;
        }
        .metric-label {
          font-size: 13px;
          color: #8b95a5;
        }
        .metric-value {
          font-size: 14px;
          color: #ffffff;
          font-weight: 600;
        }
        .table-container {
          background: #0e1018;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          overflow: hidden;
        }
        .table-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .table-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th {
          text-align: left;
          padding: 14px 24px;
          font-size: 12px;
          font-weight: 600;
          color: #5a6373;
          text-transform: uppercase;
          background: #12151f;
        }
        .data-table td {
          padding: 14px 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
          font-size: 14px;
          color: #dde1e9;
        }
      `}</style>

      {/* Top Metrics */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-header">
            <span className="card-title">User Overview</span>
            <span className="card-icon">👥</span>
          </div>
          <div className="metric">
            <span className="metric-label">Total Users</span>
            <span className="metric-value">{analytics?.stats.totalUsers}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Active (7 days)</span>
            <span className="metric-value">{analytics?.stats.activeUsers}</span>
          </div>
          <div className="metric">
            <span className="metric-label">New Today</span>
            <span className="metric-value">{analytics?.stats.newUsersToday}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Suspended</span>
            <span className="metric-value">{analytics?.stats.suspendedUsers}</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <span className="card-title">Email Performance</span>
            <span className="card-icon">📧</span>
          </div>
          <div className="metric">
            <span className="metric-label">Total Sent</span>
            <span className="metric-value">{analytics?.stats.totalEmailsSent}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Total Clicks</span>
            <span className="metric-value">{analytics?.stats.totalClicks}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Avg Click Rate</span>
            <span className="metric-value">
              {analytics?.stats.totalEmailsSent > 0 
                ? ((analytics?.stats.totalClicks / analytics?.stats.totalEmailsSent) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <span className="card-title">Website Traffic</span>
            <span className="card-icon">👁️</span>
          </div>
          <div className="metric">
            <span className="metric-label">Total Visits</span>
            <span className="metric-value">{analytics?.stats.totalVisits}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Unique Visitors</span>
            <span className="metric-value">{analytics?.visits.uniqueVisitors || 0}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Pages Tracked</span>
            <span className="metric-value">{analytics?.pages.length}</span>
          </div>
        </div>
      </div>

      {/* Page Views Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">📊 Most Visited Pages</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Page Path</th>
              <th>Total Views</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {analytics?.pages.map((page: any, index: number) => {
              const totalViews = analytics.pages.reduce((sum: number, p: any) => sum + p.views, 0);
              const percentage = totalViews > 0 ? ((page.views / totalViews) * 100).toFixed(1) : 0;
              return (
                <tr key={index}>
                  <td>{page.path}</td>
                  <td>{page.views}</td>
                  <td>{percentage}%</td>
                </tr>
              );
            })}
            {!analytics?.pages.length && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", color: "#5a6373", padding: "40px" }}>
                  No page view data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
