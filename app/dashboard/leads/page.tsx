"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Lead {
  _id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  need: string;
  source: string;
  status: string;
  contacted: boolean;
  responded: boolean;
  notes: string;
  createdAt: string;
}

// Main content component that uses searchParams
function DashboardLeadsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'responded'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'Reddit' | 'HackerNews'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exportLeads = async () => {
    try {
      setExporting(true);
      const productId = searchParams.get('productId');
      const url = productId ? `/api/export?productId=${productId}` : '/api/export';
      
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'clipvo-leads.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        
        setNotification({ type: 'success', message: 'Leads exported successfully!' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to export leads' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setExporting(false);
    }
  };

  const deleteAllLeads = async () => {
    if (!confirm('⚠️ This will DELETE ALL your leads permanently. This cannot be undone!\n\nAre you sure you want to delete all leads?')) {
      return;
    }
    
    try {
      const res = await fetch('/api/leads', { method: 'DELETE' });
      if (res.ok) {
        const result = await res.json();
        setNotification({ type: 'success', message: `Deleted ${result.deletedCount} leads!` });
        setTimeout(() => setNotification(null), 3000);
        loadLeads();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete leads' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [searchParams]);

  const loadLeads = async () => {
    try {
      const productId = searchParams.get('productId');
      const url = productId ? `/api/leads?productId=${productId}` : '/api/leads';
      console.log('Loading leads from:', url);
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        console.log('Loaded leads:', data.length);
        setLeads(data);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const searchRealLeads = async () => {
    try {
      const productsRes = await fetch('/api/products');
      const products = await productsRes.json();
      
      if (products.length === 0) {
        setNotification({ type: 'error', message: 'Please create a product first!' });
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      
      const product = products[0];
      setSearching(true);
      
      const searchRes = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id })
      });
      
      const result = await searchRes.json();

      if (result.existing) {
        // Leads already exist, just reload
        setNotification({
          type: 'success',
          message: `You have ${result.count} leads. Contact them before finding more!`
        });
      } else if (result.count && result.count > 0) {
        setNotification({
          type: 'success',
          message: `Found ${result.count} quality leads!`
        });
      } else {
        setNotification({
          type: 'error',
          message: result.message || 'No quality leads found. Try a different product.'
        });
      }
      
      setTimeout(() => {
        setNotification(null);
        loadLeads();
      }, result.existing ? 3000 : 1500);
    } catch (err) {
      console.error('Failed to search:', err);
      setNotification({ type: 'error', message: 'Failed to search. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSearching(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status })
      });
      loadLeads();
    } catch (err) {
      console.error('Failed to update lead:', err);
    }
  };

  const filteredLeads = leads.filter(lead => {
    // Status filter
    if (filter === 'all') {
      // Continue to source filter
    } else if (filter === 'new') {
      if (lead.contacted) return false;
    } else if (filter === 'contacted') {
      if (!lead.contacted || lead.responded) return false;
    } else if (filter === 'responded') {
      if (!lead.responded) return false;
    }
    
    // Source filter
    if (sourceFilter !== 'all' && lead.source !== sourceFilter) {
      return false;
    }
    
    return true;
  });

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
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#5a6373', fontSize: 14 }}>Loading...</p>
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

        @keyframes rise { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .rise { animation: rise .6s cubic-bezier(.16,1,.3,1) both; }
        @keyframes slideIn { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }

        .notification {
          position: fixed;
          top: 80px;
          right: 20px;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .notification.success {
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
          color: #4ade80;
        }
        .notification.error {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
          color: #f87171;
        }

        .leads-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
        }
        .page-title { font-size: 24px; font-weight: 700; color: var(--white); }
        .filter-bar { display: flex; gap: 8px; }
        .filter-btn {
          padding: 8px 16px; border-radius: 100px;
          background: var(--bg1); border: 1px solid var(--line);
          color: var(--muted); font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
        }
        .filter-btn:hover { border-color: var(--line2); color: var(--dim); }
        .filter-btn.active {
          background: var(--white); color: var(--bg);
          border-color: var(--white);
        }

        .leads-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 16px;
        }
        .lead-card {
          background: var(--bg1); border: 1px solid var(--line);
          border-radius: 14px; padding: 20px;
          transition: all 0.2s;
        }
        .lead-card:hover {
          border-color: var(--line2);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .lead-header {
          display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;
        }
        .lead-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: grid; place-items: center;
          font-size: 18px; font-weight: 700; color: white;
          flex-shrink: 0;
        }
        .lead-info { flex: 1; min-width: 0; }
        .lead-name {
          font-size: 16px; font-weight: 600; color: var(--white);
          margin-bottom: 4px;
        }
        .lead-role {
          font-size: 13px; color: var(--muted);
        }
        .lead-company {
          font-size: 12px; color: var(--dim);
          background: var(--bg3); padding: 4px 10px; border-radius: 100px;
          display: inline-block; margin-top: 6px;
        }
        .lead-need {
          font-size: 14px; color: var(--text); line-height: 1.6;
          margin-bottom: 16px; padding: 12px;
          background: var(--bg2); border-radius: 10px;
          border-left: 3px solid #4ade80;
          max-height: 120px; overflow-y: auto;
        }
        .lead-need::-webkit-scrollbar {
          width: 4px;
        }
        .lead-need::-webkit-scrollbar-thumb {
          background: var(--line2); border-radius: 2px;
        }
        .lead-meta {
          display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;
        }
        .meta-tag {
          font-size: 11px; color: var(--muted);
          background: var(--bg3); padding: 4px 10px; border-radius: 100px;
        }
        .status-badge {
          font-size: 11px; font-weight: 600;
          padding: 4px 10px; border-radius: 100px;
          text-transform: uppercase;
        }
        .status-new { background: rgba(74, 222, 128, 0.1); color: #4ade80; }
        .status-contacted { background: rgba(96, 165, 250, 0.1); color: #60a5fa; }
        .status-responded { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
        
        .lead-actions {
          display: flex; gap: 8px;
        }
        .action-btn {
          flex: 1; padding: 10px 16px; border-radius: 8px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; border: none;
        }
        .action-btn.primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }
        .action-btn.secondary {
          background: var(--bg2); color: var(--text);
          border: 1px solid var(--line);
        }
        .action-btn:hover { opacity: 0.9; transform: scale(1.02); }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .empty-state {
          text-align: center; padding: 60px 20px; color: var(--muted);
        }
        .empty-state-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.3; }

        .modal-btn:hover { opacity: 0.9; }
      `}</style>

      <div className="rise">
        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.type === 'success' ? '✅' : '❌'} {notification.message}
          </div>
        )}
        
        <div className="leads-header">
          <div>
            <h1 className="page-title">Find Real Customers</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
              🔍 Searches Reddit & HackerNews for REAL people asking for help
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={deleteAllLeads}
              disabled={leads.length === 0}
              style={{
                padding: '10px 16px',
                background: leads.length === 0 ? 'var(--bg2)' : 'rgba(248, 113, 113, 0.1)',
                color: leads.length === 0 ? 'var(--muted)' : '#f87171',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                borderRadius: 10,
                fontWeight: 600,
                cursor: leads.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              title="Delete all leads"
            >
              🗑️ Clear All
            </button>
            <button
              onClick={exportLeads}
              disabled={exporting || leads.length === 0}
              style={{
                padding: '10px 16px',
                background: exporting || leads.length === 0 ? 'var(--bg2)' : 'var(--bg3)',
                color: exporting || leads.length === 0 ? 'var(--muted)' : 'var(--text)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                fontWeight: 500,
                cursor: exporting || leads.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              title="Export leads as CSV"
            >
              {exporting ? '⏳ Exporting...' : '📥 Export CSV'}
            </button>
            <button
              onClick={searchRealLeads}
              disabled={searching}
              style={{
                padding: '12px 20px',
                background: searching ? 'var(--muted)' : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontWeight: 600,
                cursor: searching ? 'not-allowed' : 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: searching ? 0.7 : 1
              }}
            >
              {searching ? '⏳ Searching...' : '🎯 Find Real People'}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Filter by:</span>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({leads.length})
          </button>
          <button
            className={`filter-btn ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            New ({leads.filter(l => !l.contacted).length})
          </button>
          <button
            className={`filter-btn ${filter === 'contacted' ? 'active' : ''}`}
            onClick={() => setFilter('contacted')}
          >
            Contacted ({leads.filter(l => l.contacted && !l.responded).length})
          </button>
          <button
            className={`filter-btn ${filter === 'responded' ? 'active' : ''}`}
            onClick={() => setFilter('responded')}
          >
            Responded ({leads.filter(l => l.responded).length})
          </button>
          <div style={{ width: 1, height: 24, background: 'var(--line)', margin: '0 8px' }} />
          <button
            className={`filter-btn ${sourceFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSourceFilter('all')}
          >
            All Sources
          </button>
          <button
            className={`filter-btn ${sourceFilter === 'Reddit' ? 'active' : ''}`}
            onClick={() => setSourceFilter('Reddit')}
          >
            Reddit
          </button>
          <button
            className={`filter-btn ${sourceFilter === 'HackerNews' ? 'active' : ''}`}
            onClick={() => setSourceFilter('HackerNews')}
          >
            HackerNews
          </button>
        </div>

        {filteredLeads.length > 0 ? (
          <div className="leads-grid">
            {filteredLeads.map((lead) => (
              <div key={lead._id} className="lead-card rise">
                <div className="lead-header">
                  <div className="lead-avatar">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="lead-info">
                    <div className="lead-name">{lead.name}</div>
                    <div className="lead-role">{lead.role || 'Professional'}</div>
                    <div className="lead-company">{lead.company || 'Unknown Company'}</div>
                  </div>
                  <span className={`status-badge status-${lead.responded ? 'responded' : lead.contacted ? 'contacted' : 'new'}`}>
                    {lead.responded ? 'Responded' : lead.contacted ? 'Contacted' : 'New'}
                  </span>
                </div>
                
                <div className="lead-need">
                  <strong>📝 Their Post:</strong> {lead.need}
                </div>
                
                <div className="lead-meta">
                  {lead.location && (
                    <span className="meta-tag">📍 {lead.location}</span>
                  )}
                  <span className="meta-tag">👤 u/{lead.name}</span>
                  <span className="meta-tag">📅 {new Date(lead.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="lead-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => {
                      if (lead.postUrl) {
                        window.open(lead.postUrl, '_blank');
                      } else {
                        alert('No post URL available');
                      }
                    }}
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    title="Opens their post - you can reply or send them a DM"
                  >
                    💬 Message
                  </button>
                  <button
                    className="action-btn secondary"
                    onClick={() => updateLeadStatus(lead._id, lead.responded ? 'new' : 'responded')}
                  >
                    {lead.responded ? '↩️ Mark Unread' : '✓ Mark Contacted'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state rise">
            <div className="empty-state-icon">🎯</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
              No leads found
            </div>
            <div>
              {leads.length === 0 
                ? "Generate leads for your products to see them here"
                : "Try a different filter"}
            </div>
            {leads.length === 0 && (
              <button
                className="action-btn primary"
                style={{ marginTop: 20, display: 'inline-flex' }}
                onClick={() => router.push('/dashboard/products')}
              >
                Go to Products
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Main page component with Suspense boundary
export default function DashboardLeads() {
  return (
    <Suspense fallback={
      <div style={{ padding: 32, color: 'var(--muted)', textAlign: 'center' }}>
        Loading...
      </div>
    }>
      <DashboardLeadsContent />
    </Suspense>
  );
}
