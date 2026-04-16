"use client";

import { useState, useEffect } from "react";

interface GenerationProgressProps {
  stage: string;
  postsFound?: number;
  batchesAnalyzed?: number;
  totalBatches?: number;
  matchesFound?: number;
  progressPercent?: number;
  message?: string;
}

const ENCOURAGING_MESSAGES = [
  "We're finding people who need your product...",
  "Great things take time - we're analyzing thoroughly...",
  "Your next customers might be right here...",
  "Each match is carefully vetted for quality...",
  "Finding the perfect fit for your product...",
  "Almost there - great leads take a moment...",
  "Scanning communities for potential customers...",
  "Quality leads are worth the wait...",
  "Your AI assistant is working hard...",
  "Discovering hidden opportunities...",
];

const TIPS_MESSAGES = [
  "💡 Tip: The more specific your product description, the better matches you'll find.",
  "💡 Tip: Include what problem your product solves for better results.",
  "💡 Tip: People on Reddit are actively looking for solutions like yours.",
  "💡 Tip: High-quality leads take time but convert better.",
];

export default function GenerationProgress({
  stage,
  postsFound,
  batchesAnalyzed,
  totalBatches,
  matchesFound,
  progressPercent,
  message,
}: GenerationProgressProps) {
  const [displayMessage, setDisplayMessage] = useState(ENCOURAGING_MESSAGES[0]);
  const [tipMessage, setTipMessage] = useState(TIPS_MESSAGES[0]);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 400);

    const messageInterval = setInterval(() => {
      setDisplayMessage(
        ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)]
      );
      setTipMessage(
        TIPS_MESSAGES[Math.floor(Math.random() * TIPS_MESSAGES.length)]
      );
    }, 5000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(messageInterval);
    };
  }, []);

  const getProgressText = () => {
    if (message) return message;
    if (stage === "fetching") {
      return "Scanning communities for potential customers...";
    }
    if (stage === "analyzing" && totalBatches) {
      return `AI is analyzing posts for your product...`;
    }
    if (stage === "complete") {
      return `Found ${matchesFound} potential customers!`;
    }
    return "Finding your perfect customers...";
  };

  const getProgressPercent = () => {
    if (progressPercent) return progressPercent;
    if (stage === "fetching") return 25;
    if (stage === "analyzing" && totalBatches) {
      return 25 + ((batchesAnalyzed || 0) / totalBatches) * 60;
    }
    if (stage === "complete") return 100;
    return 10;
  };

  const getStageEmoji = () => {
    if (stage === "complete") return "🎉";
    if (stage === "analyzing") return "🤖";
    if (stage === "fetching") return "📡";
    return "🎯";
  };

  const currentProgress = getProgressPercent();

  return (
    <div
      style={{
        maxWidth: 650,
        margin: "40px auto",
        padding: 32,
        textAlign: "center",
      }}
    >
      {/* Animated Logo */}
      <div
        style={{
          width: 100,
          height: 100,
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
            border: "4px solid rgba(99, 102, 241, 0.15)",
            borderTop: "4px solid #6366f1",
            borderRight: "4px solid #8b5cf6",
            borderRadius: "50%",
            animation: "spin 1.5s linear infinite",
          }}
        />

        {/* Progress arc */}
        <svg
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transform: "rotate(-90deg)",
          }}
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(99, 102, 241, 0.3)"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeDasharray={`${currentProgress * 2.89} 289`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Inner pulsing circle */}
        <div
          style={{
            position: "absolute",
            width: "70%",
            height: "70%",
            top: "15%",
            left: "15%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulse 2s ease-in-out infinite",
            boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)",
          }}
        >
          <span style={{ fontSize: 36 }}>{getStageEmoji()}</span>
        </div>
      </div>

      {/* Main Progress Text */}
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#ffffff",
          marginBottom: 8,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {getProgressText()}{dots}
      </h2>

      {/* Percentage */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 16,
          fontFamily: "'Instrument Serif', serif",
        }}
      >
        {Math.round(currentProgress)}%
      </div>

      {/* Rotating Encouraging Message */}
      <div
        style={{
          fontSize: 15,
          color: "#a5b4fc",
          marginBottom: 8,
          minHeight: 24,
          fontStyle: "italic",
        }}
      >
        {displayMessage}
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: "100%",
          height: 8,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 4,
          marginTop: 24,
          marginBottom: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${currentProgress}%`,
            height: "100%",
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            borderRadius: 4,
            transition: "width 0.5s ease",
            boxShadow: "0 0 10px rgba(99, 102, 241, 0.5)",
          }}
        />
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginTop: 32,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#ffffff",
              fontFamily: "'Instrument Serif', serif",
            }}
          >
            {postsFound || 0}
          </div>
          <div style={{ fontSize: 12, color: "#8b95a5", marginTop: 4 }}>
            Posts Scanned
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#ffffff",
              fontFamily: "'Instrument Serif', serif",
            }}
          >
            {batchesAnalyzed || 0}/{totalBatches || "?"}
          </div>
          <div style={{ fontSize: 12, color: "#8b95a5", marginTop: 4 }}>
            Batches Analyzed
          </div>
        </div>

        <div
          style={{
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: 16,
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#22c55e",
              fontFamily: "'Instrument Serif', serif",
            }}
          >
            {matchesFound || 0}
          </div>
          <div style={{ fontSize: 12, color: "#8b95a5", marginTop: 4 }}>
            Matches Found
          </div>
        </div>
      </div>

      {/* Tip Box */}
      <div
        style={{
          background: "rgba(99, 102, 241, 0.08)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          borderRadius: 12,
          padding: 16,
          fontSize: 13,
          color: "#8b95a5",
          lineHeight: 1.6,
        }}
      >
        {tipMessage}
      </div>

      {/* Why this takes time */}
      {stage !== "complete" && (
        <div
          style={{
            marginTop: 24,
            fontSize: 12,
            color: "#5a6373",
          }}
        >
          ⚡ This uses free AI models which may take longer but keeps your costs at zero
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
          }
          50% { 
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
