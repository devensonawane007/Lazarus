import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/api";
import NotificationDrawer from "../NotificationDrawer";
import ThemeToggle from "../ui/ThemeToggle";
import {
  LayoutDashboard,
  Link2,
  TrendingUp,
  Film,
  Target,
  FileText,
  Handshake,
  Megaphone,
  Search,
  Inbox,
  ShieldCheck,
  Users,
  ScrollText,
  Bell,
  LogOut,
  Zap,
  Plus,
  Sparkles,
  Menu,
  X
} from "lucide-react";

export default function AppShell({ children, activeTab, onTabChange, pageTitle, subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = (user.role || "CREATOR").toUpperCase();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Role-specific navigation items with Lucide icons
  const creatorNavItems = [
    { id: "overview", label: "Studio Overview", icon: LayoutDashboard },
    { id: "accounts", label: "Accounts & Sync", icon: Link2 },
    { id: "analytics", label: "Verified Analytics", icon: TrendingUp },
    { id: "content", label: "Content Library", icon: Film },
    { id: "opportunities", label: "Opportunity Finder", icon: Target },
    { id: "mediakit", label: "Media Kit", icon: FileText },
    { id: "collaborations", label: "Collaborations", icon: Handshake }
  ];

  const brandNavItems = [
    { id: "campaigns", label: "Campaign Studio", icon: Megaphone },
    { id: "discovery", label: "Creator Discovery", icon: Search },
    { id: "applications", label: "Applications", icon: Inbox },
    { id: "collaborations", label: "Collaborations", icon: Handshake }
  ];

  const adminNavItems = [
    { id: "health", label: "System Health", icon: ShieldCheck },
    { id: "users", label: "User Management", icon: Users },
    { id: "audit", label: "Audit Logs", icon: ScrollText }
  ];

  const navItems =
    userRole === "BRAND"
      ? brandNavItems
      : userRole === "ADMIN"
      ? adminNavItems
      : creatorNavItems;

  const handleNavClick = (id) => {
    if (onTabChange) {
      onTabChange(id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div style={shellStyle}>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          style={mobileBackdropStyle}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={sidebarStyle}
        className={`sidebar-responsive ${mobileMenuOpen ? "sidebar-open" : ""}`}
      >
        {/* Brand Header */}
        <div style={brandHeaderStyle}>
          <div style={logoIconStyle}>
            <Zap size={20} color="#ffffff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={brandTitleStyle}>LAZARUS</span>
              <span style={v3BadgeStyle}>V3</span>
            </div>
            <div style={brandSubtitleStyle}>Creator Studio & Network</div>
          </div>
          {mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={closeMobileBtnStyle}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={navContainerStyle}>
          <div style={navSectionLabelStyle}>
            {userRole === "BRAND"
              ? "BRAND WORKSPACE"
              : userRole === "ADMIN"
              ? "ADMIN CONSOLE"
              : "CREATOR WORKSPACE"}
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  ...navButtonStyle,
                  backgroundColor: isActive
                    ? "var(--brand-light)"
                    : "transparent",
                  color: isActive ? "var(--brand-primary)" : "var(--text-secondary)",
                  fontWeight: isActive ? "700" : "500",
                  borderLeft: isActive
                    ? "3px solid var(--brand-primary)"
                    : "3px solid transparent"
                }}
              >
                <Icon
                  size={18}
                  style={{
                    color: isActive ? "var(--brand-primary)" : "var(--text-muted)",
                    flexShrink: 0
                  }}
                />
                <span style={{ fontSize: "13.5px" }}>{item.label}</span>
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
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={userNameStyle}>
                {user.name || "Authenticated User"}
              </div>
              <span style={rolePillStyle}>{userRole}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              style={logoutBtnStyle}
              title="Sign Out"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={mainContentStyle} className="app-main-responsive">
        {/* Top Header */}
        <header style={topHeaderStyle} className="app-top-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={mobileToggleBtnStyle}
              className="mobile-toggle-btn"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 style={headerTitleStyle}>
                {pageTitle || "Creator Studio"}
              </h1>
              {subtitle && (
                <p style={headerSubtitleStyle}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ThemeToggle />

            <button
              onClick={() => setNotificationsOpen(true)}
              style={headerNotificationBtnStyle}
              title="Notifications"
            >
              <Bell size={16} />
              <span className="hide-on-mobile" style={{ fontSize: "13px" }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={unreadBadgeStyle}>{unreadCount}</span>
              )}
            </button>

            {userRole === "CREATOR" && (
              <button
                onClick={() => onTabChange && onTabChange("opportunities")}
                style={ctaHeaderBtnStyle}
              >
                <Sparkles size={16} />
                <span>Find Brand Deals</span>
              </button>
            )}

            {userRole === "BRAND" && (
              <button
                onClick={() => onTabChange && onTabChange("campaigns")}
                style={ctaHeaderBtnStyle}
              >
                <Plus size={16} />
                <span>New Campaign</span>
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

// Styling Constants using Semantic Tokens
const shellStyle = {
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "var(--bg-canvas)",
  color: "var(--text-primary)",
  position: "relative"
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
  flexShrink: 0,
  transition: "transform 0.25s ease"
};

const mobileBackdropStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "var(--bg-overlay)",
  backdropFilter: "blur(4px)",
  zIndex: 1150
};

const mobileToggleBtnStyle = {
  background: "none",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-sm)",
  color: "var(--text-primary)",
  padding: "6px",
  display: "none", // Displayed via CSS media query if needed
  cursor: "pointer"
};

const closeMobileBtnStyle = {
  background: "none",
  border: "none",
  color: "var(--text-secondary)",
  cursor: "pointer",
  padding: "4px"
};

const brandHeaderStyle = {
  padding: "20px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  borderBottom: "1px solid var(--border-subtle)"
};

const logoIconStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "var(--radius-md)",
  background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 8px var(--brand-glow)",
  flexShrink: 0
};

const brandTitleStyle = {
  fontWeight: "800",
  fontSize: "17px",
  color: "var(--text-primary)",
  letterSpacing: "-0.02em"
};

const brandSubtitleStyle = {
  fontSize: "11px",
  color: "var(--text-muted)",
  fontWeight: "500"
};

const v3BadgeStyle = {
  backgroundColor: "var(--brand-light)",
  color: "var(--brand-primary)",
  fontSize: "10px",
  fontWeight: "800",
  padding: "2px 6px",
  borderRadius: "4px"
};

const navContainerStyle = {
  flex: 1,
  padding: "16px 10px",
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  overflowY: "auto"
};

const navSectionLabelStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "var(--text-muted)",
  padding: "8px 10px 4px",
  letterSpacing: "0.08em"
};

const navButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "9px 12px",
  borderRadius: "var(--radius-md)",
  fontSize: "13px",
  textAlign: "left",
  width: "100%",
  border: "none",
  cursor: "pointer",
  transition: "all 0.15s ease"
};

const userFooterStyle = {
  padding: "16px",
  borderTop: "1px solid var(--border-subtle)",
  backgroundColor: "var(--bg-surface-raised)"
};

const avatarStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  backgroundColor: "var(--brand-light)",
  border: "1px solid var(--border-subtle)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  fontWeight: "700",
  color: "var(--brand-primary)",
  flexShrink: 0
};

const userNameStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "var(--text-primary)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const rolePillStyle = {
  fontSize: "10px",
  fontWeight: "700",
  padding: "2px 6px",
  borderRadius: "4px",
  backgroundColor: "var(--border-subtle)",
  color: "var(--text-secondary)",
  display: "inline-block",
  marginTop: "2px"
};

