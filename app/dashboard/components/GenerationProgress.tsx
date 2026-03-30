"use client";

export default function GenerationProgress({
  stage,
  postsFound,
  batchesAnalyzed,
  totalBatches,
  matchesFound,
  progressPercent,
  message,
}: {
  stage: string;
  postsFound?: number;
  batchesAnalyzed?: number;
  totalBatches?: number;
  matchesFound?: number;
  progressPercent?: number;
  message?: string;
}) {
  const getProgressText = () => {
    if (message) return message;
    if (stage === "fetching") {
      return "📡 Fetching recent Reddit posts...";
    }
    if (stage === "analyzing" && totalBatches) {
      const percent = Math.round((batchesAnalyzed / totalBatches) * 100);
      return `🔍 Analyzing posts... ${batchesAnalyzed}/${totalBatches} (${percent}%) - Found ${matchesFound} potential customers`;
    }
    if (stage === "matching") {
      return `🎯 Found ${matchesFound} potential customers so far...`;
    }
    if (stage === "saving") {
      return "💾 Saving your customers...";
    }
    if (stage === "complete") {
      return `✅ Done! Found ${matchesFound} potential customers!`;
    }
    return "⏳ Starting...";
  };

  const getProgressPercent = () => {
    if (progressPercent) return progressPercent;
    if (stage === "fetching") return 20;
    if (stage === "analyzing" && totalBatches) {
      return 20 + ((batchesAnalyzed || 0) / totalBatches) * 60;
    }
    if (stage === "matching") return 85;
    if (stage === "saving") return 95;
    if (stage === "complete") return 100;
    return 0;
  };

  const getDetails = () => {
    if (stage === "fetching") {
      return "Reading recent posts from business subreddits...";
    }
    if (stage === "analyzing") {
      return `🤖 AI is analyzing each post to see if they need your product. Being very selective - only perfect matches!`;
    }
    if (stage === "matching") {
      return `🎯 Great! Found ${matchesFound} people who might need your product.`;
    }
    if (stage === "saving") {
      return "💾 Almost done! Saving your customer list...";
    }
    return "";
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: 32,
        textAlign: "center",
      }}
    >
      {/* Animated Logo */}
      <div
        style={{
          width: 80,
          height: 80,
          margin: "0 auto 24px",
          position: "relative",
        }}
      >
        {/* Outer rotating ring */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            border: "3px solid rgba(99, 102, 241, 0.2)",
            borderTop: "3px solid #6366f1",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />

        {/* Inner pulsing circle */}
        <div
          style={{
            position: "absolute",
            width: "60%",
            height: "60%",
            top: "20%",
            left: "20%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "50%",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />

        {/* Center icon */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
            fontSize: 32,
          }}
        >
          🎯
        </div>
      </div>

      {/* Progress Text */}
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: "var(--white)",
          marginBottom: 8,
        }}
      >
        {getProgressText()}
      </h2>

      {/* Details */}
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
        {getDetails()}
      </p>

      {/* Progress Bar */}
      <div
        style={{
          width: "100%",
          height: 6,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 3,
          marginTop: 24,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${getProgressPercent()}%`,
            height: "100%",
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginTop: 24,
          padding: "16px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--white)" }}>
            {postsFound || 0}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Posts Found</div>
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--white)" }}>
            {batchesAnalyzed || 0}/{totalBatches || "?"}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Analyzed</div>
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#22c55e" }}>
            {matchesFound || 0}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Matches</div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        :root {
          --bg: #08090d;
          --bg1: #0e1018;
          --line: rgba(255,255,255,0.07);
          --text: #dde1e9;
          --muted: #5a6373;
          --white: #ffffff;
        }
      `}</style>
    </div>
  );
}
