"use client";

import { useEffect, useState } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: "delete" | "suspend" | "activate";
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  type,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getColors = () => {
    if (type === "delete")
      return {
        bg: "rgba(239, 68, 68, 0.1)",
        border: "rgba(239, 68, 68, 0.3)",
        text: "#ef4444",
      };
    if (type === "suspend")
      return {
        bg: "rgba(239, 68, 68, 0.1)",
        border: "rgba(239, 68, 68, 0.3)",
        text: "#ef4444",
      };
    return {
      bg: "rgba(16, 185, 129, 0.1)",
      border: "rgba(16, 185, 129, 0.3)",
      text: "#10b981",
    };
  };

  const colors = getColors();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#0e1018",
          border: `1px solid ${colors.border}`,
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ fontSize: "32px", marginBottom: "16px" }}>
          {type === "delete" ? "🗑️" : type === "suspend" ? "⚠️" : "✅"}
        </div>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: "12px",
            margin: "0 0 12px 0",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "#8b95a5",
            lineHeight: 1.6,
            marginBottom: "24px",
            margin: "0 0 24px 0",
          }}
        >
          {message}
        </p>
        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "12px 24px",
              background: "#12151f",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "12px 24px",
              background:
                type === "activate"
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "linear-gradient(135deg, #ef4444, #dc2626)",
              border: "none",
              borderRadius: "10px",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function getPlanBadge(plan: string | undefined) {
  if (!plan || plan === "no plan") return { label: "No Plan", class: "plan-none" };
  const planLower = plan.toLowerCase();
  if (planLower === "free-trial") return { label: "Free Trial", class: "plan-trial" };
  if (planLower === "starter") return { label: "Starter", class: "plan-starter" };
  if (planLower === "professional") return { label: "Professional", class: "plan-pro" };
  if (planLower === "business") return { label: "Business", class: "plan-business" };
  return { label: plan, class: "plan-none" };
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "delete" | "suspend" | "activate";
    userId: string;
    email: string;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
  } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (
    type: "delete" | "suspend" | "activate",
    userId: string,
    email: string,
  ) => {
    if (type === "delete") {
      setModal({
        isOpen: true,
        type: "delete",
        userId,
        email,
        title: "Delete User",
        message: `Are you sure you want to delete the user "${email}"? This action cannot be undone. All user data including sent emails, click history, and notifications will be permanently removed. This email will also be blocked from registering again.`,
        confirmText: "Delete User",
        cancelText: "Cancel",
      });
    } else if (type === "suspend") {
      setModal({
        isOpen: true,
        type: "suspend",
        userId,
        email,
        title: "Suspend User",
        message: `Are you sure you want to suspend "${email}"? The user will no longer be able to access their account. A notification email will be sent to the user.`,
        confirmText: "Suspend User",
        cancelText: "Cancel",
      });
    } else {
      setModal({
        isOpen: true,
        type: "activate",
        userId,
        email,
        title: "Activate User",
        message: `Are you sure you want to activate "${email}"? The user will be able to access their account again.`,
        confirmText: "Activate User",
        cancelText: "Cancel",
      });
    }
  };

  const closeModal = () => {
    setModal(null);
  };

  const handleConfirm = async () => {
    if (!modal) return;

    setActionLoading(modal.userId);
    try {
      let endpoint = "";
      if (modal.type === "delete")
        endpoint = `/api/admin/users/${modal.userId}`;
      else if (modal.type === "suspend")
        endpoint = `/api/admin/users/${modal.userId}/suspend`;
      else endpoint = `/api/admin/users/${modal.userId}/activate`;

      const res = await fetch(endpoint, {
        method: modal.type === "delete" ? "DELETE" : "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${modal.type} user`);
      }

      await loadUsers();
      closeModal();
    } catch (error: any) {
      console.error("Action failed:", error.message);
      setActionLoading(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = (userId: string, email: string) => {
    openModal("suspend", userId, email);
  };

  const handleActivate = (userId: string, email: string) => {
    openModal("activate", userId, email);
  };

  const handleDelete = (userId: string, email: string) => {
    openModal("delete", userId, email);
  };

  const filteredUsers = users.filter((user: any) => {
    if (filter === "active" && user.isSuspended) return false;
    if (filter === "suspended" && !user.isSuspended) return false;
    if (
      searchTerm &&
      !user.email?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div>
      <style>{`
        .users-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .search-input {
          padding: 10px 16px;
          background: #12151f;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          width: 100%;
          max-width: 280px;
        }
        .filter-btns {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .filter-btn {
          padding: 8px 16px;
          background: #12151f;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #8b95a5;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .filter-btn.active {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
        }
        .users-table {
          width: 100%;
          border-collapse: collapse;
          background: #0e1018;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          overflow: hidden;
          display: none;
        }
        .users-table th {
          text-align: left;
          padding: 16px;
          font-size: 12px;
          font-weight: 600;
          color: #5a6373;
          text-transform: uppercase;
          background: #12151f;
        }
        .users-table td {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
          font-size: 14px;
          color: #dde1e9;
        }
        .user-cards {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .user-card {
          background: #0e1018;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .user-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-card-info {
          flex: 1;
        }
        .user-card-name {
          font-weight: 600;
          color: #fff;
          font-size: 15px;
        }
        .user-card-email {
          color: #8b95a5;
          font-size: 13px;
        }
        .user-card-details {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .user-card-detail {
          font-size: 12px;
          color: #5a6373;
        }
        .user-card-detail span {
          color: #dde1e9;
        }
        .user-card-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }
        .status-active {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        .status-suspended {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .plan-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }
        .plan-starter {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
        }
        .plan-pro {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }
        .plan-business {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        .plan-trial {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }
        .plan-none {
          background: rgba(107, 114, 128, 0.1);
          color: #9ca3af;
        }
        .action-btn {
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .btn-suspend {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .btn-suspend:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        .btn-activate {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        .btn-activate:hover {
          background: rgba(16, 185, 129, 0.2);
        }
        .btn-delete {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .btn-delete:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .users-table {
            display: none !important;
          }
          .user-cards {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .users-table {
            display: table !important;
          }
          .user-cards {
            display: none !important;
          }
        }
      `}</style>

      <div className="users-header">
        <input
          type="text"
          className="search-input"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filter-btns">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filter === "suspended" ? "active" : ""}`}
            onClick={() => setFilter("suspended")}
          >
            Suspended
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ color: "#fff", textAlign: "center", padding: "40px" }}>
          Loading...
        </div>
      ) : (
        <>
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: any) => {
                const planInfo = getPlanBadge(user.subscription?.plan);
                return (
                  <tr key={user._id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            fontSize: "14px",
                            color: "#fff",
                          }}
                        >
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500 }}>
                          {user.name || "User"}
                        </span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`plan-badge ${planInfo.class}`}>
                        {planInfo.label}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${user.isSuspended ? "status-suspended" : "status-active"}`}
                      >
                        {user.isSuspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td>
                      {user.isSuspended ? (
                        <button
                          className="action-btn btn-activate"
                          onClick={() => handleActivate(user._id, user.email)}
                          disabled={actionLoading === user._id}
                        >
                          {actionLoading === user._id ? "..." : "Activate"}
                        </button>
                      ) : (
                        <button
                          className="action-btn btn-suspend"
                          onClick={() => handleSuspend(user._id, user.email)}
                          disabled={actionLoading === user._id}
                        >
                          {actionLoading === user._id ? "..." : "Suspend"}
                        </button>
                      )}
                      <button
                        className="action-btn btn-delete"
                        onClick={() => handleDelete(user._id, user.email)}
                        disabled={actionLoading === user._id}
                      >
                        {actionLoading === user._id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="user-cards">
            {filteredUsers.map((user: any) => {
              const planInfo = getPlanBadge(user.subscription?.plan);
              return (
                <div key={user._id} className="user-card">
                  <div className="user-card-header">
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: "16px",
                        color: "#fff",
                      }}
                    >
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="user-card-info">
                      <div className="user-card-name">{user.name || "User"}</div>
                      <div className="user-card-email">{user.email}</div>
                    </div>
                    <span
                      className={`status-badge ${user.isSuspended ? "status-suspended" : "status-active"}`}
                    >
                      {user.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </div>
                  <div className="user-card-details">
                    <div className="user-card-detail">
                      Plan: <span className={`plan-badge ${planInfo.class}`}>{planInfo.label}</span>
                    </div>
                    <div className="user-card-detail">
                      Joined: <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="user-card-detail">
                      Last Login: <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</span>
                    </div>
                  </div>
                  <div className="user-card-actions">
                    {user.isSuspended ? (
                      <button
                        className="action-btn btn-activate"
                        onClick={() => handleActivate(user._id, user.email)}
                        disabled={actionLoading === user._id}
                      >
                        {actionLoading === user._id ? "..." : "Activate"}
                      </button>
                    ) : (
                      <button
                        className="action-btn btn-suspend"
                        onClick={() => handleSuspend(user._id, user.email)}
                        disabled={actionLoading === user._id}
                      >
                        {actionLoading === user._id ? "..." : "Suspend"}
                      </button>
                    )}
                    <button
                      className="action-btn btn-delete"
                      onClick={() => handleDelete(user._id, user.email)}
                      disabled={actionLoading === user._id}
                    >
                      {actionLoading === user._id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {filteredUsers.length === 0 && (
        <div style={{ color: "#5a6373", textAlign: "center", padding: "40px" }}>
          No users found
        </div>
      )}

      {modal && (
        <ConfirmModal
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          confirmText={modal.confirmText}
          cancelText={modal.cancelText}
          type={modal.type}
          onConfirm={handleConfirm}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}
