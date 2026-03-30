'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '' });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });

      const data = await res.json();

      if (res.ok) {
        setNewTemplate({ name: '', subject: '', body: '' });
        setShowForm(false);
        loadTemplates();
        alert('✅ Template saved!');
      } else {
        alert('❌ ' + data.error);
      }
    } catch (err) {
      alert('❌ Failed to save template');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;

    try {
      await fetch(`/api/templates?id=${id}`, { method: 'DELETE' });
      loadTemplates();
      alert('✅ Template deleted');
    } catch (err) {
      alert('❌ Failed to delete template');
    }
  };

  const handleLoadTemplate = (template: any) => {
    // Redirect to compose with template content
    router.push(`/dashboard/compose?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#08090d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
        .page-container { min-height: 100vh; background: var(--bg); padding: 80px 32px 32px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; max-width: 1200px; margin: 0 auto 32px; }
        .page-title { font-size: 28px; font-weight: 700; color: var(--white); }
        .btn { padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3); }
        .btn-secondary { background: var(--bg2); color: var(--text); border: 1px solid var(--line); }
        .btn-secondary:hover { background: var(--bg3); }
        .templates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto; }
        .template-card { background: var(--bg2); border: 1px solid var(--line); border-radius: 14px; padding: 24px; transition: all 0.2s; }
        .template-card:hover { border-color: var(--line2); transform: translateY(-2px); }
        .template-name { font-size: 18px; font-weight: 600; color: var(--white); margin-bottom: 8px; }
        .template-subject { font-size: 14px; color: var(--dim); margin-bottom: 16px; }
        .template-body { font-size: 13px; color: var(--muted); line-height: 1.6; background: var(--bg1); padding: 16px; border-radius: 8px; margin-bottom: 16px; max-height: 150px; overflow-y: auto; }
        .template-actions { display: flex; gap: 8px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: var(--bg2); border: 1px solid var(--line); border-radius: 16px; padding: 32px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; }
        .modal-title { font-size: 20px; font-weight: 700; color: var(--white); margin-bottom: 24px; }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
        .form-input, .form-textarea { width: 100%; padding: 12px 16px; border-radius: 10px; border: 1px solid var(--line); background: var(--bg1); color: var(--text); font-size: 14px; font-family: inherit; }
        .form-input:focus, .form-textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
        .form-textarea { min-height: 200px; resize: vertical; }
        .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
        .preset-badge { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 100px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
      `}</style>

      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">📝 Email Templates</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Template
          </button>
        </div>

        <div className="templates-grid">
          {templates.map((template) => (
            <div key={template._id} className="template-card">
              {template.isPreset && <span className="preset-badge">✨ Preset</span>}
              <div className="template-name">{template.name}</div>
              <div className="template-subject">{template.subject}</div>
              <div className="template-body">{template.body}</div>
              <div className="template-actions">
                <button className="btn btn-primary" onClick={() => handleLoadTemplate(template)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Use Template
                </button>
                {!template.isPreset && (
                  <button className="btn btn-secondary" onClick={() => handleDelete(template._id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create New Template</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Template Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Cold Outreach Follow-up"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subject Line</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Quick follow-up"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Body</label>
                <textarea
                  className="form-textarea"
                  placeholder="Write your email template here..."
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isCreating}>
                  {isCreating ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
