"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdvertisingMethod {
  id: number;
  name: string;
  icon: string;
  description: string;
  credits: number;
  category: string;
}

export default function DashboardAdvertising() {
  const router = useRouter();
  const [methods, setMethods] = useState<AdvertisingMethod[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [executingMethod, setExecutingMethod] = useState<number | null>(null);

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      const res = await fetch('/api/advertising-methods');
      if (res.ok) {
        const data = await res.json();
        setMethods(data);
      }
    } catch (err) {
      console.error('Failed to load methods:', err);
    }
  };

  const executeMethod = async (method: AdvertisingMethod) => {
    setExecutingMethod(method.id);
    try {
      const res = await fetch('/api/advertising-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodId: method.id })
      });
      
      if (res.ok) {
        alert(`${method.name} executed successfully! Check your campaigns.`);
        router.push('/dashboard/campaigns');
      }
    } catch (err) {
      console.error('Failed to execute method:', err);
      alert('Failed to execute. Please try again.');
    } finally {
      setExecutingMethod(null);
    }
  };

  const categories = ['all', ...Array.from(new Set(methods.map(m => m.category)))];
  const filteredMethods = selectedCategory === 'all' 
    ? methods 
    : methods.filter(m => m.category === selectedCategory);

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

        .header {
          margin-bottom: 24px;
        }
        .page-title {
          font-size: 24px; font-weight: 700; color: var(--white);
          margin-bottom: 8px;
        }
        .page-subtitle {
          font-size: 14px; color: var(--muted);
        }

        .category-bar {
          display: flex; gap: 8px; margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .category-btn {
          padding: 8px 16px; border-radius: 100px;
          background: var(--bg1); border: 1px solid var(--line);
          color: var(--muted); font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
        }
        .category-btn:hover { border-color: var(--line2); color: var(--dim); }
        .category-btn.active {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; border-color: transparent;
        }

        .methods-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .method-card {
          background: var(--bg1); border: 1px solid var(--line);
          border-radius: 14px; padding: 20px;
          transition: all 0.2s; cursor: pointer;
        }
        .method-card:hover {
          border-color: var(--line2);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.4);
        }
        .method-icon {
          width: 56px; height: 56px; border-radius: 14px;
          background: var(--bg3); border: 1px solid var(--line);
          display: grid; place-items: center; font-size: 28px;
          margin-bottom: 16px;
        }
        .method-name {
          font-size: 16px; font-weight: 600; color: var(--white);
          margin-bottom: 8px;
        }
        .method-description {
          font-size: 13px; color: var(--muted); line-height: 1.6;
          margin-bottom: 16px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .method-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 16px; border-top: 1px solid var(--line);
        }
        .method-category {
          font-size: 11px; color: var(--muted);
          background: var(--bg3); padding: 4px 10px; border-radius: 100px;
        }
        .method-credits {
          font-size: 13px; font-weight: 600; color: #fbbf24;
          display: flex; align-items: center; gap: 4px;
        }
        .execute-btn {
          width: 100%; padding: 12px; margin-top: 12px;
          background: var(--white); color: var(--bg);
          border: none; border-radius: 10px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.15s;
        }
        .execute-btn:hover { opacity: 0.9; transform: scale(1.02); }
        .execute-btn:disabled {
          opacity: 0.5; cursor: not-allowed; transform: none;
        }

        .info-banner {
          background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1));
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 14px; padding: 20px; margin-bottom: 24px;
          display: flex; gap: 16px; align-items: flex-start;
        }
        .info-icon {
          font-size: 32px; flex-shrink: 0;
        }
        .info-content {
          flex: 1;
        }
        .info-title {
          font-size: 16px; font-weight: 600; color: var(--white);
          margin-bottom: 4px;
        }
        .info-text {
          font-size: 13px; color: var(--muted); line-height: 1.6;
        }
      `}</style>

      <div className="rise">
        <div className="header">
          <h1 className="page-title">🎯 Advertising Methods</h1>
          <p className="page-subtitle">25+ powerful ways to promote your products and find customers</p>
        </div>

        <div className="info-banner rise">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <div className="info-title">How it works</div>
            <div className="info-text">
              Select any advertising method below to execute it. Our AI will help you create campaigns, 
              generate content, and find potential customers. Credits are deducted based on the method complexity.
            </div>
          </div>
        </div>

        <div className="category-bar rise">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? '📋 All' : cat}
            </button>
          ))}
        </div>

        <div className="methods-grid">
          {filteredMethods.map((method) => (
            <div key={method.id} className="method-card rise">
              <div className="method-icon">{method.icon}</div>
              <div className="method-name">{method.name}</div>
              <div className="method-description">{method.description}</div>
              <div className="method-footer">
                <span className="method-category">{method.category}</span>
                <span className="method-credits">⚡ {method.credits} credits</span>
              </div>
              <button
                className="execute-btn"
                onClick={() => executeMethod(method)}
                disabled={executingMethod === method.id}
              >
                {executingMethod === method.id ? '⏳ Executing...' : '🚀 Execute'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
