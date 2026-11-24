import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/api";
import NotificationDrawer from "../NotificationDrawer";

export default function AppShell({ children, activeTab, onTabChange, pageTitle, subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = (user.role || "CREATOR").toUpperCase();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 45000); // 45s poll
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const data = await api.notifications.list("?unreadOnly=true");
      setUnreadCount(data?.unreadCount || 0);
    } catch {
      // safe fallback
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    navigate("/login");
  };

  // Role-specific navigation items
  const creatorNavItems = [
    { id: "overview", label: "Studio Overview", icon: "📊" },
    { id: "accounts", label: "Accounts & Sync", icon: "🔗" },
    { id: "analytics", label: "Verified Analytics", icon: "📈" },
    { id: "content", label: "Content Library", icon: "🎬" },
    { id: "opportunities", label: "Opportunity Finder", icon: "🎯" },
    { id: "mediakit", label: "Media Kit", icon: "📄" },
    { id: "collaborations", label: "Collaborations", icon: "🤝" }
  ];

  const brandNavItems = [
    { id: "campaigns", label: "Campaign Studio", icon: "📢" },
    { id: "discovery", label: "Creator Discovery", icon: "🔍" },
    { id: "applications", label: "Applications", icon: "📥" },
    { id: "collaborations", label: "Collaborations", icon: "🤝" }
  ];

  const adminNavItems = [
    { id: "health", label: "System Health", icon: "🛡️" },
    { id: "users", label: "User Management", icon: "👥" },
    { id: "audit", label: "Audit Logs", icon: "📜" }
  ];

  const navItems =
    userRole === "BRAND"
      ? brandNavItems
      : userRole === "ADMIN"
      ? adminNavItems
      : creatorNavItems;

  return (
    <div style={shellStyle}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {/* Brand Header */}
        <div style={brandHeaderStyle}>
          <div style={logoIconStyle}>⚡</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: "800", fontSize: "18px", color: "#f8fafc", letterSpacing: "-0.02em" }}>
                LAZARUS
              </span>
              <span style={v3BadgeStyle}>V3</span>
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "500" }}>
              Creator Studio & Network
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={navContainerStyle}>
          <div style={navSectionLabelStyle}>
            {userRole === "BRAND" ? "BRAND WORKSPACE" : userRole === "ADMIN" ? "ADMIN CONSOLE" : "CREATOR WORKSPACE"}
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange ? onTabChange(item.id) : null}
                style={{
                  ...navButtonStyle,
                  backgroundColor: isActive ? "var(--primary-light)" : "transparent",
                  color: isActive ? "var(--primary)" : "#94a3b8",
                  fontWeight: isActive ? "700" : "500"
                }}
              >
                <span style={{ fontSize: "16px" }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div style={userFooterStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={avatarStyle}>
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name || "Authenticated User"}
              </div>
              <span style={rolePillStyle}>{userRole}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setNotificationsOpen(true)}
              style={iconBtnStyle}
              title="Notifications"
            >
              🔔 {unreadCount > 0 && <span style={unreadBadgeStyle}>{unreadCount}</span>}
            </button>
            <button onClick={handleLogout} style={logoutBtnStyle}>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={mainContentStyle}>
        {/* Top Header */}
        <header style={topHeaderStyle}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
              {pageTitle || "Creator Studio"}
            </h1>
            {subtitle && (
              <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px", margin: 0 }}>
                {subtitle}
              </p>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setNotificationsOpen(true)}
              style={{ ...iconBtnStyle, padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span>🔔</span>
              <span style={{ fontSize: "13px" }}>Notifications</span>
              {unreadCount > 0 && <span style={unreadBadgeStyle}>{unreadCount}</span>}
            </button>

            {userRole === "CREATOR" && (
              <button
                onClick={() => onTabChange && onTabChange("opportunities")}
                style={ctaHeaderBtnStyle}
              >
                🎯 Find Brand Deals
              </button>
            )}

            {userRole === "BRAND" && (
              <button
                onClick={() => onTabChange && onTabChange("campaigns")}
                style={ctaHeaderBtnStyle}
              >
                ➕ New Campaign
              </button>
            )}
          </div>
        </header>

        {/* Page Children Content */}
        <div style={childrenContainerStyle}>
          {children}
        </div>
      </main>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => {
          setNotificationsOpen(false);
          loadUnreadCount();
        }}
      />
    </div>
  );
}

// Styling Constants
const shellStyle = {
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "var(--bg-canvas)",
  color: "var(--text-main)"
};

const sidebarStyle = {
  width: "260px",
  backgroundColor: "var(--bg-surface)",
  borderRight: "1px solid var(--border-subtle)",
  display: "flex",
  flexDirection: "column",
  position: "sticky",
  top: 0,
  height: "100vh",
  flexShrink: 0
};

const brandHeaderStyle = {
  padding: "24px 20px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  borderBottom: "1px solid var(--border-subtle)"
};

const logoIconStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  boxShadow: "0 0 16px rgba(16, 185, 129, 0.4)"
};

const v3BadgeStyle = {
  backgroundColor: "rgba(16, 185, 129, 0.2)",
  color: "#10b981",
  fontSize: "10px",
  fontWeight: "800",
  padding: "2px 6px",
  borderRadius: "4px"
};

const navContainerStyle = {
  flex: 1,
  padding: "20px 12px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  overflowY: "auto"
};

const navSectionLabelStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "var(--text-dim)",
  padding: "8px 12px",
  letterSpacing: "0.08em"
};

const navButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 14px",
  borderRadius: "var(--radius-md)",
  fontSize: "13px",
  textAlign: "left",
  width: "100%",
  transition: "all 0.15s ease"
};

const userFooterStyle = {
  padding: "16px",
  borderTop: "1px solid var(--border-subtle)",
  backgroundColor: "rgba(10, 17, 34, 0.4)"
};

const avatarStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  fontWeight: "700",
  color: "#10b981",
  flexShrink: 0
};

const rolePillStyle = {
  fontSize: "10px",
  fontWeight: "700",
  padding: "2px 6px",
  borderRadius: "4px",
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  color: "#94a3b8"
};

const iconBtnStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  color: "#f8fafc",
  padding: "8px 12px",
  position: "relative"
};

const unreadBadgeStyle = {
  backgroundColor: "#ef4444",
  color: "#ffffff",
  fontSize: "10px",
  fontWeight: "700",
  borderRadius: "50%",
  padding: "1px 5px",
  marginLeft: "4px"
};

const logoutBtnStyle = {
  flex: 1,
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "600",
  padding: "8px"
};

const mainContentStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minWidth: 0
};

const topHeaderStyle = {
  height: "72px",
  padding: "0 32px",
  borderBottom: "1px solid var(--border-subtle)",
  backgroundColor: "rgba(15, 23, 42, 0.6)",
  backdropFilter: "blur(12px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  position: "sticky",
  top: 0,
  zIndex: 100
};

const ctaHeaderBtnStyle = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "13px",
  padding: "8px 16px",
  borderRadius: "var(--radius-md)",
  boxShadow: "0 2px 10px rgba(16, 185, 129, 0.3)"
};

const childrenContainerStyle = {
  flex: 1,
  padding: "32px",
  overflowY: "auto"
};
