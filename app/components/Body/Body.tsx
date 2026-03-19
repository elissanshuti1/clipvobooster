"use client";

import { useState, useEffect } from "react";

export default function Body() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Mono:wght@300;400&display=swap');
      `}</style>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Mono:wght@300;400&display=swap');

        /* Scope all landing styles so they don't leak into global layout */
        .landing-root *, .landing-root *::before, .landing-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .landing-root {
          --bg:    #08090d;
          --bg1:   #0e1018;
          --bg2:   #12151f;
          --bg3:   #181c27;
          --line:  rgba(255,255,255,0.07);
          --line2: rgba(255,255,255,0.13);
          --text:  #dde1e9;
          --muted: #5a6373;
          --dim:   #8b95a5;
          --white: #ffffff;
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', system-ui, sans-serif;
          font-weight: 300;
          -webkit-font-smoothing: antialiased;
          line-height: 1.6;
          overflow-x: hidden;
        }

        /* ── Animations ── */
        @keyframes rise {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes breathe {
          0%,100% { opacity:.35; } 50% { opacity:.9; }
        }

        .landing-root .rise { opacity:0; animation: rise .85s cubic-bezier(.16,1,.3,1) forwards; }
        .landing-root .d1{animation-delay:.04s} .landing-root .d2{animation-delay:.16s}
        .landing-root .d3{animation-delay:.28s} .landing-root .d4{animation-delay:.40s}
        .landing-root .d5{animation-delay:.52s}

        /* ── Hero ── */
        .landing-root .hero {
          min-height:100vh; display:grid; place-items:center;
          padding:130px 52px 90px; position:relative;
        }
        .landing-root .hero-grid {
          position:absolute; inset:0; pointer-events:none;
          background-image:
            linear-gradient(var(--line) 1px, transparent 1px),
            linear-gradient(90deg, var(--line) 1px, transparent 1px);
          background-size:64px 64px;
          mask-image:radial-gradient(ellipse 75% 55% at 50% 38%, black 20%, transparent 100%);
          -webkit-mask-image:radial-gradient(ellipse 75% 55% at 50% 38%, black 20%, transparent 100%);
        }
        .landing-root .hero-inner {
          max-width:820px; width:100%;
          text-align:center; position:relative; z-index:1;
        }
        .landing-root .hero-badge {
          display:inline-flex; align-items:center; gap:8px;
          font-family:'DM Mono', monospace; font-size:11px; font-weight:400;
          letter-spacing:.11em; text-transform:uppercase; color:var(--muted);
          border:1px solid var(--line2); padding:6px 16px; border-radius:100px;
          margin-bottom:44px;
        }
        .landing-root .hero-badge-dot {
          width:5px; height:5px; border-radius:50%; background:var(--dim);
          animation:breathe 2.4s ease-in-out infinite;
        }
        .landing-root h1 {
          font-family:'Instrument Serif', serif;
          font-size:clamp(54px, 8.5vw, 100px);
          font-weight:400; line-height:1.0;
          letter-spacing:-.035em; color:var(--white);
          margin-bottom:30px;
        }
        .landing-root h1 em { font-style:italic; color:var(--dim); }
        .landing-root .hero-p {
          font-size:17px; font-weight:300; color:var(--muted);
          max-width:500px; margin:0 auto 52px; line-height:1.75;
        }
        .landing-root .hero-btns {
          display:flex; align-items:center; justify-content:center;
          gap:12px; flex-wrap:wrap; margin-bottom:84px;
        }
        .landing-root .btn-w {
          font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500;
          background:var(--white); color:var(--bg);
          padding:13px 30px; border-radius:8px;
          text-decoration:none; display:inline-flex; align-items:center; gap:8px;
          transition:all .2s;
        }
        .landing-root .btn-w:hover { opacity:.91; box-shadow:0 0 0 4px rgba(255,255,255,.1); }
        .landing-root .btn-g {
          font-family:'DM Sans',sans-serif; font-size:14px; font-weight:400;
          color:var(--muted); border:1px solid var(--line2);
          padding:13px 24px; border-radius:8px;
          text-decoration:none; transition:all .2s;
        }
        .landing-root .btn-g:hover { color:var(--dim); border-color:rgba(255,255,255,.18); }

        /* Numbers */
        .landing-root .nums {
          display:grid; grid-template-columns:repeat(3,1fr);
          border:1px solid var(--line); border-radius:14px;
          overflow:hidden; max-width:560px; margin:0 auto;
          background:var(--bg1);
        }
        .landing-root .num-c { padding:28px 28px; border-right:1px solid var(--line); text-align:center; }
        .landing-root .num-c:last-child { border-right:none; }
        .landing-root .num-val {
          font-family:'Instrument Serif',serif; font-size:36px; font-weight:400;
          color:var(--white); letter-spacing:-.04em; line-height:1;
        }
        .landing-root .num-val sup { font-size:.5em; color:var(--dim); vertical-align:super; }
        .landing-root .num-lbl {
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.09em;
          text-transform:uppercase; color:var(--muted); margin-top:6px;
        }

        /* ── Common ── */
        .landing-root .wrap { max-width:1120px; margin:0 auto; padding:0 52px; }
        .landing-root .sec { padding:104px 0; }
        .landing-root .eye {
          font-family:'DM Mono',monospace; font-size:10.5px; font-weight:400;
          letter-spacing:.14em; text-transform:uppercase; color:var(--muted);
          display:block; margin-bottom:20px;
        }
        .landing-root .sec-h {
          font-family:'Instrument Serif',serif;
          font-size:clamp(36px,4.5vw,58px); font-weight:400;
          line-height:1.06; letter-spacing:-.035em; color:var(--white);
        }
        .landing-root .sec-p {
          font-size:15px; font-weight:300; color:var(--muted);
          max-width:420px; line-height:1.8; margin-top:16px;
        }

        /* ── Process ── */
        .landing-root .steps-list { border-top:1px solid var(--line); margin-top:64px; }
        .landing-root .step {
          display:grid; grid-template-columns:72px 1fr 1fr;
          border-bottom:1px solid var(--line); padding:52px 0;
          transition:background .25s;
        }
        .landing-root .step:hover { background:rgba(255,255,255,.016); }
        .landing-root .step-n {
          font-family:'DM Mono',monospace; font-size:11.5px; color:var(--muted);
          letter-spacing:.05em; padding-top:3px;
        }
        .landing-root .step-t {
          font-family:'Instrument Serif',serif; font-size:26px; color:var(--white);
          letter-spacing:-.02em; padding-right:52px; line-height:1.2;
        }
        .landing-root .step-b {
          font-size:14.5px; font-weight:300; color:var(--muted);
          line-height:1.8; max-width:360px;
        }

        /* ── Live ── */
        .landing-root .live-sec { background:var(--bg1); }
        .landing-root .live-top {
          display:flex; align-items:flex-end; justify-content:space-between;
          margin-bottom:56px;
        }
        .landing-root .live-link {
          font-family:'DM Mono',monospace; font-size:10.5px; color:var(--muted);
          text-decoration:none; letter-spacing:.1em; text-transform:uppercase;
          transition:color .2s;
        }
        .landing-root .live-link:hover { color:var(--dim); }
        .landing-root .cards { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .landing-root .card {
          background:var(--bg2); border:1px solid var(--line);
          border-radius:16px; padding:40px;
          transition:border-color .25s, transform .3s;
        }
        .landing-root .card:hover { border-color:var(--line2); transform:translateY(-3px); }
        .landing-root .ctag {
          display:inline-flex; align-items:center; gap:7px;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.1em;
          text-transform:uppercase; color:var(--muted);
          border:1px solid var(--line); padding:5px 13px; border-radius:100px;
          margin-bottom:30px;
        }
        .landing-root .ctag-dot { width:5px; height:5px; border-radius:50%; background:var(--dim); }
        .landing-root .card-head { display:flex; align-items:center; gap:16px; margin-bottom:18px; }
        .landing-root .card-ico {
          width:52px; height:52px; border-radius:12px;
          background:var(--bg3); border:1px solid var(--line);
          display:grid; place-items:center; font-size:21px; flex-shrink:0;
        }
        .landing-root .card-name {
          font-family:'Instrument Serif',serif; font-size:21px; color:var(--white);
          letter-spacing:-.02em; line-height:1.2;
        }
        .landing-root .card-sub { font-size:13px; color:var(--muted); margin-top:3px; }
        .landing-root .card-desc {
          font-size:14px; font-weight:300; color:var(--muted);
          line-height:1.78; margin-bottom:30px;
        }
        .landing-root .cstats { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; margin-bottom:30px; }
        .landing-root .cstat {
          background:var(--bg3); border:1px solid var(--line);
          border-radius:10px; padding:15px 10px; text-align:center;
        }
        .landing-root .cstat-v {
          font-family:'Instrument Serif',serif; font-size:21px; color:var(--white);
          letter-spacing:-.03em; line-height:1;
        }
        .landing-root .cstat-l {
          font-family:'DM Mono',monospace; font-size:9.5px; letter-spacing:.09em;
          text-transform:uppercase; color:var(--muted); margin-top:5px;
        }
        .landing-root .card-act {
          display:inline-flex; align-items:center; gap:7px;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
          color:var(--text); border:1px solid var(--line2);
          padding:10px 20px; border-radius:8px; text-decoration:none;
          transition:all .2s;
        }
        .landing-root .card-act:hover { background:rgba(255,255,255,.05); border-color:rgba(255,255,255,.2); }
        .landing-root .vthumb {
          width:100%; aspect-ratio:16/9; background:var(--bg3);
          border:1px solid var(--line); border-radius:12px;
          display:grid; place-items:center; position:relative;
          margin-bottom:24px; cursor:pointer; overflow:hidden;
        }
        .landing-root .vplay {
          width:46px; height:46px; border-radius:50%;
          background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.2);
          display:grid; place-items:center; transition:all .2s;
        }
        .landing-root .vthumb:hover .vplay { background:var(--white); border-color:var(--white); }
        .landing-root .vthumb:hover .vplay svg path { fill:var(--bg); }
        .landing-root .vtime {
          position:absolute; bottom:10px; right:12px;
          font-family:'DM Mono',monospace; font-size:10px; color:var(--dim);
          background:rgba(0,0,0,.6); padding:3px 7px; border-radius:4px;
        }

        /* ── Stats ── */
        .landing-root .stats-band {
          display:grid; grid-template-columns:repeat(3,1fr);
          border:1px solid var(--line); border-radius:16px;
          overflow:hidden; background:var(--bg1);
        }
        .landing-root .stat-c {
          padding:58px 52px; border-right:1px solid var(--line);
        }
        .landing-root .stat-c:last-child { border-right:none; }
        .landing-root .stat-eye {
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.12em;
          text-transform:uppercase; color:var(--muted); margin-bottom:14px; display:block;
        }
        .landing-root .stat-n {
          font-family:'Instrument Serif',serif;
          font-size:clamp(50px,5vw,70px); font-weight:400;
          color:var(--white); letter-spacing:-.05em; line-height:1;
        }
        .landing-root .stat-suf { color:var(--dim); }

        /* ── Pricing ── */
        .landing-root .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          margin-top: 64px;
        }
        .landing-root .pricing-card {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 40px;
          transition: all 0.3s ease;
          position: relative;
        }
        .landing-root .pricing-card:hover {
          border-color: var(--line2);
          transform: translateY(-4px);
        }
        .landing-root .pricing-card.featured {
          border-color: rgba(99, 102, 241, 0.3);
          background: linear-gradient(135deg, var(--bg2), rgba(99, 102, 241, 0.05));
          border-width: 2px;
        }
        .landing-root .pricing-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 4px 16px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
        }
        .landing-root .pricing-name {
          font-family: 'Instrument Serif', serif;
          font-size: 28px;
          font-weight: 400;
          color: var(--white);
          margin-bottom: 8px;
        }
        .landing-root .pricing-price {
          font-size: 48px;
          font-weight: 700;
          color: var(--white);
          margin: 24px 0;
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .landing-root .pricing-price span {
          font-size: 16px;
          font-weight: 400;
          color: var(--muted);
        }
        .landing-root .pricing-desc {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.7;
          margin-bottom: 32px;
        }
        .landing-root .pricing-features {
          list-style: none;
          padding: 0;
          margin: 0 0 32px 0;
        }
        .landing-root .pricing-features li {
          font-size: 14px;
          color: var(--text);
          padding: 12px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--line);
        }
        .landing-root .pricing-features li:last-child {
          border-bottom: none;
        }
        .landing-root .check-icon {
          flex-shrink: 0;
        }
        .landing-root .pricing-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .landing-root .pricing-btn.primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }
        .landing-root .pricing-btn.primary:hover {
          opacity: 0.9;
          transform: scale(1.02);
          box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
        }
        .landing-root .pricing-btn.secondary {
          background: var(--bg3);
          color: var(--text);
          border: 1px solid var(--line);
        }
        .landing-root .pricing-btn.secondary:hover {
          background: var(--bg2);
          border-color: var(--line2);
        }

        /* ── Features ── */
        .landing-root .feat-grid {
          display:grid; grid-template-columns:1fr 1fr; gap:12px;
          margin-top:64px;
        }
        .landing-root .feat {
          background:var(--bg1); border:1px solid var(--line);
          border-radius:16px; padding:44px;
          transition:border-color .25s, background .25s;
        }
        .landing-root .feat:hover { border-color:var(--line2); background:var(--bg2); }
        .landing-root .feat-wide { grid-column:span 2; }
        .landing-root .feat-ico {
          width:40px; height:40px; border-radius:10px;
          border:1px solid var(--line); display:grid; place-items:center;
          margin-bottom:28px;
        }
        .landing-root .feat h3 {
          font-family:'Instrument Serif',serif; font-size:23px; font-weight:400;
          color:var(--white); letter-spacing:-.025em; margin-bottom:12px;
        }
        .landing-root .feat p {
          font-size:14.5px; font-weight:300; color:var(--muted); line-height:1.8;
        }
        .landing-root .chips { display:flex; gap:8px; flex-wrap:wrap; margin-top:24px; }
        .landing-root .chip {
          font-family:'DM Mono',monospace; font-size:10.5px; letter-spacing:.06em;
          color:var(--dim); border:1px solid var(--line);
          padding:5px 14px; border-radius:100px;
        }

        /* ── Newsletter CTA ── */
        .landing-root .nl {
          background:var(--white); border-radius:20px; padding:76px 80px;
          display:flex; align-items:center; justify-content:space-between; gap:56px;
        }
        .landing-root .nl-text h2 {
          font-family:'Instrument Serif',serif;
          font-size:clamp(34px,3.8vw,50px); font-weight:400;
          color:var(--bg); letter-spacing:-.04em; line-height:1.05;
          margin-bottom:12px;
        }
        .landing-root .nl-text p { font-size:15px; font-weight:300; color:#4b5563; line-height:1.7; }
        .landing-root .nl-form { display:flex; gap:10px; flex-shrink:0; }
        .landing-root .nl-input {
          font-family:'DM Sans',sans-serif; font-size:14px; font-weight:300;
          background:#f1f5f9; border:1px solid #e2e8f0;
          color:var(--bg); padding:13px 18px; border-radius:8px;
          width:250px; outline:none; transition:border-color .2s;
        }
        .landing-root .nl-input::placeholder { color:#9ca3af; }
        .landing-root .nl-input:focus { border-color:#94a3b8; }
        .landing-root .nl-btn {
          font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:500;
          background:var(--bg); color:var(--white);
          padding:13px 24px; border-radius:8px;
          border:none; cursor:pointer; white-space:nowrap; transition:opacity .2s;
        }
        .landing-root .nl-btn:hover { opacity:.82; }

        /* ── Responsive ── */
        @media (max-width:920px) {
          .landing-root .wrap { padding:0 24px; }
          .landing-root .hero { padding:108px 24px 72px; }
          .landing-root .nums { grid-template-columns:1fr; max-width:280px; }
          .landing-root .num-c { border-right:none; border-bottom:1px solid var(--line); }
          .landing-root .num-c:last-child { border-bottom:none; }
          .landing-root .step { grid-template-columns:1fr; gap:14px; padding:40px 0; }
          .landing-root .step-n { display:none; }
          .landing-root .step-t { padding-right:0; }
          .landing-root .cards { grid-template-columns:1fr; }
          .landing-root .stats-band { grid-template-columns:1fr; }
          .landing-root .stat-c { border-right:none; border-bottom:1px solid var(--line); padding:40px 32px; }
          .landing-root .stat-c:last-child { border-bottom:none; }
          .landing-root .feat-grid { grid-template-columns:1fr; }
          .landing-root .feat-wide { grid-column:span 1; }
          .landing-root .nl { flex-direction:column; padding:48px 36px; gap:36px; }
          .landing-root .nl-form { flex-direction:column; width:100%; }
          .landing-root .nl-input { width:100%; }
        }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-inner">
          <div className="rise d1">
            <span className="hero-badge">
              <span className="hero-badge-dot" />
              AI-Powered Email Marketing
            </span>
          </div>

          <h1 className="rise d2">
            Turn Strangers into<br /><em>Paying Customers with Smart Email.</em>
          </h1>

          <p className="hero-p rise d3">
            Get more replies with AI-powered email that writes, sends, and tracks for you.
            Create professional campaigns that connect with your audience and grow your business.
          </p>

          <div className="hero-btns rise d4">
            <a href="/api/auth/google" className="btn-w">
              Get Started
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a href="#process" className="btn-g">See How It Works</a>
          </div>

          <div className="nums rise d5">
            <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
              Trusted by creators and businesses worldwide
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="sec" id="process">
        <div className="wrap">
          <span className="eye">How it Works</span>
          <h2 className="sec-h">Your Email Marketing Partner</h2>
          <p className="sec-p">
            Our AI crafts personalized emails that connect with your audience.
            Track engagement and follow up at the right moment to grow your business.
          </p>
          <div className="steps-list">
            {[
              { n: "01", t: "Connect Gmail in 30 seconds", b: "One click to connect your Gmail. We use Google's secure API — your emails send from YOUR address, building trust with every message." },
              { n: "02", t: "AI writes emails that connect", b: "Tell us about your product. Our AI crafts personalized, professional emails with a natural, conversational tone. Each email includes your website link and branded signature." },
              { n: "03", t: "Track engagement and grow", b: "Get notifications when someone opens or clicks. See who's interested and follow up at the perfect moment. Focus on closing deals while we handle the emails." },
            ].map((s) => (
              <div key={s.n} className="step">
                <span className="step-n">{s.n}</span>
                <h3 className="step-t">{s.t}</h3>
                <p className="step-b">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="sec" id="pricing" style={{ background: 'var(--bg1)' }}>
        <div className="wrap">
          <h2 className="sec-h" style={{ textAlign: 'center', marginBottom: 16 }}>Invest in Growth,<br />Not Features.</h2>
          <p className="sec-p" style={{ maxWidth: 500, marginBottom: 64, textAlign: 'center', margin: '0 auto 64px' }}>
            Choose the plan that fits your business. All plans include unlimited AI generation and real-time tracking.
          </p>
          <div className="pricing-grid">
            {/* Starter Plan */}
            <div className="pricing-card">
              <div className="pricing-name">Starter</div>
              <div className="pricing-price">
                $15<span>/month</span>
              </div>
              <p className="pricing-desc">Perfect for solopreneurs just getting started with email marketing.</p>
              <ul className="pricing-features">
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  100 emails/month
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Unlimited AI generation
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Open & click tracking
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Basic analytics
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Gmail integration
                </li>
              </ul>
              <a href="/pricing" className="pricing-btn primary" style={{ textDecoration: 'none' }}>
                Get Started
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginLeft: 4 }}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>

            {/* Pro Plan */}
            <div className="pricing-card featured">
              <div className="pricing-name">Professional</div>
              <div className="pricing-price">
                $29<span>/month</span>
              </div>
              <p className="pricing-desc">For growing businesses that need more emails and advanced features.</p>
              <ul className="pricing-features">
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  500 emails/month
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Everything in Starter
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Advanced analytics
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Custom templates
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Priority support
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Remove branding
                </li>
              </ul>
              <a href="/pricing" className="pricing-btn primary" style={{ textDecoration: 'none' }}>
                Get Started
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginLeft: 4 }}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>

            {/* Lifetime Plan */}
            <div className="pricing-card">
              <div className="pricing-name">Lifetime</div>
              <div className="pricing-price">
                $60<span style={{ fontSize: 16, color: 'var(--muted)' }}>/one-time</span>
              </div>
              <p className="pricing-desc">Pay once, use forever. All features, high-volume access. No monthly fees.</p>
              <ul className="pricing-features">
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Send personalized emails to contacts
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  All Pro features
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Lifetime access
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Early adopter perks
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  VIP support
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Pay once, own forever
                </li>
              </ul>
              <a href="/pricing" className="pricing-btn primary" style={{ textDecoration: 'none' }}>
                Get Started
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginLeft: 4 }}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE LEADS */}
      <section className="sec live-sec" id="live">
        <div className="wrap">
          <div className="live-top">
            <div>
              <span className="eye">Real-time Intelligence</span>
              <h2 className="sec-h">See When Someone Engages</h2>
            </div>
            <a href="/dashboard/analytics" className="live-link">See your analytics →</a>
          </div>
          <div className="cards">
            {/* Email Opened Card */}
            <div className="card">
              <div className="ctag"><span className="ctag-dot" />Email Opened</div>
              <div className="card-head">
                <div className="card-ico">📩</div>
                <div>
                  <div className="card-name">john@company.com</div>
                  <div className="card-sub">Opened "Quick question about your workflow"</div>
                </div>
              </div>
              <p className="card-desc">
                John opened your email 2 times and spent 45 seconds reading. Perfect time to follow up with a demo offer or case study.
              </p>
              <div className="cstats">
                {[{ v: "2", l: "Opens" }, { v: "1", l: "Clicks" }, { v: "Today", l: "Activity" }].map((s, i) => (
                  <div key={i} className="cstat"><div className="cstat-v">{s.v}</div><div className="cstat-l">{s.l}</div></div>
                ))}
              </div>
              <a href="/dashboard/analytics" className="card-act">
                View Full Details
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
            </div>

            {/* Link Clicked Card */}
            <div className="card">
              <div className="ctag"><span className="ctag-dot" />Link Clicked 🔥</div>
              <div className="card-head">
                <div className="card-ico">🔗</div>
                <div>
                  <div className="card-name">sarah@startup.io</div>
                  <div className="card-sub">Clicked your website link</div>
                </div>
              </div>
              <p className="card-desc">
                Sarah clicked through to your pricing page! This lead is showing strong interest. Send a personalized follow-up now.
              </p>
              <div className="cstats">
                {[{ v: "3", l: "Opens" }, { v: "2", l: "Clicks" }, { v: "Hot", l: "Lead" }].map((s, i) => (
                  <div key={i} className="cstat"><div className="cstat-v">{s.v}</div><div className="cstat-l">{s.l}</div></div>
                ))}
              </div>
              <a href="/dashboard/analytics" className="card-act">
                View Full Details
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="sec">
        <div className="wrap">
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
            <p style={{ fontSize: '15px', lineHeight: 1.7 }}>
              Trusted by creators, solopreneurs, and small businesses worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="sec" id="features" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <span className="eye">Why ClipVoBooster</span>
          <h2 className="sec-h">Everything You Need to<br />Grow Your Business.</h2>
          <div className="feat-grid">
            <div className="feat feat-wide">
              <div className="feat-ico">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--dim)" strokeWidth="1.6" strokeLinecap="round"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3>AI-Powered Email Writing</h3>
              <p>Our AI crafts professional emails that get read, remembered, and replied to. Each email includes your website link and sounds natural and conversational.</p>
              <div className="chips">
                {["Professional emails", "Natural tone", "Auto website link", "Beautiful HTML design"].map((c) => <span key={c} className="chip">{c}</span>)}
              </div>
            </div>
            <div className="feat">
              <div className="feat-ico">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--dim)" strokeWidth="1.6" strokeLinecap="round"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </div>
              <h3>Real-Time Email Tracking</h3>
              <p>Know when someone opens your email or clicks your link. Get notifications. See who's interested. Follow up at the perfect moment. Close more deals.</p>
            </div>
            <div className="feat">
              <div className="feat-ico">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--dim)" strokeWidth="1.6" strokeLinecap="round"><path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 0-2-2z" /></svg>
              </div>
              <h3>Professional Email Design</h3>
              <p>Beautiful gradient headers, clean typography, prominent CTA buttons, and your branded signature. Every email looks professional and trustworthy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="nl">
            <div className="nl-text">
              <h2>Ready to Grow Your Business?</h2>
              <p>Join businesses and creators using ClipVoBooster to convert strangers into loyal customers. Start sending professional emails today.</p>
            </div>
            <div className="nl-form">
              <a href="/api/auth/google" className="nl-btn" style={{ textDecoration: 'none' }}>
                Get Started
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLIANCE FOOTER */}
      <section style={{ padding: '40px 52px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '700px', margin: '0 auto' }}>
          ClipVoBooster helps you create and send professional email campaigns. 
          We support CAN-SPAM and GDPR compliance. You are responsible for obtaining 
          proper consent from your email recipients.
        </p>
      </section>
    </>
  );
}
