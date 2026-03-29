"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GenerationProgress from "../components/GenerationProgress";

interface Lead {
  _id: string;
  title: string;
  author: string;
  subreddit: string;
  url: string;
  content: string;
  publishedAt: string;
  notes: string;
  aiMatchReason?: string;
  status: string;
  createdAt: string;
  isToday: boolean;
}

export default function CustomersPage() {
  const router = useRouter();
  const [savedLeads, setSavedLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [progress, setProgress] = useState({
    stage: "fetching",
    postsFound: 0,
    batchesAnalyzed: 0,
    totalBatches: 0,
    matchesFound: 0,
  });

  // Load leads and check profile on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();

      console.log("📋 Profile data:", profileData);

      const hasProfileData = !!(
        profileData?.profile?.projectName &&
        profileData?.profile?.projectDescription
      );
      setHasProfile(hasProfileData);

      if (!hasProfileData) {
        setLoading(false);
        return;
      }

      // Load leads
      const leadsRes = await fetch("/api/leads");
      const leadsData = await leadsRes.json();

      console.log("📊 Loaded leads:", leadsData?.length || 0);

      if (Array.isArray(leadsData)) {
        setSavedLeads(leadsData);

        // Check if we need to auto-generate (if no leads at all)
        if (leadsData.length === 0) {
          // Auto-generate on first visit - pass hasProfileData directly since state isn't updated yet
          console.log("🎯 No leads, generating...");
          generateLeads(hasProfileData);
        } else {
          console.log("✅ Has leads, showing page");
          setLoading(false);
        }
      } else {
        console.log("⚠️ Leads data is not an array");
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setLoading(false);
    }
  };

  const generateLeads = async (profileCheck = null) => {
    // Use passed value or fall back to state
    const hasProf = profileCheck !== null ? profileCheck : hasProfile;

    if (!hasProf) {
      router.push("/dashboard/profile");
      return;
    }

    setGenerating(true);
    setLoading(true);
    setProgress({
      stage: "fetching",
      postsFound: 0,
      batchesAnalyzed: 0,
      totalBatches: 0,
      matchesFound: 0,
    });

    // Start polling for progress AFTER API starts (500ms delay)
    const pollInterval = setTimeout(() => {
      const interval = setInterval(async () => {
        try {
          const res = await fetch("/api/leads/progress");
          if (res.ok) {
            const data = await res.json();
            setProgress({
              stage: data.stage || "fetching",
              postsFound: data.postsFound || 0,
              batchesAnalyzed: data.batchesAnalyzed || 0,
              totalBatches: data.totalBatches || 0,
              matchesFound: data.matchesFound || 0,
            });
          }
        } catch (err) {
          console.error("Failed to poll progress:", err);
        }
      }, 800); // Poll every 800ms

      // Stop polling after 2 minutes
      setTimeout(() => clearInterval(interval), 120000);
    }, 500);

    // Add timeout - if takes more than 2 minutes, show error
    const timeoutId = setTimeout(() => {
      clearTimeout(pollInterval);
      setGenerating(false);
      setLoading(false);
      alert(
        "⏱️ Customer discovery is taking longer than expected. Please try again.",
      );
    }, 120000);

    try {
      const res = await fetch("/api/leads/auto-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        clearTimeout(pollInterval);
        clearTimeout(timeoutId);
        setProgress({
          stage: "complete",
          ...progress,
          matchesFound: data.newLeadsCount,
        });

        // Reload leads
        const leadsRes = await fetch("/api/leads");
        const leadsData = await leadsRes.json();
        setSavedLeads(leadsData || []);

        if (data.newLeadsCount > 0) {
          setTimeout(() => {
            alert(`🎯 Found ${data.newLeadsCount} potential customers!`);
          }, 500);
        } else {
          setTimeout(() => {
            alert(
              "📊 No matching customers found. Try again with more specific product description.",
            );
          }, 500);
        }
      } else {
        clearTimeout(pollInterval);
        clearTimeout(timeoutId);
        if (data.error?.includes("Profile incomplete")) {
          router.push("/dashboard/profile");
        } else {
          alert("❌ " + (data.error || "Failed to find customers"));
        }
      }
    } catch (err) {
      clearTimeout(pollInterval);
      clearTimeout(timeoutId);
      console.error("Failed to generate leads:", err);
      alert("❌ Failed to find customers. Please try again.");
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      console.error("Failed to delete lead:", err);
    }
  };

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      loadData();
    } catch (err) {
      console.error("Failed to update lead:", err);
    }
  };

  const todayLeadsCount = savedLeads.filter((lead) => lead.isToday).length;

  // Show only today's leads in the main list (not old ones)
  const displayLeads = savedLeads.filter((lead) => lead.isToday);

  // If user doesn't have profile, show blocker screen
  if (!hasProfile && !loading && !generating) {
    return (
      <>
        <style>{`
          :root {
            --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
            --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
            --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
          }
        `}</style>

        <div style={{ maxWidth: 600, margin: "40px auto", padding: 40 }}>
          <div
            style={{
              background: "var(--bg1)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: 40,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 20px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                fontSize: 28,
              }}
            >
              📝
            </div>

            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--white)",
                marginBottom: 12,
              }}
            >
              Complete Your Profile First
            </h2>

            <p
              style={{
                fontSize: 14,
                color: "var(--muted)",
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              Our AI needs to understand your product to find potential
              customers who need it.
            </p>

            <button
              onClick={() => router.push("/dashboard/profile")}
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Complete Profile →
            </button>
          </div>
        </div>
      </>
    );
  }

  // Show loading state while generating
  if (generating || (loading && savedLeads.length === 0)) {
    return (
      <GenerationProgress
        stage={generating ? progress.stage : "fetching"}
        postsFound={progress.postsFound}
        batchesAnalyzed={progress.batchesAnalyzed}
        totalBatches={progress.totalBatches}
        matchesFound={progress.matchesFound}
      />
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

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--white);
        }

        .card {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }

        .btn-primary:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: var(--bg2);
          color: var(--text);
          border: 1px solid var(--line);
        }

        .btn-secondary:hover {
          background: var(--bg3);
        }

        .post-item {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 12px;
          transition: border-color 0.2s;
        }

        .post-item:hover {
          border-color: var(--line2);
        }

        .post-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--white);
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .post-meta {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .post-content {
          font-size: 13px;
          color: var(--dim);
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .ai-match-box {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 8px;
          padding: 10px 12px;
          margin-bottom: 12px;
          font-size: 12px;
          color: #a5b4fc;
        }

        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge-today {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .badge-new {
          background: rgba(99, 102, 241, 0.15);
          color: #6366f1;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .badge-contacted {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--muted);
        }

        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .info-banner {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .info-banner p {
          font-size: 13px;
          color: var(--dim);
          line-height: 1.6;
          margin: 0;
        }
      `}</style>

      <div>
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">🎯 Potential Customers</h1>
          <button
            className="btn btn-primary"
            onClick={generateLeads}
            disabled={generating || !hasProfile}
          >
            {generating ? "Finding..." : "🎯 Find Customers"}
          </button>
        </div>

        {/* Info Banner */}
        <div className="info-banner">
          <p>
            <strong>AI-Powered Discovery:</strong> Our AI reads recent Reddit
            posts and analyzes them to find people who need your product.
            {todayLeadsCount > 0 &&
              ` You have ${todayLeadsCount} new matches today!`}
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            className="card"
            style={{ marginBottom: 0, textAlign: "center" }}
          >
            <div
              style={{ fontSize: 32, fontWeight: 700, color: "var(--white)" }}
            >
              {todayLeadsCount}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Today</div>
          </div>
          <div
            className="card"
            style={{ marginBottom: 0, textAlign: "center" }}
          >
            <div style={{ fontSize: 32, fontWeight: 700, color: "#22c55e" }}>
              {displayLeads.filter((l) => l.status === "contacted").length}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Contacted</div>
          </div>
          <div
            className="card"
            style={{ marginBottom: 0, textAlign: "center" }}
          >
            <div style={{ fontSize: 32, fontWeight: 700, color: "#22c55e" }}>
              {displayLeads.filter((l) => l.status === "converted").length}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Converted</div>
          </div>
        </div>

        {/* Leads List */}
        <div className="card">
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--white)",
              marginBottom: 16,
            }}
          >
            {todayLeadsCount > 0
              ? `Today's Matches (${todayLeadsCount})`
              : `No Leads Today`}
          </h3>

          {displayLeads.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎯</div>
              <p style={{ marginBottom: 16 }}>
                {savedLeads.length > 0
                  ? "You have older leads but no new ones today"
                  : "No customers found yet"}
              </p>
              <button
                className="btn btn-primary"
                onClick={generateLeads}
                disabled={generating}
              >
                {generating ? "Finding..." : "Find Customers Now"}
              </button>
            </div>
          ) : (
            displayLeads.map((lead) => (
              <div key={lead._id} className="post-item">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: 8,
                  }}
                >
                  <div className="post-title" style={{ flex: 1 }}>
                    {lead.title}
                    {lead.isToday && (
                      <span
                        className="badge badge-today"
                        style={{ marginLeft: 8 }}
                      >
                        Today
                      </span>
                    )}
                    <span
                      className={`badge badge-${lead.status}`}
                      style={{ marginLeft: 8 }}
                    >
                      {lead.status}
                    </span>
                  </div>
                </div>

                <div className="post-meta">
                  u/{lead.author} in r/{lead.subreddit} •{" "}
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>

                {lead.aiMatchReason && (
                  <div className="ai-match-box">
                    <strong>🤖 AI Match:</strong> {lead.aiMatchReason}
                  </div>
                )}

                {lead.content && (
                  <div className="post-content">
                    {lead.content.replace(/<[^>]*>/g, "").slice(0, 200)}...
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 12,
                  }}
                >
                  <a
                    href={lead.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: "6px 12px", fontSize: 13 }}
                  >
                    View Post ↗
                  </a>

                  <select
                    className="btn btn-secondary"
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                    style={{
                      padding: "6px 12px",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="ignored">Ignored</option>
                  </select>

                  <button
                    className="btn btn-secondary"
                    onClick={() => deleteLead(lead._id)}
                    style={{
                      padding: "6px 12px",
                      fontSize: 13,
                      background: "rgba(248, 113, 113, 0.1)",
                      color: "#f87171",
                      border: "1px solid rgba(248, 113, 113, 0.3)",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
