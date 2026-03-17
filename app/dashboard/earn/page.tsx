"use client";

import { useState } from "react";

const EARN_ITEMS = [
  { title: "LaunchPad Pro", type: "SaaS", desc: "AI landing page builder for founders", credits: 12, time: "~2 min", emoji: "🚀", category: "SaaS" },
  { title: "FramerFlow", type: "SaaS", desc: "No-code animation tool for designers", credits: 10, time: "~3 min", emoji: "🎨", category: "SaaS" },
  { title: "How I Got 50K Subs", type: "YouTube", desc: "by @growthhacker · 14 min video", credits: 18, time: "~5 min", emoji: "▶", category: "YouTube" },
  { title: "Notion for Devs", type: "YouTube", desc: "by @devwithmark · 8 min video", credits: 14, time: "~4 min", emoji: "📝", category: "YouTube" },
  { title: "ShipFast — Boilerplate", type: "SaaS", desc: "Ship your startup in days, not months", credits: 8, time: "~2 min", emoji: "⚡", category: "SaaS" },
  { title: "Cold Email Masterclass", type: "YouTube", desc: "by @b2bpro · 22 min deep dive", credits: 22, time: "~8 min", emoji: "📧", category: "YouTube" },
  { title: "DesignCourse UI Kit", type: "SaaS", desc: "Premium Figma components library", credits: 15, time: "~3 min", emoji: "🎯", category: "SaaS" },
  { title: "Startup Ideas That Work", type: "YouTube", desc: "by @founderstories · 18 min", credits: 20, time: "~6 min", emoji: "💡", category: "YouTube" },
  { title: "ConvertKit Pro", type: "SaaS", desc: "Email marketing for creators", credits: 25, time: "~5 min", emoji: "📬", category: "SaaS" },
];

