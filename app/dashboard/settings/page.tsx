"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardSettings() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) { router.push("/login"); return null; }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUser(data);
          setName(data.name || '');
          setEmail(data.email || '');
        }
      })
      .catch(() => { router.push("/login"); });
  }, [router]);

  const handleUpdateProfile = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: any) => {
    e.preventDefault();
    setMessage(null);
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
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

        @keyframes rise { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .rise { animation: rise .6s cubic-bezier(.16,1,.3,1) both; }
        .d1{animation-delay:.04s} .d2{animation-delay:.12s}

        .settings-wrap { max-width: 640px; }
        
        .panel {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 20px;
        }
        .panel-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--line);
        }
        .panel-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: var(--bg3);
          border: 1px solid var(--line);
          display: grid; place-items: center;
          font-size: 18px;
        }
        .panel-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--white);
        }
        .panel-subtitle {
          font-size: 13px;
          color: var(--muted);
          margin-top: 2px;
        }

        .field { margin-bottom: 20px; }
        .field:last-child { margin-bottom: 0; }
        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 8px;
        }
        .field-input {
          width: 100%;
          background: var(--bg2);
          border: 1px solid var(--line);
          color: var(--text);
          font-family: 'Figtree', sans-serif;
          font-size: 14px;
          padding: 12px 14px;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s;
        }
        .field-input:focus {
          border-color: var(--line2);
        }
        .field-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .field-hint {
          font-size: 12px;
          color: var(--muted);
          margin-top: 6px;
        }

        .password-field {
          position: relative;
        }
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 4px;
          display: grid;
          place-items: center;
        }
        .password-toggle:hover {
          color: var(--dim);
        }

        .btn {
          font-family: 'Figtree', sans-serif;
          font-size: 14px;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary {
          background: var(--white);
          color: var(--bg);
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

        .message {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .message-success {
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.2);
          color: #4ade80;
        }
        .message-error {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.2);
          color: #f87171;
        }

        .divider {
          height: 1px;
          background: var(--line);
          margin: 24px 0;
        }

        .danger-zone {
          border-color: rgba(248, 113, 113, 0.3);
        }
        .danger-zone .panel-header {
          border-bottom-color: rgba(248, 113, 113, 0.3);
        }
        .danger-zone .panel-title {
          color: #f87171;
        }
        .btn-danger {
          background: rgba(248, 113, 113, 0.1);
          color: #f87171;
          border: 1px solid rgba(248, 113, 113, 0.3);
        }
        .btn-danger:hover {
          background: rgba(248, 113, 113, 0.2);
        }

        @media (max-width: 640px) {
          .panel { padding: 20px; }
        }
      `}</style>

      <div className="settings-wrap">
        {message && (
          <div className={`message ${message.type === 'success' ? 'message-success' : 'message-error'} rise`}>
            {message.type === 'success' ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            )}
            {message.text}
          </div>
        )}

        {/* Profile Settings */}
        <div className="panel rise d1">
          <div className="panel-header">
            <div className="panel-icon">👤</div>
            <div>
              <div className="panel-title">Profile Information</div>
              <div className="panel-subtitle">Update your personal details</div>
            </div>
          </div>
          
          <form onSubmit={handleUpdateProfile}>
            <div className="field">
              <label className="field-label">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="field-input"
                placeholder="Your name"
              />
            </div>
            
            <div className="field">
              <label className="field-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="field-input"
                placeholder="your@email.com"
              />
              <div className="field-hint">This is used for login and notifications</div>
            </div>
            
            <div style={{ marginTop: 24 }}>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Password Settings */}
        <div className="panel rise d2">
          <div className="panel-header">
            <div className="panel-icon">🔒</div>
            <div>
              <div className="panel-title">Security</div>
              <div className="panel-subtitle">Change your password</div>
            </div>
          </div>
          
          <form onSubmit={handleChangePassword}>
            <div className="field">
              <label className="field-label">Current Password</label>
              <div className="password-field">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="field-input"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="password-toggle"
                >
                  {showCurrentPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="field">
              <label className="field-label">New Password</label>
              <div className="password-field">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="field-input"
                  placeholder="••••••••"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="password-toggle"
                >
                  {showNewPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="field-hint">Must be at least 8 characters</div>
            </div>
            
            <div className="field">
              <label className="field-label">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="field-input"
                placeholder="••••••••"
              />
            </div>
            
            <div style={{ marginTop: 24 }}>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Account Info */}
        <div className="panel rise d2">
          <div className="panel-header">
            <div className="panel-icon">ℹ️</div>
            <div>
              <div className="panel-title">Account Information</div>
              <div className="panel-subtitle">Details about your account</div>
            </div>
          </div>
          
          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>Member since</span>
              <span style={{ color: 'var(--text)', fontSize: 13 }}>{new Date().toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>Account type</span>
              <span style={{ color: 'var(--white)', fontSize: 13 }}>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>User ID</span>
              <span style={{ color: 'var(--muted)', fontSize: 11, fontFamily: 'monospace' }}>{user?.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="panel danger-zone rise d2">
          <div className="panel-header">
            <div className="panel-icon">⚠️</div>
            <div>
              <div className="panel-title">Danger Zone</div>
              <div className="panel-subtitle">Irreversible actions</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Delete Account</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Permanently delete your account and all data</div>
            </div>
            <button className="btn btn-danger">Delete Account</button>
          </div>
        </div>
      </div>
    </>
  );
}
