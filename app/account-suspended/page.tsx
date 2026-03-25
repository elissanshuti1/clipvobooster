"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountSuspended() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (!data.user) {
          // Not logged in, redirect to login
          router.push("/login");
          return;
        }

        // If user is not suspended, redirect to dashboard
        if (!data.user.isSuspended) {
          router.push("/dashboard/overview");
          return;
        }

        setUserData(data.user);
      } catch (error) {
        console.error("Failed to check user status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090d] flex items-center justify-center">
        <style>{`
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(239, 68, 68, 0.2);
            border-radius: 50%;
            border-top-color: #ef4444;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090d] flex items-center justify-center p-4">
      <style>{`
        .suspended-card {
          background: #0e1018;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 20px;
          padding: 48px;
          max-width: 520px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(239, 68, 68, 0.1);
        }
        .suspended-icon {
          font-size: 64px;
          margin-bottom: 24px;
          display: block;
        }
        .suspended-title {
          font-size: 28px;
          font-weight: 700;
          color: #ef4444;
          margin: 0 0 16px 0;
        }
        .suspended-message {
          font-size: 16px;
          color: #8b95a5;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }
        .suspended-details {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
          text-align: left;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(239, 68, 68, 0.1);
          font-size: 14px;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #5a6373;
          font-weight: 500;
        }
        .detail-value {
          color: #dde1e9;
          font-weight: 600;
        }
        .contact-info {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .contact-title {
          font-size: 14px;
          font-weight: 600;
          color: #6366f1;
          margin-bottom: 8px;
        }
        .contact-text {
          font-size: 14px;
          color: #8b95a5;
          margin: 0 0 12px 0;
        }
        .contact-link {
          color: #6366f1;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        .contact-link:hover {
          color: #8b5cf6;
        }
        .logout-btn {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .warning-banner {
          background: rgba(239, 68, 68, 0.1);
          border-left: 4px solid #ef4444;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          text-align: left;
        }
        .warning-title {
          font-size: 14px;
          font-weight: 700;
          color: #ef4444;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .warning-text {
          font-size: 13px;
          color: #8b95a5;
          margin: 0;
        }
      `}</style>

      <div className="suspended-card">
        <span className="suspended-icon">🚫</span>
        <h1 className="suspended-title">Account Suspended</h1>

        <div className="warning-banner">
          <div className="warning-title">
            ⚠️ Restricted Access
          </div>
          <p className="warning-text">
            Your account has been suspended by our administration team. You cannot access any features of ClipVoBooster until this suspension is lifted.
          </p>
        </div>

        <p className="suspended-message">
          Your account has been temporarily suspended due to a violation of our Terms of Service or community guidelines.
        </p>

        <div className="suspended-details">
          <div className="detail-row">
            <span className="detail-label">Account Email</span>
            <span className="detail-value">{userData?.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className="detail-value" style={{ color: "#ef4444" }}>Suspended</span>
          </div>
          {userData?.suspendedAt && (
            <div className="detail-row">
              <span className="detail-label">Suspended On</span>
              <span className="detail-value">
                {new Date(userData.suspendedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="contact-info">
          <div className="contact-title">📧 Need Help?</div>
          <p className="contact-text">
            If you believe this suspension is a mistake, please contact our support team:
          </p>
          <a href="mailto:support@clipvo.site" className="contact-link">
            support@clipvo.site
          </a>
        </div>

        <button
          className="logout-btn"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
