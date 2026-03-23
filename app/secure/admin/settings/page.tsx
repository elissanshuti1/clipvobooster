"use client";

import { useState, useEffect } from "react";

export default function AdminSettings() {
  const [admin, setAdmin] = useState<any>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadAdmin();
  }, []);

  const loadAdmin = async () => {
    try {
      const res = await fetch("/api/admin/auth/me");
      const data = await res.json();
      if (data.authenticated) {
        setAdmin(data.admin);
        setName(data.admin.name || "");
      }
    } catch (error) {
      console.error("Failed to load admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/settings/name", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        alert("Name updated successfully!");
        loadAdmin();
      } else {
        alert("Failed to update name");
      }
    } catch (error) {
      alert("Failed to update name");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (res.ok) {
        alert("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update password");
      }
    } catch (error) {
      alert("Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div style={{ color: "#fff" }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: "600px" }}>
      <style>{`
        .settings-card {
          background: #0e1018;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .card-title {
          font-size: 18px;
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
        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: #12151f;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
        }
        .form-input:focus {
          border-color: #6366f1;
          outline: none;
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
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .info-text {
          font-size: 12px;
          color: #5a6373;
          margin-top: 8px;
        }
      `}</style>

      {/* Profile Settings */}
      <div className="settings-card">
        <h2 className="card-title">👤 Profile Settings</h2>

        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            className="form-input"
            value={admin?.username || ""}
            disabled
            style={{ opacity: 0.5, cursor: "not-allowed" }}
          />
          <p className="info-text">Username cannot be changed</p>
        </div>

        <div className="form-group">
          <label className="form-label">Display Name</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleUpdateName}
          disabled={isUpdating || !name.trim()}
        >
          {isUpdating ? "Updating..." : "Update Name"}
        </button>
      </div>

      {/* Password Settings */}
      <div className="settings-card">
        <h2 className="card-title">🔒 Change Password</h2>

        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input
            type="password"
            className="form-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            className="form-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleUpdatePassword}
          disabled={isUpdating || !currentPassword || !newPassword || !confirmPassword}
        >
          {isUpdating ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}
