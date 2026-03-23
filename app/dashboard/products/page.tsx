"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  targetAudience: string;
  url: string;
  price?: number;
  features: string[];
  painPoints: string[];
  uniqueSellingPoint: string;
  status: string;
  emailsSent: number;
}

export default function DashboardProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'SaaS',
    targetAudience: '',
    url: '',
    price: '',
    features: '',
    painPoints: '',
    uniqueSellingPoint: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      console.log('Loading products...');
      const res = await fetch('/api/products', {
        cache: 'no-store'
      });
      console.log('Products response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Products data:', data);
        setProducts(data);
      } else {
        console.error('Failed to load products:', res.status);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (creatingProduct) return; // Prevent double submission
    
    setCreatingProduct(true);
    
    const productData = {
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null,
      features: formData.features.split('\n').filter(f => f.trim()),
      painPoints: formData.painPoints.split('\n').filter(p => p.trim())
    };
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (res.ok) {
        setShowAddModal(false);
        setCreatingProduct(false);
        setFormData({
          name: '', description: '', category: 'SaaS', targetAudience: '',
          url: '', price: '', features: '', painPoints: '', uniqueSellingPoint: ''
        });
        loadProducts();
      }
    } catch (err) {
      console.error('Failed to create product:', err);
    } finally {
      setCreatingProduct(false);
    }
  };

  const deleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Delete "${productName}"?\n\nThis will also delete:\n• All associated campaigns\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });

      const result = await res.json();

      if (res.ok) {
        setNotification({ type: 'success', message: `Deleted "${productName}"` });
        setTimeout(() => setNotification(null), 3000);
        loadProducts();
      } else {
        setNotification({ type: 'error', message: result.error || 'Failed to delete' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      setNotification({ type: 'error', message: 'Failed to delete product' });
      setTimeout(() => setNotification(null), 3000);
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
        <div style={{ 
          textAlign: 'center',
          color: '#dde1e9'
        }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '3px solid rgba(255,255,255,0.1)',
            borderTop: '3px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#5a6373', fontSize: 14 }}>Loading products...</p>
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

        .products-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px;
        }
        .page-title { font-size: 24px; font-weight: 700; color: var(--white); }
        .add-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 20px; background: var(--white); color: var(--bg);
          border: none; border-radius: 10px; font-weight: 600; cursor: pointer;
          transition: transform 0.15s;
        }
        .add-btn:hover { transform: scale(1.02); }

        .products-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 16px;
        }
        .product-card {
          background: var(--bg1); border: 1px solid var(--line);
          border-radius: 14px; padding: 24px;
          transition: all 0.2s;
        }
        .product-card:hover {
          border-color: var(--line2);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .product-header {
          display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;
        }
        .product-icon {
          width: 56px; height: 56px; border-radius: 14px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: grid; place-items: center; font-size: 24px; flex-shrink: 0;
        }
        .product-name {
          font-size: 18px; font-weight: 600; color: var(--white);
          margin-bottom: 4px;
        }
        .product-category {
          font-size: 12px; color: var(--muted);
          background: var(--bg3); padding: 4px 10px; border-radius: 100px;
          display: inline-block;
        }
        .product-description {
          font-size: 14px; color: var(--muted); line-height: 1.6;
          margin-bottom: 16px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .product-stats {
          display: flex; gap: 16px; margin-bottom: 16px; padding-top: 16px;
          border-top: 1px solid var(--line);
        }
        .stat { text-align: center; }
        .stat-value { font-size: 20px; font-weight: 700; color: var(--white); }
        .stat-label { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .product-actions {
          display: flex; gap: 8px;
        }
        .action-btn {
          flex: 1; padding: 10px 16px; border-radius: 8px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; border: none;
        }
        .action-btn.primary {
          background: var(--white); color: var(--bg);
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
        .empty-state-title { font-size: 18px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
        .empty-state-text { font-size: 14px; margin-bottom: 24px; }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px); z-index: 100;
          display: grid; place-items: center; padding: 20px;
        }
        .modal {
          background: var(--bg1); border: 1px solid var(--line2);
          border-radius: 16px; padding: 32px; width: 100%; max-width: 600px;
          max-height: 90vh; overflow-y: auto;
          animation: rise 0.3s cubic-bezier(.16,1,.3,1);
        }
        .modal-title {
          font-size: 22px; font-weight: 700; color: var(--white);
          margin-bottom: 8px;
        }
        .modal-subtitle {
          font-size: 14px; color: var(--muted); margin-bottom: 24px;
        }
        .form-group { margin-bottom: 20px; }
        .form-label {
          display: block; font-size: 13px; font-weight: 500;
          color: var(--text); margin-bottom: 8px;
        }
        .form-input, .form-textarea, .form-select {
          width: 100%; padding: 12px 14px;
          background: var(--bg2); border: 1px solid var(--line);
          border-radius: 10px; color: var(--text);
          font-family: 'Figtree', sans-serif; font-size: 14px;
          outline: none; transition: border-color 0.2s;
        }
        .form-input:focus, .form-textarea:focus, .form-select:focus {
          border-color: var(--line2);
        }
        .form-textarea { min-height: 100px; resize: vertical; }
        .form-hint {
          font-size: 12px; color: var(--muted); margin-top: 6px;
        }
        .modal-actions {
          display: flex; gap: 12px; margin-top: 24px;
        }
        .modal-btn {
          flex: 1; padding: 14px; border-radius: 10px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; border: none;
        }
        .modal-btn.cancel {
          background: var(--bg2); color: var(--text);
          border: 1px solid var(--line);
        }
        .modal-btn.submit {
          background: var(--white); color: var(--bg);
        }
        .modal-btn:hover { opacity: 0.9; }
      `}</style>

      <div className="rise">
        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.type === 'success' ? '✅' : '❌'} {notification.message}
          </div>
        )}
        
        <div className="products-header">
          <h1 className="page-title">Your Products</h1>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            <span>➕</span> Add Product
          </button>
        </div>

        {products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card rise">
                <div className="product-header">
                  <div className="product-icon">🚀</div>
                  <div>
                    <div className="product-name">{product.name}</div>
                    <span className="product-category">{product.category}</span>
                  </div>
                </div>
                <div className="product-description">{product.description}</div>
                <div className="product-stats">
                  <div className="stat">
                    <div className="stat-value">{product.emailsSent}</div>
                    <div className="stat-label">Emails</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{product.status}</div>
                    <div className="stat-label">Status</div>
                  </div>
                </div>
                <div className="product-actions">
                  <button
                    className="action-btn secondary"
                    onClick={() => deleteProduct(product._id, product.name)}
                    style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)' }}
                    title="Delete product and all its data"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state rise">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">No products yet</div>
            <div className="empty-state-text">
              Add your first product to start managing your email campaigns
            </div>
            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              <span>➕</span> Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Add New Product</h2>
            <p className="modal-subtitle">Tell us about your product and start managing your email campaigns</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  className="form-input"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., TaskFlow Pro"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="SaaS">SaaS</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Digital Product">Digital Product</option>
                  <option value="Service">Service</option>
                  <option value="Physical Product">Physical Product</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe what your product does and its main benefits..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <textarea
                  className="form-textarea"
                  value={formData.targetAudience}
                  onChange={e => setFormData({...formData, targetAudience: e.target.value})}
                  placeholder="Who is your ideal audience? (e.g., Small business owners, marketers, developers)"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Product URL</label>
                <input
                  className="form-input"
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  placeholder="https://yourproduct.com"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Price (optional)</label>
                <input
                  className="form-input"
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  placeholder="99"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Key Features (one per line)</label>
                <textarea
                  className="form-textarea"
                  value={formData.features}
                  onChange={e => setFormData({...formData, features: e.target.value})}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Pain Points You Solve (one per line)</label>
                <textarea
                  className="form-textarea"
                  value={formData.painPoints}
                  onChange={e => setFormData({...formData, painPoints: e.target.value})}
                  placeholder="Problem 1&#10;Problem 2&#10;Problem 3"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Unique Selling Point</label>
                <textarea
                  className="form-textarea"
                  value={formData.uniqueSellingPoint}
                  onChange={e => setFormData({...formData, uniqueSellingPoint: e.target.value})}
                  placeholder="What makes you different from competitors?"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="modal-btn cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-btn submit" disabled={creatingProduct}>
                  {creatingProduct ? '⏳ Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
