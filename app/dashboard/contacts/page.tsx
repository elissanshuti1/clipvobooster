"use client";

import { useEffect, useState } from "react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({ email: '', name: '', group: 'General' });
  const [newGroup, setNewGroup] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contactsRes, groupsRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/groups')
      ]);
      
      const contactsData = await contactsRes.json();
      const groupsData = await groupsRes.json();
      
      setContacts(contactsData || []);
      setGroups(groupsData || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load data:', err);
      setIsLoading(false);
    }
  };

  const addContact = async () => {
    if (!newContact.email) return;
    
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact)
      });
      
      if (res.ok) {
        setNewContact({ email: '', name: '', group: 'General' });
        setShowAddForm(false);
        loadData();
      }
    } catch (err) {
      console.error('Failed to add contact:', err);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await fetch(`/api/contacts?id=${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  };

  const createGroup = async () => {
    if (!newGroup) return;
    
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroup })
      });
      
      if (res.ok) {
        setNewGroup('');
        loadData();
      }
    } catch (err) {
      console.error('Failed to create group:', err);
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      await fetch(`/api/groups?id=${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error('Failed to delete group:', err);
    }
  };

  const sendToContact = (email: string) => {
    window.open(`/dashboard/compose?email=${encodeURIComponent(email)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div style={{ padding: 32, color: 'var(--muted)', textAlign: 'center' }}>
        Loading contacts...
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

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--white);
        }

        .btn {
          padding: 10px 20px;
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

        .btn-secondary {
          background: var(--bg2);
          color: var(--text);
          border: 1px solid var(--line);
        }

        .card {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .contact-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .contact-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: grid;
          place-items: center;
          font-size: 16px;
          font-weight: 600;
          color: var(--white);
        }

        .form-input {
          width: 100%;
          padding: 10px 14px;
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 8px;
          color: var(--text);
          font-size: 14px;
          margin-bottom: 12px;
        }

        .groups-container {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .group-tag {
          padding: 8px 16px;
          background: var(--bg3);
          border: 1px solid var(--line);
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
      `}</style>

      <div>
        <div className="page-header">
          <h1 className="page-title">📧 Your Contacts</h1>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            ➕ Add Contact
          </button>
        </div>

        {/* Add Contact Form */}
        {showAddForm && (
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--white)', marginBottom: 16 }}>
              Add New Contact
            </h3>
            <input
              type="email"
              className="form-input"
              placeholder="Email *"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Name"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Group (e.g., Customers, Subscribers)"
              value={newContact.group}
              onChange={(e) => setNewContact({ ...newContact, group: e.target.value })}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={addContact}>
                Save Contact
              </button>
              <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Groups */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--white)' }}>
              Groups
            </h3>
            <input
              type="text"
              placeholder="New group name"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              style={{ padding: '6px 12px', background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--text)' }}
              onKeyPress={(e) => e.key === 'Enter' && createGroup()}
            />
          </div>
          <div className="groups-container">
            {groups.map((group) => (
              <div key={group._id} className="group-tag">
                {group.name} ({group.contactCount || 0})
                <button
                  onClick={() => deleteGroup(group._id)}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Contacts List */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--white)', marginBottom: 16 }}>
            Contacts ({contacts.length})
          </h3>
          {contacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
              No contacts yet. Add your first contact!
            </div>
          ) : (
            contacts.map((contact) => (
              <div key={contact._id} className="contact-item">
                <div className="contact-info">
                  <div className="contact-avatar">
                    {(contact.name || contact.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>
                      {contact.name || 'Unnamed'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {contact.email} {contact.group && `• ${contact.group}`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => sendToContact(contact.email)}
                    style={{ padding: '6px 12px', fontSize: 13 }}
                  >
                    ✉️ Email
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => deleteContact(contact._id)}
                    style={{ padding: '6px 12px', fontSize: 13, background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
