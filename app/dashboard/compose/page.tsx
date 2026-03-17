"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ComposePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'loading' | 'select' | 'preview'>('loading');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recipientEmail, setRecipientEmail] = useState(searchParams.get('email') || '');
  const [recipientName, setRecipientName] = useState('');
  const [tone, setTone] = useState('friendly');
  const [generatedEmail, setGeneratedEmail] = useState({ subject: '', body: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.hasProfile && data.profile) {
          setUserProfile(data.profile);
          setStep('select');
        } else {
          router.push('/dashboard/profile');
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const generateEmail = async () => {
    setIsGenerating(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/email/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName,
          recipientEmail,
          productName: userProfile?.projectName,
          productDescription: userProfile?.projectDescription,
          productUrl: userProfile?.projectUrl,
          tone
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setGeneratedEmail(data);
        setStep('preview');
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (err) {
      setMessage('❌ Failed to generate email');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async () => {
    setIsSending(true);
    setMessage('');

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: generatedEmail.subject,
          body: generatedEmail.body
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Email sent successfully!');

        // Create notification for the user
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'email_sent',
              title: 'Email Sent Successfully',
              message: `Your email to ${recipientEmail} has been delivered successfully`
            })
          });
        } catch (err) {
          console.error('Failed to create notification:', err);
        }

        // Dispatch custom event to update overview
        window.dispatchEvent(new CustomEvent('emailSent'));

        // Redirect to overview after a short delay
        setTimeout(() => {
          router.push('/dashboard/overview');
        }, 1500);
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (err) {
      setMessage('❌ Failed to send email');
      console.error('Send email error:', err);
    } finally {
      setIsSending(false);
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
          max-width: 800px;
          margin: 0 auto;
        }

        .card {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 32px;
          margin-bottom: 24px;
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

        .form-input, .form-select {
          width: 100%;
          padding: 12px 16px;
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 10px;
          color: var(--text);
          font-size: 14px;
          outline: none;
        }

        .form-input:focus {
          border-color: var(--line2);
        }

        .btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: var(--bg2);
          color: var(--text);
          border: 1px solid var(--line);
        }

        .message {
          padding: 14px 18px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .message-success {
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
          color: #4ade80;
        }

        .message-error {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
          color: #f87171;
        }

        .email-preview {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 24px;
          font-size: 14px;
          line-height: 1.8;
          color: var(--text);
          white-space: pre-wrap;
          margin-bottom: 20px;
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
        
        .profile-info {
          padding: 16px;
          background: var(--bg3);
          border-radius: 10px;
          margin-bottom: 20px;
        }
      `}</style>

      <div className="page-container">
        <div className="card">
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>
            ✍️ Compose Email
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
            AI will write personalized emails using your profile
          </p>

          {message && (
            <div className={`message ${message.includes('✅') ? 'message-success' : 'message-error'}`}>
              {message}
            </div>
          )}

          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="loading-spinner" style={{ width: 40, height: 40, margin: '0 auto 20px' }} />
              <p style={{ color: 'var(--muted)' }}>Loading your profile...</p>
            </div>
          )}

          {step === 'select' && (
            <>
              <div className="profile-info">
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Sending as:</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>{userProfile?.projectName}</div>
                <div style={{ fontSize: 13, color: 'var(--dim)' }}>{userProfile?.projectUrl}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Recipient Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Recipient Email *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="john@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Tone</label>
                <select
                  className="form-select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="friendly">Friendly & Casual</option>
                  <option value="professional">Professional</option>
                  <option value="persuasive">Persuasive</option>
                  <option value="enthusiastic">Enthusiastic</option>
                </select>
              </div>

              <button
                className="btn btn-primary"
                onClick={generateEmail}
                disabled={isGenerating || !recipientEmail}
              >
                {isGenerating ? (
                  <>
                    <div className="loading-spinner" />
                    Generating...
                  </>
                ) : (
                  <>✨ Generate with AI</>
                )}
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <div className="email-preview" style={{ padding: 12, minHeight: 'auto', fontWeight: 600 }}>
                  {generatedEmail.subject}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Body</label>
                <div className="email-preview">
                  {generatedEmail.body}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setStep('select')}
                >
                  ← Back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={sendEmail}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <div className="loading-spinner" />
                      Sending...
                    </>
                  ) : (
                    <>📧 Send Email</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
