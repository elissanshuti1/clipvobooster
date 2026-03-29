"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardOverview() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(
    null,
  );
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const [userRes, profileRes] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/profile", { cache: "no-store" }),
        ]);

        const userData = userRes.ok ? await userRes.json() : null;
        const profileData = profileRes.ok ? await profileRes.json() : null;

        if (!userData) {
          router.push("/login");
          return;
        }

        setUser(userData);

        const hasProfileData = !!(
          profileData?.profile?.projectName &&
          profileData?.profile?.projectDescription
        );
        setHasProfile(hasProfileData);

        if (hasProfileData) {
          setProjectName(profileData.profile.projectName || "");
          setProjectUrl(profileData.profile.projectUrl || "");
          setProjectDescription(profileData.profile.projectDescription || "");
          setTargetAudience(profileData.profile.targetAudience || "");
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Dashboard init error:", err);
        router.push("/login");
      }
    };

    initData();
  }, [router]);

  const handleSaveProfile = async () => {
    if (!projectName || !projectDescription) {
      alert("Please fill in at least product name and description");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          projectUrl,
          projectDescription,
          targetAudience,
        }),
      });

      if (res.ok) {
        console.log("✅ Profile saved, reloading page...");
        // Force reload to re-check profile
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save profile");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      alert("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white flex items-center justify-center">
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(255,255,255,0.1)",
            borderTop: "3px solid #6366f1",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const firstName =
    user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  // Show profile setup if no profile
  if (!hasProfile) {
    return (
      <>
        <style>{`
          :root {
            --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
            --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
            --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
          }
          .setup-card {
            background: linear-gradient(135deg, var(--bg1), var(--bg2));
            border: 1px solid var(--line2);
            border-radius: 24px;
            padding: 60px 40px;
            max-width: 600px;
            margin: 0 auto;
          }
          .setup-title {
            font-size: 28px;
            font-weight: 700;
            color: var(--white);
            margin-bottom: 8px;
          }
          .setup-subtitle {
            font-size: 15px;
            color: var(--muted);
            margin-bottom: 32px;
            line-height: 1.6;
          }
          .form-group {
            margin-bottom: 24px;
          }
          .form-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: var(--text);
            margin-bottom: 8px;
          }
          .form-input, .form-textarea {
            width: 100%;
            padding: 14px 16px;
            border-radius: 12px;
            border: 1px solid var(--line);
            background: var(--bg2);
            color: var(--text);
            font-size: 15px;
            font-family: inherit;
            transition: all 0.2s;
          }
          .form-input:focus, .form-textarea:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
          .form-textarea {
            min-height: 120px;
            resize: vertical;
          }
          .btn {
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            display: inline-flex;
            align-items: center;
            gap: 12px;
          }
          .btn-primary {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
          }
          .btn-primary:hover {
            opacity: 0.9;
            transform: scale(1.02);
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
          }
          .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }
        `}</style>

        <div>
          <div className="setup-card">
            <h1 className="setup-title">Describe Your Product 🚀</h1>
            <p className="setup-subtitle">
              Tell us about your product so we can find the right customers for
              you. Our AI will scan Reddit for people looking for solutions like
              yours.
            </p>

            <div className="form-group">
              <label className="form-label">Product/Project Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., MyAwesome SaaS"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Product URL / Website</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://yourproduct.com"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Product Description *</label>
              <textarea
                className="form-textarea"
                placeholder="Describe what your product does, who it's for, and what problem it solves..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <textarea
                className="form-textarea"
                placeholder="Who are your ideal customers? (optional)"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                style={{ minHeight: "80px" }}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSaveProfile}
              disabled={isSaving || !projectName || !projectDescription}
            >
              {isSaving ? "Saving..." : "Save & Start Finding Customers"}
              {!isSaving && (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </>
    );
  }

  // Show dashboard with Find Customers button
  return (
    <>
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
        }
        .fresh-start-card {
          background: linear-gradient(135deg, var(--bg1), var(--bg2));
          border: 1px solid var(--line2);
          border-radius: 24px;
          padding: 60px 40px;
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }
        .fresh-start-icon {
          width: 80px; height: 80px; margin: 0 auto 32px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .fresh-start-title { font-size: 32px; font-weight: 700; color: var(--white); margin-bottom: 12px; }
        .fresh-start-subtitle { font-size: 16px; color: var(--muted); margin-bottom: 40px; line-height: 1.6; }
        .btn {
          padding: 16px 32px; border-radius: 12px; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; border: none;
          display: inline-flex; align-items: center; gap: 12px; text-decoration: none;
        }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;
        }
        .btn-primary:hover {
          opacity: 0.9; transform: scale(1.02);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
        }
      `}</style>

      <div>
        <div className="fresh-start-card">
          <div className="fresh-start-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>

          <h1 className="fresh-start-title">Welcome, {firstName}! 👋</h1>
          <p className="fresh-start-subtitle">
            Ready to find new customers? Our AI will help you discover people
            who are actively looking for products like yours.
          </p>

          <button
            className="btn btn-primary"
            onClick={() => router.push("/dashboard/customers")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Find Customers Now
          </button>
        </div>
      </div>
    </>
  );
}
