"use client";

import { useEffect, useState, useCallback } from "react";
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
  source?: string;
  sourceDetail?: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [savedLeads, setSavedLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    stage: "idle",
    postsFound: 0,
    batchesAnalyzed: 0,
    totalBatches: 0,
    matchesFound: 0,
    progressPercent: 0,
    message: "Getting ready...",
  });

  const loadData = useCallback(async () => {
    try {
      setError(null);
      
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();

      const hasProfileData = !!(
        profileData?.profile?.projectName &&
        profileData?.profile?.projectDescription
      );
      setHasProfile(hasProfileData);

      if (!hasProfileData) {
        setLoading(false);
        return;
      }

      const leadsRes = await fetch("/api/leads");
      const leadsData = await leadsRes.json();

      if (Array.isArray(leadsData)) {
        setSavedLeads(leadsData);
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Failed to load data:", err);
      setError("Failed to load data. Please refresh the page.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateLeads = async () => {
    if (!hasProfile) {
      router.push("/dashboard/profile");
      return;
    }

    setGenerating(true);
    setError(null);
    setProgress({
      stage: "fetching",
      postsFound: 0,
      batchesAnalyzed: 0,
      totalBatches: 0,
      matchesFound: 0,
      progressPercent: 5,
      message: "Starting search...",
    });

    let pollInterval: NodeJS.Timeout | null = null;

    try {
      // Start polling for progress
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch("/api/leads/progress");
          if (res.ok) {
            const data = await res.json();
            setProgress((prev) => ({
              ...prev,
              stage: data.stage || "fetching",
              postsFound: data.postsFound || 0,
              matchesFound: data.matchesFound || 0,
              progressPercent: Math.max(prev.progressPercent, data.progressPercent || 5),
              message: data.progressMessage || data.message || "Working...",
            }));
          }
        } catch (err) {
          console.warn("Progress poll failed:", err);
        }
      }, 800);

      // Single API call does everything
      console.log("📡 Starting lead generation...");
      
      const res = await fetch("/api/leads/auto-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "start" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to find customers. Please try again.");
      }

      const data = await res.json();
      console.log("✅ Done:", data.message, `(${data.newLeadsCount} leads)`);

      // Reload leads
      await loadData();

      const leadCount = data.newLeadsCount || 0;
      
      setProgress({
        stage: "complete",
        postsFound: 0,
        batchesAnalyzed: 0,
        totalBatches: 0,
        matchesFound: leadCount,
        progressPercent: 100,
        message: leadCount > 0 
          ? `Found ${leadCount} potential customers!` 
          : "No matching customers found. Try a different product description.",
      });

    } catch (err: any) {
      console.error("Lead generation failed:", err);
      
      let errorMessage = err.message || "Failed to find customers. Please try again.";
      
      // Check for specific error types
      if (err.message?.includes("NETWORK_ERROR")) {
        errorMessage = "Cannot connect to AI server. This might be a hosting limitation. Try running locally or check your hosting settings.";
      } else if (err.message?.includes("rate-limit") || err.message?.includes("429")) {
        errorMessage = "AI models are busy. Please wait 1-2 minutes and try again.";
      } else if (err.message?.includes("401") || err.message?.includes("API key")) {
        errorMessage = "AI API key issue. Please check your OpenRouter API key configuration.";
      }
      
      setError(errorMessage);
      setProgress((prev) => ({
        ...prev,
        stage: "error",
        message: errorMessage,
      }));
    } finally {
      if (pollInterval) clearInterval(pollInterval);
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

  const deleteAllLeads = async () => {
    if (!confirm("⚠️ Delete ALL customers? This cannot be undone.")) {
      return;
    }

    try {
      await fetch("/api/leads?all=true", { method: "DELETE" });
      setSavedLeads([]);
      loadData();
    } catch (err) {
      console.error("Failed to delete all leads:", err);
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
  const displayLeads = savedLeads.filter((lead) => lead.isToday);

  // Show generation progress FIRST if generating
  if (generating) {
    return (
      <GenerationProgress
        stage={progress.stage}
        postsFound={progress.postsFound}
        batchesAnalyzed={progress.batchesAnalyzed}
        totalBatches={progress.totalBatches}
        matchesFound={progress.matchesFound}
        progressPercent={progress.progressPercent}
        message={progress.message}
      />
    );
  }

  // Show loading spinner (only when not generating)
  if (loading && savedLeads.length === 0) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "50vh",
        color: "#8b95a5"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: "40px auto", padding: 32 }}>
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: 16,
            padding: 32,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h2 style={{ color: "#ef4444", marginBottom: 12 }}>Error</h2>
          <p style={{ color: "#8b95a5", marginBottom: 24 }}>{error}</p>
          <button
            onClick={() => { setError(null); generateLeads(); }}
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show profile completion prompt
  if (!hasProfile) {
    return (
      <div style={{ maxWidth: 600, margin: "40px auto", padding: 32 }}>
        <div
          style={{
            background: "var(--bg1, #0e1018)",
            border: "1px solid rgba(255,255,255,0.08)",
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

          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", marginBottom: 12 }}>
            Complete Your Profile First
          </h2>

          <p style={{ fontSize: 14, color: "#8b95a5", marginBottom: 24, lineHeight: 1.6 }}>
            Our AI needs to understand your product to find potential customers who need it.
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
            }}
          >
            Complete Profile →
          </button>
        </div>
      </div>
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
      `}</style>

      <div>
        <div className="page-header">
          <h1 className="page-title">🎯 Potential Customers</h1>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={deleteAllLeads}
              disabled={savedLeads.length === 0}
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "10px 20px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: savedLeads.length === 0 ? "not-allowed" : "pointer",
                opacity: savedLeads.length === 0 ? 0.5 : 1,
              }}
            >
              🗑️ Delete All
            </button>
            <button
              onClick={generateLeads}
              disabled={generating}
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {generating ? "Finding..." : "🎯 Find Customers"}
            </button>
          </div>
        </div>

        <div
          style={{
            background: "rgba(99, 102, 241, 0.1)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <p style={{ fontSize: 13, color: "#8b95a5", margin: 0 }}>
            <strong>AI-Powered Discovery:</strong> Our AI scans Reddit and Lemmy for people who need your product.
            {todayLeadsCount > 0 ? ` You have ${todayLeadsCount} new matches today!` : " Click 'Find Customers' to discover new leads."}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "var(--bg1, #0e1018)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: 24,
              marginBottom: 0,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 700, color: "#ffffff" }}>
              {todayLeadsCount}
            </div>
            <div style={{ fontSize: 12, color: "#8b95a5" }}>Today</div>
          </div>
          <div
            style={{
              background: "var(--bg1, #0e1018)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: 24,
              marginBottom: 0,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 700, color: "#22c55e" }}>
              {displayLeads.filter((l) => l.status === "contacted").length}
            </div>
            <div style={{ fontSize: 12, color: "#8b95a5" }}>Contacted</div>
          </div>
          <div
            style={{
              background: "var(--bg1, #0e1018)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: 24,
              marginBottom: 0,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 700, color: "#22c55e" }}>
              {displayLeads.filter((l) => l.status === "converted").length}
            </div>
            <div style={{ fontSize: 12, color: "#8b95a5" }}>Converted</div>
          </div>
        </div>

        <div
          style={{
            background: "var(--bg1, #0e1018)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: 24,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#ffffff", marginBottom: 16 }}>
            {todayLeadsCount > 0 ? `Today's Matches (${todayLeadsCount})` : "No Leads Today"}
          </h3>

          {displayLeads.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#8b95a5" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
              <p style={{ marginBottom: 16 }}>
                {savedLeads.length > 0
                  ? "You have older leads but no new ones today."
                  : "No customers found yet. Click the button above to find customers."}
              </p>
              <button
                onClick={generateLeads}
                disabled={generating}
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {generating ? "Finding..." : "Find Customers Now"}
              </button>
            </div>
          ) : (
            displayLeads.map((lead) => (
              <div
                key={lead._id}
                style={{
                  background: "var(--bg2, #12151f)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>
                      {lead.title}
                    </span>
                    {lead.isToday && (
                      <span
                        style={{
                          display: "inline-block",
                          marginLeft: 8,
                          padding: "2px 8px",
                          borderRadius: 100,
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          background: "rgba(34, 197, 94, 0.15)",
                          color: "#22c55e",
                        }}
                      >
                        Today
                      </span>
                    )}
                    <span
                      style={{
                        display: "inline-block",
                        marginLeft: 8,
                        padding: "2px 8px",
                        borderRadius: 100,
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        background: lead.status === "contacted" ? "rgba(251, 191, 36, 0.15)" : "rgba(99, 102, 241, 0.15)",
                        color: lead.status === "contacted" ? "#fbbf24" : "#6366f1",
                      }}
                    >
                      {lead.status}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "#8b95a5", marginBottom: 8 }}>
                  u/{lead.author} {lead.sourceDetail || `in r/${lead.subreddit}`} •{" "}
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>

                {lead.aiMatchReason && (
                  <div
                    style={{
                      background: "rgba(99, 102, 241, 0.1)",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      marginBottom: 12,
                      fontSize: 12,
                      color: "#a5b4fc",
                    }}
                  >
                    <strong>🤖 AI Match:</strong> {lead.aiMatchReason}
                  </div>
                )}

                {lead.content && (
                  <div style={{ fontSize: 13, color: "#8b95a5", lineHeight: 1.5, marginBottom: 12 }}>
                    {lead.content.replace(/<[^>]*>/g, "").slice(0, 200)}...
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <a
                    href={lead.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      background: "var(--bg3, #181c27)",
                      color: "#dde1e9",
                      border: "1px solid rgba(255,255,255,0.13)",
                      textDecoration: "none",
                    }}
                  >
                    View Post ↗
                  </a>

                  <select
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      background: "var(--bg3, #181c27)",
                      color: "#dde1e9",
                      border: "1px solid rgba(255,255,255,0.13)",
                      cursor: "pointer",
                    }}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="ignored">Ignored</option>
                  </select>

                  <button
                    onClick={() => deleteLead(lead._id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      background: "rgba(248, 113, 113, 0.1)",
                      color: "#f87171",
                      border: "1px solid rgba(248, 113, 113, 0.3)",
                      cursor: "pointer",
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

      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
        }
      `}</style>
    </>
  );
}
