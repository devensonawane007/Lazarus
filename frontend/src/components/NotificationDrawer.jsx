import { useState, useEffect } from "react";
import { api } from "../services/api";

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

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={drawerStyle} onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={headerStyle}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc" }}>
              🔔 Notifications
            </h3>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              {notifications.filter((n) => !n.isRead).length} unread updates
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleMarkAllRead}
              style={{ fontSize: "12px", color: "#10b981", fontWeight: "600" }}
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              style={{ fontSize: "18px", color: "#94a3b8", padding: "4px 8px" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {loading && <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>Loading...</p>}

          {!loading && notifications.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
              <p>No notifications yet</p>
            </div>
          )}

          {!loading &&
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  ...notificationItemStyle,
                  borderLeft: n.isRead ? "3px solid transparent" : "3px solid #10b981",
                  backgroundColor: n.isRead ? "var(--bg-card)" : "rgba(16, 185, 129, 0.05)"
                }}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#f8fafc" }}>
                    {n.title}
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0, lineHeight: 1.4 }}>
                  {n.message}
                </p>
                {n.linkUrl && (
                  <a
                    href={n.linkUrl}
                    style={{ fontSize: "12px", color: "#10b981", display: "inline-block", marginTop: "8px", fontWeight: "600" }}
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
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  backdropFilter: "blur(4px)",
  zIndex: 1100,
  display: "flex",
  justifyContent: "flex-end"
};

const drawerStyle = {
  width: "100%",
  maxWidth: "420px",
  height: "100%",
  backgroundColor: "#0f172a",
  borderLeft: "1px solid #1e293b",
  display: "flex",
  flexDirection: "column",
  boxShadow: "-10px 0 25px rgba(0,0,0,0.5)"
};

const headerStyle = {
  padding: "20px",
  borderBottom: "1px solid #1e293b",
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
  gap: "12px"
};

const notificationItemStyle = {
  padding: "14px",
  borderRadius: "8px",
  border: "1px solid #1e293b",
  cursor: "pointer",
  transition: "all 0.15s ease"
};
