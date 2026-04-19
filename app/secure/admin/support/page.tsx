'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  _id?: string;
  sender: string;
  message: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  userName: string;
  userEmail: string;
  userPlan: string;
  lastMessage: string;
  lastMessageAt: string;
  status: string;
}

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv._id);
      const interval = setInterval(() => loadMessages(selectedConv._id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      const res = await fetch(`/api/admin/support?conversationId=${conversationId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    setSending(true);
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
    } finally {
      setSending(false);
    }
  };

  const selectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    setMobileView('chat');
  };

  const goBack = () => {
    setSelectedConv(null);
    setMobileView('list');
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
        .page-container { min-height: calc(100vh - 100px); background: var(--bg); display: flex; border-radius: 12px; overflow: hidden; }
        .sidebar { width: 100%; max-width: 400px; border-right: 1px solid var(--line); background: var(--bg1); display: flex; flex-direction: column; }
        .sidebar.hidden { display: none; }
        .chat-area { flex: 1; display: flex; flex-direction: column; background: var(--bg1); }
        .chat-area.hidden { display: none; }
        .sidebar-header { padding: 20px; border-bottom: 1px solid var(--line); }
        .sidebar-title { font-size: 20px; font-weight: 700; color: var(--white); margin-bottom: 4px; }
        .sidebar-subtitle { font-size: 13px; color: var(--muted); }
        .conversation-list { flex: 1; overflow-y: auto; }
        .conversation-item { padding: 16px 20px; border-bottom: 1px solid var(--line); cursor: pointer; transition: all 0.2s; }
        .conversation-item:hover { background: var(--bg2); }
        .conversation-item.active { background: var(--bg2); border-left: 3px solid #6366f1; }
        .conv-name { font-size: 15px; font-weight: 600; color: var(--white); margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; }
        .conv-email { font-size: 13px; color: var(--muted); margin-bottom: 8px; }
        .conv-preview { font-size: 13px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .conv-time { font-size: 11px; color: var(--muted); }
        .conv-status { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .chat-header { padding: 16px 20px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
        .back-btn { background: none; border: none; color: var(--text); font-size: 18px; cursor: pointer; padding: 8px; display: none; }
        .chat-user { flex: 1; }
        .chat-user-name { font-size: 16px; font-weight: 600; color: var(--white); }
        .chat-user-plan { font-size: 12px; color: #10b981; }
        .messages-container { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .message { max-width: 75%; padding: 12px 16px; border-radius: 14px; font-size: 14px; line-height: 1.5; word-wrap: break-word; }
        .message.user { align-self: flex-start; background: var(--bg2); color: var(--text); border-bottom-left-radius: 4px; }
        .message.admin { align-self: flex-end; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-bottom-right-radius: 4px; }
        .message-time { font-size: 10px; color: var(--muted); margin-top: 4px; }
        .message.admin .message-time { color: rgba(255,255,255,0.7); text-align: right; }
        .message-input-area { padding: 16px; border-top: 1px solid var(--line); display: flex; gap: 12px; align-items: flex-end; }
        .message-input { flex: 1; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--line); background: var(--bg2); color: var(--text); font-size: 14px; resize: none; min-height: 44px; max-height: 120px; }
        .message-input:focus { outline: none; border-color: #6366f1; }
        .send-btn { padding: 12px 20px; border-radius: 12px; border: none; font-weight: 600; font-size: 14px; cursor: pointer; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .empty-state { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--muted); font-size: 15px; }
        .plan-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; background: rgba(99, 102, 241, 0.1); color: #6366f1; margin-left: 8px; }
        @media (max-width: 768px) {
          .page-container { flex-direction: column; min-height: calc(100vh - 120px); }
          .sidebar { max-width: 100%; }
          .sidebar.hidden { display: none; }
          .chat-area.hidden { display: none; }
          .chat-area { width: 100%; }
          .back-btn { display: block; }
        }
        @media (min-width: 769px) {
          .back-btn { display: none !important; }
          .sidebar.hidden { display: flex !important; }
          .chat-area.hidden { display: flex !important; }
        }
      `}</style>

      <div className="page-container">
        <div className={`sidebar ${mobileView === 'chat' ? 'hidden' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-title">💬 Support Messages</div>
            <div className="sidebar-subtitle">{conversations.length} conversations</div>
          </div>
          <div className="conversation-list">
            {conversations.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv._id}
                  className={`conversation-item ${selectedConv?._id === conv._id ? 'active' : ''}`}
                  onClick={() => selectConversation(conv)}
                >
                  <div className="conv-name">
                    <span>{conv.userName || 'User'}</span>
                    <span className="conv-time">{conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ''}</span>
                  </div>
                  <div className="conv-email">
                    {conv.userEmail}
                    {conv.userPlan && <span className="plan-badge">{conv.userPlan}</span>}
                  </div>
                  <div className="conv-preview">{conv.lastMessage || 'No messages yet'}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`chat-area ${mobileView === 'list' ? 'hidden' : ''}`}>
          {selectedConv ? (
            <>
              <div className="chat-header">
                <button className="back-btn" onClick={goBack}>←</button>
                <div className="chat-user">
                  <div className="chat-user-name">{selectedConv.userName || 'User'}</div>
                  <div className="chat-user-plan">{selectedConv.userEmail} • {selectedConv.userPlan || 'No Plan'}</div>
                </div>
              </div>
              <div className="messages-container">
                {messages.map((msg, i) => (
                  <div key={i} className={`message ${msg.sender}`}>
                    {msg.message}
                    <div className="message-time">{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form className="message-input-area" onSubmit={sendMessage}>
                <textarea
                  className="message-input"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e as any);
                    }
                  }}
                />
                <button type="submit" className="send-btn" disabled={!newMessage.trim() || sending}>
                  {sending ? '...' : 'Send'}
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