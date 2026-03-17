"use client";

import { useRouter } from "next/navigation";

export default function DashboardBoosts() {
  const router = useRouter();

  const boosts = [
    { id: 1, title: "SaaS Landing Page", type: "SaaS", status: "active", views: 4820, clicks: 391, goal: 10000, url: "myapp.io" },
    { id: 2, title: "10X Your Productivity", type: "YouTube", status: "active", views: 2310, clicks: 188, goal: 5000, url: "youtube.com/watch?v=abc" },
    { id: 3, title: "How We Grew to $10K MRR", type: "YouTube", status: "paused", views: 7640, clicks: 512, goal: 8000, url: "youtube.com/watch?v=xyz" },
  ];

  const toggleBoost = (id: number) => {
    // Placeholder - will implement later
    console.log("Toggle boost", id);
  };

  return (
    <>
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
        }

        @keyframes rise { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .rise { animation: rise .6s cubic-bezier(.16,1,.3,1) both; }

        .stats-bar { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .stat-pill {
          background: var(--bg1); border: 1px solid var(--line);
          padding: 12px 20px; border-radius: 10px; font-size: 13px; color: var(--muted);
        }
        .stat-pill strong { color: var(--text); font-weight: 600; }

        .panel { background: var(--bg1); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
        .boost-table { width: 100%; border-collapse: collapse; }
        .boost-table th {
          font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--muted); text-align: left;
          padding: 16px 24px; border-bottom: 1px solid var(--line);
        }
        .boost-table td {
          padding: 20px 24px; border-bottom: 1px solid var(--line);
          vertical-align: middle;
        }
        .boost-table tr:last-child td { border-bottom: none; }
        .boost-table tr:hover td { background: rgba(255,255,255,0.02); }

        .boost-cell { display: flex; align-items: center; gap: 12px; }
        .boost-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: var(--bg3); border: 1px solid var(--line);
          display: grid; place-items: center; font-size: 16px; flex-shrink: 0;
        }
        .boost-name { font-size: 14px; font-weight: 600; color: var(--text); letter-spacing: -0.01em; }
        .boost-url { font-size: 11px; color: var(--muted); margin-top: 2px; }

        .badge {
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 0.07em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 100px; border: 1px solid var(--line);
        }
        .badge-saas { color: #7dd3fc; border-color: rgba(125,211,252,0.2); background: rgba(125,211,252,0.06); }
        .badge-yt { color: #f87171; border-color: rgba(248,113,113,0.2); background: rgba(248,113,113,0.06); }

        .status-row { display: flex; align-items: center; gap: 8px; }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; }
        .status-active { background: #4ade80; }
        .status-paused { background: #facc15; }
        .status-completed { background: var(--muted); }

        .progress-wrap { min-width: 120px; }
        .progress-bar { height: 4px; background: rgba(255,255,255,0.07); border-radius: 2px; overflow: hidden; margin-bottom: 4px; }
        .progress-fill { height: 100%; background: rgba(255,255,255,0.5); border-radius: 2px; }
        .progress-text { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--muted); }

        .btn {
          font-family: 'Figtree', sans-serif; font-size: 12px; font-weight: 500;
          padding: 6px 14px; border-radius: 8px; border: 1px solid var(--line2);
          background: transparent; color: var(--muted); cursor: pointer; transition: all 0.15s;
        }
        .btn:hover { background: rgba(255,255,255,0.05); color: var(--dim); }

        @media (max-width: 768px) {
          .boost-table { font-size: 12px; }
          .boost-table th, .boost-table td { padding: 12px 16px; }
        }
      `}</style>

      <div className="rise">
        <div className="stats-bar">
          <div className="stat-pill"><strong>{boosts.filter(b => b.status === "active").length}</strong> active</div>
          <div className="stat-pill"><strong>{boosts.filter(b => b.status === "paused").length}</strong> paused</div>
          <div className="stat-pill"><strong>{boosts.filter(b => b.status === "completed").length}</strong> completed</div>
        </div>

        <div className="panel rise">
          <table className="boost-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Views</th>
                <th>Progress</th>
                <th>Clicks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {boosts.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="boost-cell">
                      <div className="boost-icon">{b.type === "SaaS" ? "🚀" : "▶"}</div>
                      <div>
                        <div className="boost-name">{b.title}</div>
                        <div className="boost-url">{b.url}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${b.type === "SaaS" ? "badge-saas" : "badge-yt"}`}>{b.type}</span></td>
                  <td>
                    <div className="status-row">
                      <span className={`status-dot status-${b.status}`} />
                      <span style={{ fontSize: 13, color: "var(--muted)", textTransform: "capitalize" }}>{b.status}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{b.views.toLocaleString()}</td>
                  <td>
                    <div className="progress-wrap">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min((b.views / b.goal) * 100, 100)}%` }} />
                      </div>
                      <div className="progress-text">{Math.min(Math.round((b.views / b.goal) * 100), 100)}%</div>
                    </div>
                  </td>
                  <td style={{ fontSize: 14, color: "var(--dim)" }}>{b.clicks.toLocaleString()}</td>
                  <td>
                    {b.status !== "completed" && (
                      <button className="btn" onClick={() => toggleBoost(b.id)}>
                        {b.status === "active" ? "Pause" : "Resume"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
