"use client";

import { useEffect, useState } from "react";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 10 seconds for near real-time updates
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const markAsRead = async (notificationId?: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          notificationId,
          markAllRead: !notificationId
        })
      });
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email_opened':
        return '📩';
      case 'email_clicked':
        return '🔗';
      case 'email_sent':
        return '✅';
      default:
        return '🔔';
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
      <div style={{ position: 'relative' }}>
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) markAsRead();
        }}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
          borderRadius: 8,
          color: 'var(--text)',
          fontSize: 20
        }}
      >
        {unreadCount > 0 ? '🔔' : '🔔'}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'linear-gradient(135deg, #f87171, #ef4444)',
              color: 'white',
              fontSize: 10,
              fontWeight: 700,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 2px 4px rgba(248, 113, 113, 0.4)',
              animation: 'pulse 2s infinite'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: 400,
            maxHeight: 450,
            overflow: 'auto',
            background: 'var(--bg1)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            marginTop: 8,
            zIndex: 1000,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div
            style={{
              padding: 16,
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg2)'
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead()}
                style={{
                  fontSize: 12,
                  color: '#6366f1',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
              <div>No notifications yet</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>You'll be notified when someone opens or clicks your emails</div>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => markAsRead(notif._id)}
                style={{
                  padding: 14,
                  borderBottom: '1px solid var(--line)',
                  background: notif.read ? 'transparent' : 'var(--bg2)',
                  cursor: 'pointer',
                  opacity: notif.read ? 0.6 : 1,
                  transition: 'background 0.2s',
                  borderLeft: notif.read ? 'none' : '3px solid #6366f1'
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
                  <div style={{ fontSize: 20 }}>{getNotificationIcon(notif.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)', marginBottom: 4 }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 8 }}>
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
    </>
  );
}
