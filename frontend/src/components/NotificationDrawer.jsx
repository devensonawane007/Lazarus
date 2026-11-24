import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Bell, X, CheckCheck, Inbox } from "lucide-react";

export default function NotificationDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.notifications.list();
      setNotifications(data?.notifications || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={drawerStyle} onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--brand-light)",
              color: "var(--brand-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Bell size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                Notifications
              </h3>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  fontSize: "12px",
                  color: "var(--brand-primary)",
                  fontWeight: "600",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                padding: "6px",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              title="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {loading && (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>
              Loading updates...
            </p>
          )}

          {!loading && notifications.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <Inbox size={40} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
              <p style={{ margin: 0, fontWeight: "500" }}>No notifications yet</p>
              <span style={{ fontSize: "12px" }}>You're all caught up!</span>
            </div>
          )}

          {!loading &&
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  ...notificationItemStyle,
                  borderLeft: n.isRead ? "3px solid transparent" : "3px solid var(--brand-primary)",
                  backgroundColor: n.isRead ? "var(--bg-surface)" : "var(--brand-light)"
                }}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "13px", color: "var(--text-primary)" }}>
                    {n.title}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.45 }}>
                  {n.message}
                </p>
                {n.linkUrl && (
                  <a
                    href={n.linkUrl}
                    style={{
                      fontSize: "12px",
                      color: "var(--brand-primary)",
                      display: "inline-block",
                      marginTop: "8px",
                      fontWeight: "600",
                      textDecoration: "none"
                    }}
                  >
                    View Details →
                  </a>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "var(--bg-overlay)",
  backdropFilter: "blur(4px)",
  zIndex: 1100,
  display: "flex",
  justifyContent: "flex-end"
};

const drawerStyle = {
  width: "100%",
  maxWidth: "420px",
  height: "100%",
  backgroundColor: "var(--bg-surface)",
  borderLeft: "1px solid var(--border-subtle)",
  display: "flex",
  flexDirection: "column",
  boxShadow: "var(--shadow-xl)"
};

const headerStyle = {
  padding: "18px 20px",
  borderBottom: "1px solid var(--border-subtle)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const contentStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const notificationItemStyle = {
  padding: "12px 14px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-subtle)",
  cursor: "pointer",
  transition: "all 0.15s ease"
};
