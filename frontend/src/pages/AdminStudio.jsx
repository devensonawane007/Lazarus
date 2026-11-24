import { useState, useEffect } from "react";
import AppShell from "../components/layout/AppShell";
import { api } from "../services/api";
import {
  ShieldCheck,
  Users,
  ScrollText,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Database,
  Server,
  Key,
  RefreshCw,
  Lock,
  Layers,
  FileSpreadsheet
} from "lucide-react";

export default function AdminStudio() {
  const [activeTab, setActiveTab] = useState("health");
  const [healthData, setHealthData] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [hRes, uRes, aRes] = await Promise.allSettled([
        api.admin.getHealth(),
        api.admin.getUsers(),
        api.admin.getAuditLogs()
      ]);

      if (hRes.status === "fulfilled") setHealthData(hRes.value);
      if (uRes.status === "fulfilled") setUsers(uRes.value?.users || []);
      if (aRes.status === "fulfilled") setAuditLogs(aRes.value?.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (brandId, currentStatus) => {
    setActionLoading(true);
    try {
      await api.admin.toggleVerification(brandId, !currentStatus);
      alert(`Brand verification set to ${!currentStatus}.`);
      await loadAdminData();
    } catch (err) {
      alert("Failed to toggle verification: " + (err.message || ""));
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportMyData = async () => {
    try {
      const data = await api.admin.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lazarus_gdpr_export_${Date.now()}.json`;
      a.click();
      alert("GDPR data package exported successfully.");
    } catch (err) {
      alert("Export failed: " + (err.message || ""));
    }
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      pageTitle={
        activeTab === "health"
          ? "Platform Operations & Integration Health"
          : activeTab === "users"
          ? "User & Brand Verification Management"
          : "System Security & Audit Trail"
      }
      subtitle="Administrative oversight, sync monitoring, and compliance tools"
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "var(--brand-light)",
            color: "var(--brand-primary)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px"
          }}>
            <ShieldCheck size={24} />
          </div>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "500" }}>Loading administrative console...</p>
        </div>
      ) : (
        <div>
          {/* =========================================================
              TAB 1: HEALTH
          ========================================================== */}
          {activeTab === "health" && (
            <div>
              {/* System Status Indicators */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Server size={18} style={{ color: "var(--brand-primary)" }} /> Infrastructure Status
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "16px" }}>
                  <div style={statusItemStyle}>
                    <span style={statLabelStyle}>API STATUS</span>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--brand-primary)", marginTop: "4px" }}>Healthy (Express 5)</div>
                  </div>
                  <div style={statusItemStyle}>
                    <span style={statLabelStyle}>HOSTED DATABASE</span>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--brand-primary)", marginTop: "4px" }}>Neon PostgreSQL 18.7</div>
                  </div>
                  <div style={statusItemStyle}>
                    <span style={statLabelStyle}>TOKEN ENCRYPTION</span>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--brand-primary)", marginTop: "4px" }}>Active (AES-256-GCM)</div>
                  </div>
                  <div style={statusItemStyle}>
                    <span style={statLabelStyle}>FAILED SYNCS</span>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: healthData?.stats?.failedSyncs > 0 ? "var(--color-red)" : "var(--brand-primary)", marginTop: "4px" }}>
                      {healthData?.stats?.failedSyncs || 0} Accounts
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Counts */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginTop: "20px" }}>
                <div style={statCardStyle}>
                  <span style={statLabelStyle}>TOTAL USERS</span>
                  <div style={statNumberStyle}>{healthData?.stats?.totalUsers || 0}</div>
                </div>
                <div style={statCardStyle}>
                  <span style={statLabelStyle}>CREATORS</span>
                  <div style={statNumberStyle}>{healthData?.stats?.creators || 0}</div>
                </div>
                <div style={statCardStyle}>
                  <span style={statLabelStyle}>BRANDS</span>
                  <div style={statNumberStyle}>{healthData?.stats?.brands || 0}</div>
                </div>
                <div style={statCardStyle}>
                  <span style={statLabelStyle}>CAMPAIGNS</span>
                  <div style={statNumberStyle}>{healthData?.stats?.activeCampaigns || 0}</div>
                </div>
                <div style={statCardStyle}>
                  <span style={statLabelStyle}>COLLABORATIONS</span>
                  <div style={statNumberStyle}>{healthData?.stats?.collaborations || 0}</div>
                </div>
                <div style={statCardStyle}>
                  <span style={statLabelStyle}>SOCIAL CONNECTIONS</span>
                  <div style={statNumberStyle}>{healthData?.stats?.connectedSocialAccounts || 0}</div>
                </div>
              </div>

              {/* Failed Syncs Monitor */}
              <div style={{ ...cardStyle, marginTop: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertTriangle size={18} style={{ color: "var(--color-amber)" }} /> Failed Synchronisation Monitor ({healthData?.recentFailedSyncs?.length || 0})
                </h3>

                {healthData?.recentFailedSyncs && healthData.recentFailedSyncs.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                    {healthData.recentFailedSyncs.map((acc) => (
                      <div key={acc.id} style={failedSyncRowStyle}>
                        <div>
                          <strong>{acc.platform}</strong> — Creator: {acc.creatorProfile?.user?.name} ({acc.creatorProfile?.user?.email})
                          <div style={{ color: "var(--color-red)", fontSize: "12px", marginTop: "4px" }}>
                            Error: {acc.syncError}
                          </div>
                        </div>
                        <span className="badge badge-red">Failed</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", marginTop: "12px" }}>
                    All connected social media accounts are syncing smoothly with 0 active failures.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 2: USERS & BRAND VERIFICATION
          ========================================================== */}
          {activeTab === "users" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                    User Management & Brand Verification
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Authorize genuine brand corporate profiles and inspect registered platform creators.
                  </p>
                </div>
              </div>

              <div style={cardStyle}>
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>User</th>
                        <th style={thStyle}>Role</th>
                        <th style={thStyle}>Company / Details</th>
                        <th style={thStyle}>Verification</th>
                        <th style={thStyle}>Created At</th>
                        <th style={thStyle}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const brand = u.brandProfile;
                        return (
                          <tr key={u.id} style={trStyle}>
                            <td style={tdStyle}>
                              <strong>{u.name}</strong>
                              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{u.email}</div>
                            </td>
                            <td style={tdStyle}>
                              <span className={`badge ${u.role === "BRAND" ? "badge-blue" : u.role === "ADMIN" ? "badge-purple" : "badge-green"}`}>
                                {u.role}
                              </span>
                            </td>
                            <td style={tdStyle}>
                              {brand?.companyName || u.creatorProfile?.bio || "—"}
                            </td>
                            <td style={tdStyle}>
                              {brand ? (
                                brand.isVerified ? (
                                  <span className="badge badge-green">Verified Brand</span>
                                ) : (
                                  <span className="badge badge-gray">Unverified</span>
                                )
                              ) : u.creatorProfile ? (
                                <span className="badge badge-green">Creator</span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td style={tdStyle}>
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td style={tdStyle}>
                              {brand && (
                                <button
                                  onClick={() => handleToggleVerification(brand.id, brand.isVerified)}
                                  disabled={actionLoading}
                                  style={brand.isVerified ? revokeVerifyBtnStyle : grantVerifyBtnStyle}
                                >
                                  {brand.isVerified ? "Revoke Verification" : "Grant Verified Badge"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 3: AUDIT TRAIL & GDPR
          ========================================================== */}
          {activeTab === "audit" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                    Security & Platform Audit Logs
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Immutable action trail of state changes, account links, deliverable reviews, and security events.
                  </p>
                </div>

                <button onClick={handleExportMyData} style={btnSecondaryStyle}>
                  <Download size={14} /> Export Account Data Package (GDPR)
                </button>
              </div>

              <div style={cardStyle}>
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Timestamp</th>
                        <th style={thStyle}>User</th>
                        <th style={thStyle}>Action</th>
                        <th style={thStyle}>Entity</th>
                        <th style={thStyle}>Metadata</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} style={trStyle}>
                          <td style={{ ...tdStyle, whiteSpace: "nowrap", fontSize: "12px", color: "var(--text-muted)" }}>
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td style={tdStyle}>
                            {log.user ? log.user.name : "System"}
                          </td>
                          <td style={tdStyle}>
                            <span style={codeBadgeStyle}>{log.action}</span>
                          </td>
                          <td style={tdStyle}>
                            {log.entityType ? `${log.entityType} (${log.entityId?.slice(0, 8)}...)` : "—"}
                          </td>
                          <td style={{ ...tdStyle, fontSize: "12px", color: "var(--text-muted)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {JSON.stringify(log.metadata || {})}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

// Styles
const cardStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "24px",
  boxShadow: "var(--shadow-sm)"
};

const statusItemStyle = {
  padding: "14px",
  backgroundColor: "var(--bg-surface-raised)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-subtle)"
};

const statLabelStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "var(--text-muted)",
  letterSpacing: "0.06em"
};

const statCardStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "16px",
  boxShadow: "var(--shadow-sm)"
};

const statNumberStyle = {
  fontSize: "22px",
  fontWeight: "800",
  color: "var(--text-primary)",
  marginTop: "4px"
};

const failedSyncRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 16px",
  backgroundColor: "var(--color-red-light)",
  border: "1px solid rgba(239, 68, 68, 0.25)",
  borderRadius: "var(--radius-md)"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px"
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  color: "var(--text-muted)",
  borderBottom: "1px solid var(--border-subtle)",
  fontSize: "11px",
  fontWeight: "700"
};

const trStyle = {
  borderBottom: "1px solid var(--border-subtle)"
};

const tdStyle = {
  padding: "12px",
  color: "var(--text-primary)"
};

const grantVerifyBtnStyle = {
  backgroundColor: "var(--brand-light)",
  border: "1px solid rgba(16, 185, 129, 0.3)",
  color: "var(--brand-primary)",
  fontSize: "12px",
  fontWeight: "600",
  padding: "4px 10px",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer"
};

const revokeVerifyBtnStyle = {
  backgroundColor: "var(--color-red-light)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  color: "var(--color-red)",
  fontSize: "12px",
  fontWeight: "600",
  padding: "4px 10px",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer"
};

const btnSecondaryStyle = {
  backgroundColor: "var(--bg-surface-raised)",
  border: "1px solid var(--border-subtle)",
  color: "var(--text-primary)",
  fontSize: "13px",
  fontWeight: "600",
  padding: "10px 18px",
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px"
};

const codeBadgeStyle = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  backgroundColor: "var(--bg-surface-raised)",
  border: "1px solid var(--border-subtle)",
  padding: "2px 6px",
  borderRadius: "4px",
  color: "var(--text-primary)"
};
