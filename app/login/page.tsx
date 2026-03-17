"use client";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#08090d] text-[#dde1e9] relative overflow-hidden">
      {/* Background gradient effects */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="w-full max-w-md p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/20">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to ClipVo Email</h1>
          <p className="text-slate-400 text-sm">AI-powered email marketing platform</p>
        </div>

        {/* Google Sign In - ONLY OPTION */}
        <button
          onClick={handleGoogleLogin}
          className="w-full py-4 rounded-xl bg-white text-gray-800 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 mb-6"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        {/* Features */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#0e1018]/50 border border-white/5">
            <div style={{ fontSize: 20 }}>✍️</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>AI Writes Emails</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Personalized emails in seconds</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#0e1018]/50 border border-white/5">
            <div style={{ fontSize: 20 }}>📧</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>Send Emails Instantly</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Professional email delivery</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#0e1018]/50 border border-white/5">
            <div style={{ fontSize: 20 }}>📊</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>Track Everything</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>See sent emails and responses</div>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 p-4 rounded-xl bg-[#0e1018]/50 border border-white/5">
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Secure OAuth
            </span>
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Quick Setup
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
