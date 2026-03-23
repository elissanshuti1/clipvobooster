"use client";

import { useState, useEffect } from "react";

export default function AdminAIInsights() {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInsights = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/admin/ai-insights", {
        method: "POST",
      });
      const data = await res.json();
      setInsights(data);
    } catch (error) {
      console.error("Failed to generate insights:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Load basic stats first
    loadBasicStats();
  }, []);

  const loadBasicStats = async () => {
    try {
      const res = await fetch("/api/admin/insights-data");
      const data = await res.json();
      setInsights(data);
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div style={{ color: "#fff" }}>Loading insights...</div>;
  }

  return (
    <div>
      <style>{`
        .insights-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .generate-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .generate-btn:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }
        .generate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        .insight-card {
          background: #0e1018;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 24px;
        }
        .insight-icon {
          font-size: 28px;
          margin-bottom: 12px;
        }
        .insight-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 12px;
        }
        .insight-content {
          font-size: 14px;
          color: #dde1e9;
          line-height: 1.6;
        }
        .insight-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .insight-list li {
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 14px;
          color: #dde1e9;
        }
        .insight-list li:last-child {
          border-bottom: none;
        }
        .recommendation-tag {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          margin-right: 6px;
          margin-bottom: 6px;
        }
      `}</style>

      <div className="insights-header">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#fff", margin: 0 }}>
            🤖 AI-Powered Insights
          </h1>
          <p style={{ fontSize: 13, color: "#5a6373", margin: "4px 0 0 0" }}>
            AI analysis of your users and recommendations for improvement
          </p>
        </div>
        <button
          className="generate-btn"
          onClick={generateInsights}
          disabled={isGenerating}
        >
          {isGenerating ? "Analyzing..." : "🔄 Generate New Insights"}
        </button>
      </div>

      {insights ? (
        <div className="insights-grid">
          {/* User Engagement */}
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <h3 className="insight-title">User Engagement Analysis</h3>
            <div className="insight-content">
              <ul className="insight-list">
                <li>• Total Users: <strong>{insights.totalUsers}</strong></li>
                <li>• Active Users (7 days): <strong>{insights.activeUsers}</strong></li>
                <li>• Avg Emails per User: <strong>{insights.avgEmailsPerUser?.toFixed(1)}</strong></li>
                <li>• Click-through Rate: <strong>{insights.clickThroughRate?.toFixed(1)}%</strong></li>
              </ul>
            </div>
          </div>

          {/* Popular Features */}
          <div className="insight-card">
            <div className="insight-icon">⭐</div>
            <h3 className="insight-title">Most Used Features</h3>
            <div className="insight-content">
              <ul className="insight-list">
                {insights.popularFeatures?.map((feature: string, i: number) => (
                  <li key={i}>• {feature}</li>
                ))}
                {!insights.popularFeatures?.length && (
                  <li>• Compose Email</li>
                )}
              </ul>
            </div>
          </div>

          {/* User Retention */}
          <div className="insight-card">
            <div className="insight-icon">🔄</div>
            <h3 className="insight-title">Retention Insights</h3>
            <div className="insight-content">
              <ul className="insight-list">
                <li>• New Users Today: <strong>{insights.newUsersToday || 0}</strong></li>
                <li>• Returning Users: <strong>{insights.returningUsers || 0}</strong></li>
                <li>• User Growth: <strong>{insights.userGrowth || 0}%</strong></li>
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="insight-card">
            <div className="insight-icon">💡</div>
            <h3 className="insight-title">AI Recommendations</h3>
            <div className="insight-content">
              {insights.recommendations?.map((rec: string, i: number) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <span className="recommendation-tag">Tip {i + 1}</span>
                  <span>{rec}</span>
                </div>
              ))}
              {!insights.recommendations?.length && (
                <p style={{ color: "#8b95a5" }}>
                  Click "Generate New Insights" to get AI-powered recommendations
                </p>
              )}
            </div>
          </div>

          {/* Improvement Areas */}
          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <h3 className="insight-title">Growth Opportunities</h3>
            <div className="insight-content">
              <ul className="insight-list">
                {insights.improvementAreas?.map((area: string, i: number) => (
                  <li key={i}>• {area}</li>
                ))}
                {!insights.improvementAreas?.length && (
                  <>
                    <li>• Add more email templates</li>
                    <li>• Improve onboarding flow</li>
                    <li>• Add A/B testing for emails</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* User Feedback Summary */}
          <div className="insight-card">
            <div className="insight-icon">💬</div>
            <h3 className="insight-title">User Behavior Summary</h3>
            <div className="insight-content">
              <p style={{ color: "#dde1e9", lineHeight: 1.8 }}>
                {insights.userBehaviorSummary || 
                  "Users are actively using the email composition feature. Consider adding more templates and improving the contact management system for better user experience."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px", color: "#5a6373" }}>
          <p>Click "Generate New Insights" to analyze your platform data</p>
        </div>
      )}
    </div>
  );
}
