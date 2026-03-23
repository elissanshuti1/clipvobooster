"use client";

export default function LoadingDashboard() {
  return (
    <>
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
          --primary: #6366f1; --primary-light: #8b5cf6;
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 32,
        padding: 40
      }}>
        {/* Animated Logo */}
        <div style={{
          position: 'relative',
          width: 80,
          height: 80,
          animation: 'float 3s ease-in-out infinite'
        }}>
          {/* Pulsing rings */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            opacity: 0.5
          }} />
          
          {/* Main circle */}
          <div style={{
            position: 'relative',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 0 60px rgba(99, 102, 241, 0.4)'
          }}>
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
        </div>
        
        {/* Loading text with gradient */}
        <div style={{
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 700,
            background: 'linear-gradient(90deg, var(--primary), var(--primary-light), var(--primary))',
            backgroundSize: '200% auto',
            animation: 'gradient 2s ease infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 8
          }}>
            Loading Dashboard
          </h2>
          <p style={{
            color: 'var(--muted)',
            fontSize: 14
          }}>
            Preparing your advertising tools...
          </p>
        </div>
        
        {/* Progress bar */}
        <div style={{
          width: 200,
          height: 4,
          background: 'var(--bg2)',
          borderRadius: 100,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
            borderRadius: 100,
            animation: 'shimmer 2s linear infinite',
            width: '50%'
          }} />
        </div>
        
        {/* Feature hints */}
        <div style={{
          display: 'flex',
          gap: 16,
          marginTop: 24
        }}>
          {['📧 Email Outreach', '📊 Analytics', '🎯 Campaigns'].map((hint, i) => (
            <div key={i} style={{
              padding: '8px 16px',
              background: 'var(--bg1)',
              border: '1px solid var(--line)',
              borderRadius: 100,
              fontSize: 12,
              color: 'var(--muted)',
              animation: `float 2s ease-in-out infinite ${i * 0.2}s`
            }}>
              {hint}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
