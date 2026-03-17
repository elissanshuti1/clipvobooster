"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    projectUrl: '',
    projectDescription: '',
    targetAudience: ''
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push('/dashboard/compose');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
        }

        .page-container {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .card {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 40px;
          max-width: 600px;
          width: 100%;
        }

        .card-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .card-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 16px;
          display: grid;
          place-items: center;
          font-size: 28px;
        }

        .card-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 8px;
        }

        .card-subtitle {
          font-size: 14px;
          color: var(--muted);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 8px;
        }

        .form-input, .form-textarea {
          width: 100%;
          padding: 12px 16px;
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 10px;
          color: var(--text);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-input:focus, .form-textarea:focus {
          border-color: var(--line2);
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .form-hint {
          font-size: 12px;
          color: var(--muted);
          margin-top: 6px;
        }

        .btn {
          width: 100%;
          padding: 14px 24px;
          border-radius: 10px;
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

        .btn-primary:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.1);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="page-container">
        <div className="card">
          <div className="card-header">
            <div className="card-icon">📝</div>
            <h1 className="card-title">Tell Us About Your Project</h1>
            <p className="card-subtitle">
              This information will be used to generate personalized emails for your outreach
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Project/Product Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., ClipVo"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                required
              />
              <div className="form-hint">What's the name of your product or service?</div>
            </div>

            <div className="form-group">
              <label className="form-label">Website URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://yourproject.com"
                value={formData.projectUrl}
                onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
              />
              <div className="form-hint">Where can people learn more about your project?</div>
            </div>

            <div className="form-group">
              <label className="form-label">What Does Your Project Do? *</label>
              <textarea
                className="form-textarea"
                placeholder="e.g., ClipVo is an AI-powered email marketing tool that helps creators and founders send personalized outreach emails at scale..."
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                required
              />
              <div className="form-hint">Describe your product in 1-2 sentences. This will be used in your emails.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <textarea
                className="form-textarea"
                placeholder="e.g., Content creators, SaaS founders, marketers, designers..."
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              />
              <div className="form-hint">Who are you trying to reach with your emails?</div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !formData.projectName || !formData.projectDescription}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner" style={{ display: 'inline-block', marginRight: 8 }} />
                  Saving...
                </>
              ) : (
                'Continue to Compose →'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
