"use client";

import { useState, useEffect } from "react";

interface Campaign {
  _id: string;
  subject: string;
  type: string;
  sentCount: number;
  opens: number;
  clicks: number;
  createdAt: string;
}

export default function AdminEmailCampaigns() {
  const [tab, setTab] = useState<"create" | "campaigns">("create");
  const [emailType, setEmailType] = useState("welcome");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [ctaText, setCtaText] = useState("Try It Free");
  const [customPrompt, setCustomPrompt] = useState("");
  const [targetPlan, setTargetPlan] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(true);
  const [stats, setStats] = useState({ sent: 0, opens: 0, clicks: 0 });

  useEffect(() => {
    loadCampaigns();
    loadUsers();
  }, []);

  const loadCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const res = await fetch("/api/admin/marketing-campaigns");
      const data = await res.json();
      setCampaigns(data.campaigns || []);
      
      const totalSent = data.campaigns?.reduce((acc: number, c: Campaign) => acc + (c.sentCount || 0), 0) || 0;
      const totalOpens = data.campaigns?.reduce((acc: number, c: Campaign) => acc + (c.opens || 0), 0) || 0;
      const totalClicks = data.campaigns?.reduce((acc: number, c: Campaign) => acc + (c.clicks || 0), 0) || 0;
      setStats({ sent: totalSent, opens: totalOpens, clicks: totalClicks });
    } catch (error) {
      console.error("Failed to load campaigns:", error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.filter((u: any) => !u.isSuspended));
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/admin/ai-marketing-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: emailType, customPrompt }),
      });

      const data = await res.json();
      if (data.subject) {
        setSubject(data.subject);
        setEmailBody(data.body);
        setCtaText(data.cta || "Try It Free");
      }
    } catch (error) {
      console.error("Failed to generate:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    const recipientCount = sendToAll ? users.length : selectedUsers.length;
    if (recipientCount === 0) {
      alert("Please select recipients");
      return;
    }
    if (!subject.trim() || !emailBody.trim()) {
      alert("Please generate or enter email content");
      return;
    }

    if (!confirm(`Send to ${recipientCount} users?`)) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/admin/send-marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body: emailBody,
          ctaText,
          type: emailType,
          sendToAll,
          userIds: selectedUsers,
          targetPlan,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Sent to ${data.sentCount} users!`);
        setSubject("");
        setEmailBody("");
        setCtaText("Try It Free");
        setSelectedUsers([]);
        loadCampaigns();
      } else {
        alert(data.error || "Failed to send");
      }
    } catch (error) {
      alert("Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = targetPlan === "all" 
    ? users 
    : users.filter((u: any) => u.subscription?.plan === targetPlan);

  return (
    <div>
      <style>{`
        .page-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding-bottom: 16px;
        }
        .tab {
          padding: 10px 20px;
          background: #12151f;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #8b95a5;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .tab.active {
          background: #6366f1;
          border-color: #6366f1;
          color: white;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: #0e1018;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
        }
        .stat-label {
          font-size: 13px;
          color: #5a6373;
          margin-top: 4px;
        }
        .campaign-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .card {
          background: #0e1018;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 24px;
        }
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 20px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          display: block;
          font-size: 13px;
          color: #8b95a5;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 12px 14px;
          background: #12151f;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          font-family: inherit;
          box-sizing: border-box;
        }
        .form-textarea {
          min-height: 180px;
          resize: vertical;
        }
        .form-select:focus, .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #6366f1;
        }
        .btn {
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: #1a1d29;
          color: #dde1e9;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .btn-secondary:hover {
          background: #242838;
        }
        .check-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
        }
        .checkbox {
          width: 18px;
          height: 18px;
          accent-color: #6366f1;
        }
        .user-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          margin-top: 8px;
        }
        .user-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          transition: background 0.2s;
        }
        .user-item:hover {
          background: #1a1d29;
        }
        .user-item.selected {
          background: rgba(99, 102, 241, 0.15);
        }
        .campaign-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .campaign-item {
          background: #0e1018;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 16px;
        }
        .campaign-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .campaign-subject {
          font-weight: 600;
          color: #fff;
          font-size: 15px;
        }
        .campaign-type {
          font-size: 11px;
          padding: 4px 8px;
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          border-radius: 4px;
        }
        .campaign-stats {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #5a6373;
        }
        .campaign-stat {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .campaign-stat.sent { color: #6366f1; }
        .campaign-stat.opens { color: #10b981; }
        .campaign-stat.clicks { color: #f59e0b; }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .campaign-container {
            grid-template-columns: 1fr;
          }
          .page-tabs {
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="page-tabs">
        <button className={`tab ${tab === "create" ? "active" : ""}`} onClick={() => setTab("create")}>
          📧 Create Campaign
        </button>
        <button className={`tab ${tab === "campaigns" ? "active" : ""}`} onClick={() => setTab("campaigns")}>
          📊 Campaign History
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.sent}</div>
          <div className="stat-label">Emails Sent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.opens}</div>
          <div className="stat-label">Opens</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.clicks}</div>
          <div className="stat-label">Clicks</div>
        </div>
      </div>

      {tab === "create" && (
        <div className="campaign-container">
          <div className="card">
            <h2 className="card-title">📬 Recipients</h2>

            <div className="form-group">
              <label className="form-label">Target Plan</label>
              <select className="form-select" value={targetPlan} onChange={(e) => setTargetPlan(e.target.value)}>
                <option value="all">All Users</option>
                <option value="no plan">No Plan</option>
                <option value="starter">Starter Plan</option>
                <option value="professional">Professional Plan</option>
                <option value="business">Business Plan</option>
              </select>
            </div>

            <div className="check-row">
              <input type="checkbox" className="checkbox" checked={sendToAll} onChange={(e) => setSendToAll(e.target.checked)} />
              <span style={{ color: "#dde1e9" }}>Send to ALL {targetPlan === "all" ? "" : `${targetPlan} `}({filteredUsers.length})</span>
            </div>

            {!sendToAll && (
              <div className="user-list">
                {filteredUsers.slice(0, 50).map((user: any) => (
                  <label key={user._id} className={`user-item ${selectedUsers.includes(user._id) ? "selected" : ""}`}>
                    <input type="checkbox" className="checkbox" checked={selectedUsers.includes(user._id)} onChange={() => toggleUser(user._id)} />
                    <div>
                      <div style={{ color: "#fff", fontSize: 14 }}>{user.name || "User"}</div>
                      <div style={{ color: "#5a6373", fontSize: 12 }}>{user.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div style={{ marginTop: 12, color: "#5a6373", fontSize: 13 }}>
              Will send to: <span style={{ color: "#fff" }}>{sendToAll ? filteredUsers.length : selectedUsers.length} users</span>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">✉️ Email Content</h2>

            <div className="form-group">
              <label className="form-label">Email Type</label>
              <select className="form-select" value={emailType} onChange={(e) => setEmailType(e.target.value)}>
                <option value="welcome">👋 Welcome Email</option>
                <option value="upgrade">⬆️ Upgrade to Pro</option>
                <option value="feature">🚀 New Feature Alert</option>
                <option value="reengage">💫 We Miss You</option>
                <option value="custom">📝 Custom Email</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Custom Prompt (optional)</label>
              <input className="form-input" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Describe what you want in the email..." />
            </div>

            <button className="btn btn-secondary" style={{ width: "100%", marginBottom: 16 }} onClick={handleGenerateWithAI} disabled={isGenerating}>
              {isGenerating ? "🤖 Generating..." : "🤖 Generate with AI"}
            </button>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" />
            </div>

            <div className="form-group">
              <label className="form-label">CTA Button Text</label>
              <input className="form-input" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Try It Free" />
            </div>

            <div className="form-group">
              <label className="form-label">Email Body</label>
              <textarea className="form-textarea" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Write your email or generate with AI..." />
            </div>

            <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleSend} disabled={isSending}>
              {isSending ? "Sending..." : `📤 Send to ${sendToAll ? filteredUsers.length : selectedUsers.length} Users`}
            </button>
          </div>
        </div>
      )}

      {tab === "campaigns" && (
        <div>
          {loadingCampaigns ? (
            <div style={{ color: "#fff", textAlign: "center", padding: 40 }}>Loading...</div>
          ) : campaigns.length === 0 ? (
            <div style={{ color: "#5a6373", textAlign: "center", padding: 40 }}>No campaigns yet. Create your first one!</div>
          ) : (
            <div className="campaign-list">
              {campaigns.map((campaign) => (
                <div key={campaign._id} className="campaign-item">
                  <div className="campaign-header">
                    <div className="campaign-subject">{campaign.subject}</div>
                    <span className="campaign-type">{campaign.type}</span>
                  </div>
                  <div className="campaign-stats">
                    <span className="campaign-stat sent">📤 {campaign.sentCount || 0} sent</span>
                    <span className="campaign-stat opens">👁️ {campaign.opens || 0} opens</span>
                    <span className="campaign-stat clicks">🖱️ {campaign.clicks || 0} clicks</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}