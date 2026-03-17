"use client";

export default function Footer() {
  return (
    <>
      <style>{`
        /* ── Footer ── */
        footer {
          border-top:1px solid var(--line); padding:64px 0 40px;
        }
        .foot-grid {
          display:grid; grid-template-columns:2.2fr 1fr 1fr 1fr;
          gap:48px; margin-bottom:56px;
        }
        .wrap { max-width:1120px; margin:0 auto; padding:0 52px; }
        .nav-mark {
          width:25px; height:25px; border-radius:6px;
          background:var(--white); display:grid; place-items:center;
          flex-shrink:0;
        }
        .foot-brand {
          font-family:'Instrument Serif',serif; font-size:18px; color:var(--white);
          text-decoration:none; display:flex; align-items:center; gap:10px;
          margin-bottom:14px;
        }
        .foot-desc {
          font-size:13.5px; font-weight:300; color:var(--muted);
          line-height:1.75; max-width:230px;
        }
        .foot-col h4 {
          font-family:'DM Mono',monospace; font-size:9.5px; letter-spacing:.13em;
          text-transform:uppercase; color:var(--dim); margin-bottom:20px;
        }
        .foot-col ul { list-style:none; display:flex; flex-direction:column; gap:12px; }
        .foot-col a {
          font-size:13.5px; font-weight:300; color:var(--muted);
          text-decoration:none; transition:color .2s;
        }
        .foot-col a:hover { color:var(--dim); }
        .foot-bottom {
          display:flex; align-items:center; justify-content:space-between;
          padding-top:28px; border-top:1px solid var(--line);
        }
        .foot-bottom p { font-size:13px; font-weight:300; color:var(--muted); }
        .foot-soc { display:flex; gap:28px; }
        .foot-soc a {
          font-size:13px; font-weight:300; color:var(--muted);
          text-decoration:none; transition:color .2s;
        }
        .foot-soc a:hover { color:var(--dim); }

        @media (max-width:920px) {
          .wrap { padding:0 24px; }
          .foot-grid { grid-template-columns:1fr 1fr; gap:40px; }
        }
      `}</style>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <a href="#" className="foot-brand">
                <img src="/favicon.png" alt="ClipVoBooster" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} className="nav-mark" />
                ClipVoBooster
              </a>
              <p className="foot-desc">AI-powered email marketing with real-time tracking. Send professional emails that get opened, read, and clicked.</p>
            </div>
            <div className="foot-col">
              <h4>Platform</h4>
              <ul>
                <li><a href="/dashboard/compose">Compose Email</a></li>
                <li><a href="/dashboard/analytics">Analytics</a></li>
                <li><a href="/dashboard/contacts">Contacts</a></li>
                <li><a href="/features">Features</a></li>
                <li><a href="/pricing">Pricing</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h4>Company</h4>
              <ul>
                <li><a href="/about">About</a></li>
                <li><a href="/dashboard">Dashboard</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Service</a></li>
                <li><a href="/refund">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <p>© 2026 Clipvobooster, Inc. All rights reserved.</p>
            <div className="foot-soc">
              <a href="https://twitter.com/clipvobooster" target="_blank" rel="noopener noreferrer">Twitter</a>
              <a href="mailto:support@clipvo.site">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
