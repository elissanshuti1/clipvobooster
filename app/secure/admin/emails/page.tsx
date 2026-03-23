"use client";

import { useState, useEffect } from "react";

export default function AdminEmailCampaigns() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [subject, setSubject] = useState("");
  const [emailType, setEmailType] = useState("custom");
  const [aiPrompt, setAiPrompt] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(100);
  const [sentToday, setSentToday] = useState(0);

  useEffect(() => {
    loadUsers();
    loadEmailStats();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.filter((u: any) => !u.isSuspended));
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const loadEmailStats = async () => {
    try {
      const res = await fetch("/api/admin/email-stats");
      const data = await res.json();
      setSentToday(data.sentToday || 0);
      setDailyLimit(data.dailyLimit || 100);
    } catch (error) {
      console.error("Failed to load email stats:", error);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      alert("Please enter a prompt for the AI");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/admin/ai-generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          type: emailType,
        }),
      });

      const data = await res.json();
      if (data.email) {
        setEmailBody(data.email);
        if (!subject) setSubject(data.subject || "Generated Email");
      }
    } catch (error) {
      alert("Failed to generate email with AI");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      alert("Please enter a subject");
      return;
    }
    if (!emailBody.trim() && emailType !== "template") {
      alert("Please enter or generate email content");
      return;
    }

    const recipientCount = sendToAll ? users.length : selectedUsers.length;
    if (recipientCount === 0) {
      alert("Please select at least one recipient");
      return;
    }

    if (sentToday + recipientCount > dailyLimit) {
      alert(`Daily sending limit exceeded. You can send ${dailyLimit - sentToday} more emails today.`);
      return;
    }

    if (!confirm(`Send email to ${recipientCount} user(s)?`)) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/admin/send-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body: emailBody,
          type: emailType,
          sendToAll,
          userIds: selectedUsers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Email sent to ${data.sentCount} users!`);
        setSentToday(prev => prev + data.sentCount);
        setSubject("");
        setEmailBody("");
        setSelectedUsers([]);
        setSendToAll(false);
      } else {
        alert(data.error || "Failed to send email");
      }
    } catch (error) {
      alert("Failed to send email");
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

  return (
    <div>
      <style>{`
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
          margin-bottom: 16px;
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
          padding: 10px 14px;
          background: #12151f;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          font-family: inherit;
        }
        .form-textarea {
          min-height: 200px;
          resize: vertical;
        }
        .btn {
          padding: 12px 24px;
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
        .btn-secondary {
          background: #12151f;
          color: #dde1e9;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .user-list {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
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
          background: #12151f;
        }
        .user-item.selected {
          background: rgba(99, 102, 241, 0.1);
        }
        .checkbox {
          width: 18px;
          height: 18px;
          margin-right: 12px;
          accent-color: #6366f1;
        }
        .limit-info {
          background: #12151f;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .limit-progress {
          flex: 1;
          height: 8px;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          margin: 0 16px;
          overflow: hidden;
        }
        .limit-bar {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transition: width 0.3s;
        }
        @media (max-width: 1024px) {
          .campaign-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="limit-info">
        <span style={{ color: "#8b95a5", fontSize: 13 }}>Daily Limit</span>
        <div className="limit-progress">
          <div
            className="limit-bar"
            style={{ width: `${Math.min((sentToday / dailyLimit) * 100, 100)}%` }}
          />
        </div>
        <span style={{ color: "#fff", fontSize: 14 }}>
          {sentToday} / {dailyLimit} sent
        </span>
      </div>

      <div className="campaign-container">
        {/* Left: Recipients & Settings */}
        <div className="card">
          <h2 className="card-title">📧 Recipients</h2>

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={sendToAll}
                onChange={(e) => setSendToAll(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Send to ALL users ({users.length})
            </label>
          </div>

          {!sendToAll && (
            <div className="user-list">
              {users.map((user: any) => (
                <label
                  key={user._id}
                  className={`user-item ${selectedUsers.includes(user._id) ? "selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => toggleUser(user._id)}
                  />
                  <div>
                    <div style={{ color: "#fff", fontSize: 14 }}>{user.name || "User"}</div>
                    <div style={{ color: "#5a6373", fontSize: 12 }}>{user.email}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div style={{ marginTop: 16, color: "#5a6373", fontSize: 13 }}>
            Selected: {sendToAll ? users.length : selectedUsers.length} users
          </div>
        </div>

        {/* Right: Email Content */}
        <div className="card">
          <h2 className="card-title">✉️ Email Content</h2>

          <div className="form-group">
            <label className="form-label">Email Type</label>
            <select
              className="form-select"
              value={emailType}
              onChange={(e) => setEmailType(e.target.value)}
            >
              <option value="custom">📝 Custom Email</option>
              <option value="advertising">📢 Advertising/Promotion</option>
              <option value="tutorial">📖 How It Works</option>
              <option value="social-proof">⭐ Success Stories</option>
              <option value="ai-generated">🤖 AI Generated</option>
            </select>
          </div>

          {emailType === "ai-generated" && (
            <div className="form-group">
              <label className="form-label">AI Prompt</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: 80 }}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe the email you want AI to generate..."
              />
              <button
                className="btn btn-secondary"
                style={{ marginTop: 8 }}
                onClick={handleGenerateWithAI}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "🤖 Generate with AI"}
              </button>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              className="form-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Body</label>
            <textarea
              className="form-textarea"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Write your email content here..."
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={handleSend}
            disabled={isSending}
          >
            {isSending ? "Sending..." : `📧 Send to ${sendToAll ? users.length : selectedUsers.length} Users`}
          </button>
        </div>
      </div>
    </div>
  );
}