export default function DashboardEarn() {
  const [earnDone, setEarnDone] = useState<number[]>([]);
  const [credits, setCredits] = useState(1240);
  const [filter, setFilter] = useState<"all" | "SaaS" | "YouTube">("all");
  const [toast, setToast] = useState<string | null>(null);

  const handleEarn = (index: number, creditAmount: number) => {
    if (earnDone.includes(index)) return;
    setEarnDone(prev => [...prev, index]);
    setCredits(prev => prev + creditAmount);
    setToast(`+${creditAmount} credits earned!`);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredItems = EARN_ITEMS.filter(item => filter === "all" || item.category === filter);
  const totalEarnable = EARN_ITEMS.reduce((sum, item) => sum + item.credits, 0);
  const earnedToday = earnDone.reduce((sum, idx) => sum + EARN_ITEMS[idx].credits, 0);

  return (
    <>
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
        }

        @keyframes rise { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(12px) scale(.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        .rise { animation: rise .6s cubic-bezier(.16,1,.3,1) both; }
        .d1{animation-delay:.04s} .d2{animation-delay:.12s} .d3{animation-delay:.20s}

        .balance-card {
          background: linear-gradient(135deg, var(--bg1), var(--bg2));
          border: 1px solid var(--line2);
          border-radius: 16px;
          padding: 28px;
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 24px;
        }
        .balance-icon {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          display: grid; place-items: center;
          flex-shrink: 0;
          box-shadow: 0 8px 24px rgba(251, 191, 36, 0.2);
        }
        .balance-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 6px;
        }
        .balance-value {
          font-size: 36px;
          font-weight: 700;
          color: var(--white);
          letter-spacing: -0.04em;
        }
        .balance-sub {
          font-size: 13px;
          color: var(--muted);
          margin-top: 4px;
        }

        .filter-bar {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .filter-btn {
          padding: 8px 16px;
          border-radius: 100px;
          border: 1px solid var(--line);
          background: var(--bg1);
          color: var(--muted);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .filter-btn:hover {
          border-color: var(--line2);
          color: var(--dim);
        }
        .filter-btn.active {
          background: var(--white);
          color: var(--bg);
          border-color: var(--white);
        }

        .earn-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }
        .earn-card {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 20px;
          transition: all 0.2s;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .earn-card:hover {
          border-color: var(--line2);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .earn-card.done {
          opacity: 0.5;
          cursor: default;
        }
        .earn-card.done:hover {
          transform: none;
        }
        .earn-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .earn-ico {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: var(--bg3);
          border: 1px solid var(--line);
          display: grid; place-items: center;
          font-size: 18px;
        }
        .earn-badge {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          border: 1px solid var(--line);
          padding: 4px 10px;
          border-radius: 100px;
        }
        .earn-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }
        .earn-desc {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .earn-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .earn-cred {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .earn-cred-val {
          font-size: 18px;
          font-weight: 700;
          color: #fbbf24;
          letter-spacing: -0.02em;
        }
        .earn-cred-label {
          font-size: 11px;
          color: var(--muted);
        }
        .earn-time {
          font-size: 12px;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .earn-btn {
          font-family: 'Figtree', sans-serif;
          font-size: 12px;
          font-weight: 600;
          background: var(--white);
          color: var(--bg);
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .earn-btn:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }
        .earn-btn.done-btn {
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
          cursor: default;
        }
        .earn-btn.done-btn:hover {
          transform: none;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .stat-box {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }
        .stat-box-val {
          font-size: 24px;
          font-weight: 700;
          color: var(--white);
        }
        .stat-box-label {
          font-size: 11px;
          color: var(--muted);
          margin-top: 4px;
        }

        .toast {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 200;
          background: var(--bg2);
          border: 1px solid var(--line2);
          border-radius: 12px;
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          animation: toastIn 0.3s cubic-bezier(.16,1,.3,1);
        }
        .toast-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #4ade80;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .earn-grid { grid-template-columns: 1fr; }
          .stats-row { grid-template-columns: 1fr; }
          .balance-card { flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="rise">
        {/* Balance Card */}
        <div className="balance-card rise d1">
          <div className="balance-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="balance-label">Available Credits</div>
            <div className="balance-value">{credits.toLocaleString()}</div>
            <div className="balance-sub">Earn more by completing offers below</div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row rise d2">
          <div className="stat-box">
            <div className="stat-box-val">{EARN_ITEMS.length}</div>
            <div className="stat-box-label">Total Offers</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-val">{totalEarnable}</div>
            <div className="stat-box-label">Total Earnable</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-val" style={{ color: '#4ade80' }}>+{earnedToday}</div>
            <div className="stat-box-label">Earned Today</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar rise d3">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'SaaS' ? 'active' : ''}`}
            onClick={() => setFilter('SaaS')}
          >
            🚀 SaaS
          </button>
          <button
            className={`filter-btn ${filter === 'YouTube' ? 'active' : ''}`}
            onClick={() => setFilter('YouTube')}
          >
            ▶ YouTube
          </button>
        </div>

        {/* Earn Grid */}
        <div className="earn-grid rise">
          {filteredItems.map((item, i) => {
            const originalIndex = EARN_ITEMS.indexOf(item);
            const isDone = earnDone.includes(originalIndex);
            return (
              <div key={i} className={`earn-card ${isDone ? 'done' : ''}`}>
                <div className="earn-top">
                  <div className="earn-ico">{item.emoji}</div>
                  <span className="earn-badge">{item.type}</span>
                </div>
                <div className="earn-title">{item.title}</div>
                <div className="earn-desc">{item.desc}</div>
                <div className="earn-footer">
                  <div>
                    <div className="earn-cred">
                      <span className="earn-cred-val">{item.credits}</span>
                      <span className="earn-cred-label">credits</span>
                    </div>
                    <div className="earn-time">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      {item.time}
                    </div>
                  </div>
                  <button
                    className={`earn-btn ${isDone ? 'done-btn' : ''}`}
                    onClick={() => handleEarn(originalIndex, item.credits)}
                    disabled={isDone}
                  >
                    {isDone ? '✓ Completed' : 'Start'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">
          <div className="toast-dot" />
          {toast}
        </div>
      )}
    </>
  );
}
