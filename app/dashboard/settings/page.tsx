"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";

function DashboardSettingsContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [profile, setProfile] = useState({
    projectName: '',
    projectUrl: '',
    projectDescription: '',
    targetAudience: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile.projectName || !profile.projectDescription) {
      setNotification({ type: 'error', message: 'Project name and description are required!' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (res.ok) {
        setNotification({ type: 'success', message: '✅ Profile saved successfully!' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        const error = await res.json();
        setNotification({ type: 'error', message: 'Failed to save: ' + error.error });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to save profile' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#08090d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#dde1e9' }}>
          <div style={{
            width: 40, height: 40,
            border: '3px solid rgba(255,255,255,0.1)',
            borderTop: '3px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#5a6373', fontSize: 14, marginTop: 16 }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
        }
        @keyframes slideIn { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {notification && (
          <div style={{
            position: 'fixed',
            top: 80,
            right: 20,
            padding: '16px 24px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            zIndex: 1000,
            background: notification.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
            border: `1px solid ${notification.type === 'success' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
            color: notification.type === 'success' ? '#4ade80' : '#f87171',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {notification.message}
          </div>
        )}

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
            ⚙️ Settings
          </h1>
          <p style={{ fontSize: 14, color: '#5a6373' }}>
            Manage your project information for email campaigns
          </p>
        </div>

        {/* Project Information Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 24
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#ffffff', marginBottom: 16 }}>
            📝 Project Information
          </h2>
          <p style={{ fontSize: 13, color: '#5a6373', marginBottom: 24, lineHeight: 1.6 }}>
            This information is used to personalize your email campaigns.
            Make sure to be specific about what your project does and who it's for.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Project Name */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#8b95a5', marginBottom: 8 }}>
                Project Name *
              </label>
              <input
                type="text"
                value={profile.projectName}
                onChange={(e) => setProfile({ ...profile, projectName: e.target.value })}
                placeholder="e.g., EmailPro"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#12151f',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10,
                  color: '#dde1e9',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
              />
            </div>

            {/* Project URL */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#8b95a5', marginBottom: 8 }}>
                Project URL
              </label>
              <input
                type="url"
                value={profile.projectUrl}
                onChange={(e) => setProfile({ ...profile, projectUrl: e.target.value })}
                placeholder="e.g., https://emailpro.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#12151f',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10,
                  color: '#dde1e9',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
              />
            </div>

            {/* Project Description */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#8b95a5', marginBottom: 8 }}>
                Project Description *
              </label>
              <textarea
                value={profile.projectDescription}
                onChange={(e) => setProfile({ ...profile, projectDescription: e.target.value })}
                placeholder="Describe what your project does and what problem it solves..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#12151f',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10,
                  color: '#dde1e9',
                  fontSize: 14,
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'border-color 0.2s',
                  minHeight: 120
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
              />
              <p style={{ fontSize: 12, color: '#5a6373', marginTop: 8 }}>
                Be specific about what your project does. This helps us find better matches.
              </p>
            </div>

            {/* Target Audience */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#8b95a5', marginBottom: 8 }}>
                Target Audience
              </label>
              <textarea
                value={profile.targetAudience}
                onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value })}
                placeholder="Who is your ideal audience? e.g., Small business owners, solopreneurs, marketers..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#12151f',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10,
                  color: '#dde1e9',
                  fontSize: 14,
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'border-color 0.2s',
                  minHeight: 80
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={saveProfile}
            disabled={isSaving}
            style={{
              marginTop: 24,
              width: '100%',
              padding: '14px 24px',
              background: isSaving ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isSaving ? 0.6 : 1
            }}
          >
            {isSaving ? '💾 Saving...' : '💾 Save Changes'}
          </button>
        </div>

        {/* Tips Card */}
        <div style={{
          background: '#0e1018',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          padding: 24
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 16 }}>
            💡 Tips for Better Results
          </h3>
          <ul style={{ fontSize: 14, color: '#dde1e9', lineHeight: 1.8, paddingLeft: 20 }}>
            <li>
              <strong style={{ color: '#4ade80' }}>Be specific:</strong> Instead of "email tool", say "email marketing automation for small businesses"
            </li>
            <li style={{ marginTop: 8 }}>
              <strong style={{ color: '#4ade80' }}>Include keywords:</strong> Use words your audience would search for
            </li>
            <li style={{ marginTop: 8 }}>
              <strong style={{ color: '#4ade80' }}>Define your audience:</strong> The more specific you are about who needs your product, the better personalization you'll achieve
            </li>
            <li style={{ marginTop: 8 }}>
              <strong style={{ color: '#4ade80' }}>Update regularly:</strong> Keep your project info current as your product evolves
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default function DashboardSettings() {
  return (
    <Suspense fallback={
      <div style={{ padding: 32, color: '#5a6373', textAlign: 'center' }}>
        Loading...
      </div>
    }>
      <DashboardSettingsContent />
    </Suspense>
  );
}