const logoutBtnStyle = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  color: "var(--text-secondary)",
  fontSize: "12px",
  fontWeight: "600",
  padding: "8px",
  cursor: "pointer",
  transition: "all 0.15s ease"
};

const mainContentStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  minHeight: "100vh"
};

const topHeaderStyle = {
  height: "70px",
  padding: "0 28px",
  borderBottom: "1px solid var(--border-subtle)",
  backgroundColor: "var(--bg-surface)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  position: "sticky",
  top: 0,
  zIndex: 100
};

const headerTitleStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "var(--text-primary)",
  margin: 0,
  letterSpacing: "-0.01em"
};

const headerSubtitleStyle = {
  fontSize: "12.5px",
  color: "var(--text-muted)",
  marginTop: "2px",
  margin: 0
};

const headerNotificationBtnStyle = {
  backgroundColor: "var(--bg-surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  color: "var(--text-primary)",
  padding: "8px 12px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  fontWeight: "500",
  position: "relative"
};

const unreadBadgeStyle = {
  backgroundColor: "var(--color-red)",
  color: "#ffffff",
  fontSize: "10px",
  fontWeight: "700",
  borderRadius: "var(--radius-full)",
  padding: "1px 6px",
  marginLeft: "2px"
};

const ctaHeaderBtnStyle = {
  background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "13px",
  padding: "8px 16px",
  borderRadius: "var(--radius-md)",
  boxShadow: "0 2px 10px var(--brand-glow)",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px"
};

const childrenContainerStyle = {
  flex: 1,
  padding: "28px",
  overflowY: "auto"
};
