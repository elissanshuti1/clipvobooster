"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminExists, setAdminExists] = useState(true);

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const res = await fetch("/api/admin/init");
      const data = await res.json();
      setAdminExists(data.adminExists);
    } catch (error) {
      console.error("Failed to check admin:", error);
      setAdminExists(true); // Assume exists on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialize = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/init", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        alert(
          `✅ Admin account created!\n\nUsername: ${data.username}\nPassword: ${data.password}\n\nPlease login now.`,
        );
        setAdminExists(true);
      } else {
        alert(data.error || "Failed to create admin");
      }
    } catch (error) {
      alert("Failed to create admin account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Force full page reload to ensure cookie is recognized by middleware
      window.location.href = "/secure/admin/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090d] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090d]">
      <style>{`
        .login-container {
          display: flex;
          min-height: 100vh;
        }
        .login-left {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        .login-right {
          flex: 1;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
          overflow: hidden;
        }
        .login-right::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-card {
          background: #0e1018;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
        }
        .login-header {
          margin-bottom: 32px;
        }
        .login-title {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 8px;
        }
        .login-subtitle {
          font-size: 14px;
          color: #5a6373;
        }
        .form-group {
          margin-bottom: 20px;
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
          border-radius: 10px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .form-input:focus {
          border-color: #6366f1;
        }
        .form-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .password-input-wrapper {
          position: relative;
        }
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #5a6373;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .password-toggle:hover {
          color: #8b95a5;
        }
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .submit-btn:hover {
          opacity: 0.9;
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .error-msg {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 20px;
          color: #5a6373;
          font-size: 13px;
          text-decoration: none;
        }
        .back-link:hover {
          color: #8b95a5;
        }
        .init-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .init-btn {
          width: 100%;
          padding: 12px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .init-btn:hover {
          background: rgba(16, 185, 129, 0.15);
        }
        .init-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .brand-content {
          text-align: center;
          color: white;
          position: relative;
          z-index: 1;
        }
        .brand-icon {
          font-size: 80px;
          margin-bottom: 24px;
          display: block;
        }
        .brand-title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .brand-subtitle {
          font-size: 16px;
          opacity: 0.9;
          line-height: 1.6;
        }
        @media (max-width: 768px) {
          .login-right {
            display: none;
          }
        }
      `}</style>

      <div className="login-container">
        {/* Left Side - Login Form */}
        <div className="login-left">
          <div className="login-card">
            <div className="login-header">
              <h1 className="login-title">🔐 Admin Access</h1>
              <p className="login-subtitle">Sign in to manage ClipVoBooster</p>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                  disabled={!adminExists}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    disabled={!adminExists}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting || !adminExists}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {!adminExists && (
              <div className="init-section">
                <button
                  className="init-btn"
                  onClick={handleInitialize}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Initialize Admin Account"}
                </button>
              </div>
            )}

            <a href="/" className="back-link">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to main site
            </a>
          </div>
        </div>

        {/* Right Side - Brand */}
        <div className="login-right">
          <div className="brand-content">
            <span className="brand-icon">🚀</span>
            <h1 className="brand-title">ClipVo Admin</h1>
            <p className="brand-subtitle">
              Manage users, send emails, and track platform analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
