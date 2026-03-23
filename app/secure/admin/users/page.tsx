"use client";

import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

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

  const handleSuspend = async (userId: string, email: string) => {
    if (!confirm(`Suspend user ${email}? They won't be able to access their account.`)) return;
    
    setActionLoading(userId);
    try {
      await fetch(`/api/admin/users/${userId}/suspend`, { method: "POST" });
      loadUsers();
      alert("User suspended successfully");
    } catch (error) {
      alert("Failed to suspend user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (userId: string, email: string) => {
    if (!confirm(`Activate user ${email}?`)) return;
    
    setActionLoading(userId);
    try {
      await fetch(`/api/admin/users/${userId}/activate`, { method: "POST" });
      loadUsers();
      alert("User activated successfully");
    } catch (error) {
      alert("Failed to activate user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`DELETE user ${email}? This action cannot be undone and all their data will be lost.`)) return;
    
    setActionLoading(userId);
    try {
      await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      loadUsers();
      alert("User deleted successfully");
    } catch (error) {
      alert("Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((user: any) => {
    if (filter === "active" && user.isSuspended) return false;
    if (filter === "suspended" && !user.isSuspended) return false;
    if (searchTerm && !user.email?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !user.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
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
          width: 280px;
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
        .action-btn {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          border: none;
          margin-right: 6px;
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
      `}</style>

      <div className="users-header">
        <input
          type="text"
          className="search-input"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{ display: "flex", gap: "8px" }}>
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
        <div style={{ color: "#fff", textAlign: "center", padding: "40px" }}>Loading...</div>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Last Login</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user: any) => (
              <tr key={user._id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 600
                    }}>
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{user.name || "User"}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</td>
                <td>
                  <span className={`status-badge ${user.isSuspended ? "status-suspended" : "status-active"}`}>
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
            ))}
          </tbody>
        </table>
      )}

      {filteredUsers.length === 0 && (
        <div style={{ color: "#5a6373", textAlign: "center", padding: "40px" }}>
          No users found
        </div>
      )}
    </div>
  );
}
