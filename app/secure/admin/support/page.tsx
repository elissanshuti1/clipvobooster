'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSupportPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv._id);
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => loadMessages(selectedConv._id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConv]);

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/admin/support');
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await fetch('/api/support');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    try {
      await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConv._id,
          message: newMessage,
        }),
      });

      setNewMessage('');
      loadMessages(selectedConv._id);
      loadConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
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
        :root { --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --line: rgba(255,255,255,0.07); --text: #dde1e9; --muted: #5a6373; --white: #ffffff; }
        .page-container { min-height: 100vh; background: var(--bg); display: flex; }
        .sidebar { width: 400px; border-right: 1px solid var(--line); background: var(--bg1); }
        .sidebar-header { padding: 24px; border-bottom: 1px solid var(--line); }
        .sidebar-title { font-size: 20px; font-weight: 700; color: var(--white); margin-bottom: 4px; }
        .sidebar-subtitle { font-size: 13px; color: var(--muted); }
        .conversation-list { overflow-y: auto; max-height: calc(100vh - 100px); }
        .conversation-item { padding: 16px 24px; border-bottom: 1px solid var(--line); cursor: pointer; transition: all 0.2s; }
        .conversation-item:hover { background: var(--bg2); }
        .conversation-item.active { background: var(--bg2); border-left: 3px solid #6366f1; }
        .conv-name { font-size: 15px; font-weight: 600; color: var(--white); margin-bottom: 4px; }
        .conv-email { font-size: 13px; color: var(--muted); margin-bottom: 8px; }
        .conv-preview { font-size: 13px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .chat-area { flex: 1; display: flex; flex-direction: column; }
        .chat-header { padding: 24px; border-bottom: 1px solid var(--line); background: var(--bg1); }
        .chat-user { font-size: 18px; font-weight: 700; color: var(--white); }
        .chat-plan { font-size: 13px; color: #10b981; margin-top: 4px; }
        .messages-container { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        .message { max-width: 70%; padding: 14px 18px; border-radius: 14px; font-size: 14px; line-height: 1.5; }
        .message.user { align-self: flex-start; background: var(--bg2); color: var(--text); }
        .message.admin { align-self: flex-end; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; }
        .message-input { padding: 24px; border-top: 1px solid var(--line); display: flex; gap: 12px; }
        .message-input input { flex: 1; padding: 14px 18px; border-radius: 12px; border: 1px solid var(--line); background: var(--bg2); color: var(--text); font-size: 14px; }
        .message-input input:focus { outline: none; border-color: #6366f1; }
        .btn { padding: 14px 24px; border-radius: 12px; border: none; font-weight: 600; font-size: 14px; cursor: pointer; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .empty-state { flex: 1; display: flex; alignItems: 'center'; justifyContent: 'center'; color: var(--muted); font-size: 15px; }
      `}</style>

      <div className="page-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">💬 Support Messages</div>
            <div className="sidebar-subtitle">{conversations.length} conversations</div>
          </div>
          <div className="conversation-list">
            {conversations.map((conv) => (
              <div
                key={conv._id}
                className={`conversation-item ${selectedConv?._id === conv._id ? 'active' : ''}`}
                onClick={() => setSelectedConv(conv)}
              >
                <div className="conv-name">{conv.userName}</div>
                <div className="conv-email">{conv.userEmail} • {conv.userPlan}</div>
                <div className="conv-preview">{conv.lastMessage || 'No messages yet'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-area">
          {selectedConv ? (
            <>
              <div className="chat-header">
                <div className="chat-user">{selectedConv.userName}</div>
                <div className="chat-plan">{selectedConv.userPlan} Plan • {selectedConv.userEmail}</div>
              </div>
              <div className="messages-container">
                {messages.map((msg, i) => (
                  <div key={i} className={`message ${msg.sender}`}>
                    {msg.message}
                  </div>
                ))}
              </div>
              <form className="message-input" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                />
                <button type="submit" className="btn" disabled={!newMessage.trim()}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="empty-state">Select a conversation to start chatting</div>
          )}
        </div>
      </div>
    </>
  );
}
