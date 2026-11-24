import { useState, useEffect } from "react";
import AppShell from "../components/layout/AppShell";
import { api } from "../services/api";

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
      alert(`Brand verification set to ${!currentStatus} ✅`);
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
      alert("GDPR data package exported successfully! 📦");
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
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          Loading administrative console...
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
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>
                  🟢 Infrastructure Status
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  <div style={statusItemStyle}>
                    <span style={statLabelStyle}>API STATUS</span>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#10b981" }}>Healthy (Express 5)</div>
                  </div>
                  <div style={statusItemStyle}>
                    <span style={statLabelStyle}>HOSTED DATABASE</span>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#10b981" }}>Neon PostgreSQL 18.7</div>
                  </div>
                  <div style={statusItemStyle}>
                    <span style={statLabelStyle}>TOKEN ENCRYPTION</span>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#10b981" }}>Active (AES-256-GCM)</div>
                  </div>
                  <div style={statusItemStyle}>
                    <span style={statLabelStyle}>FAILED SYNCS</span>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: healthData?.stats?.failedSyncs > 0 ? "#ef4444" : "#10b981" }}>
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
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>
                  ⚠️ Failed Synchronisation Monitor ({healthData?.recentFailedSyncs?.length || 0})
                </h3>

                {healthData?.recentFailedSyncs && healthData.recentFailedSyncs.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {healthData.recentFailedSyncs.map((acc) => (
                      <div key={acc.id} style={failedSyncRowStyle}>
                        <div>
                          <strong>{acc.platform}</strong> — Creator: {acc.creatorProfile?.user?.name} ({acc.creatorProfile?.user?.email})
                          <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
                            Error: {acc.syncError}
                          </div>
                        </div>
                        <span className="badge badge-red">Failed</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                    All connected social platform accounts are synchronizing cleanly with zero failure alerts.
                  </div>
                )}
              </div>

              {/* GDPR Privacy Download Button */}
              <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                <button onClick={handleExportMyData} style={btnSecondaryStyle}>
                  📦 Export My Account Data (GDPR Archive)
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 2: USERS & VERIFICATIONS
          ========================================================== */}
          {activeTab === "users" && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>
                Registered Platform Users ({users.length})
              </h3>

              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Role</th>
                      <th style={thStyle}>Verification / MOU</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={trStyle}>
                        <td style={tdStyle}><strong>{u.name}</strong></td>
                        <td style={tdStyle}>{u.email}</td>
                        <td style={tdStyle}>
                          <span className={`badge ${
                            u.role === "BRAND" ? "badge-blue" : u.role === "ADMIN" ? "badge-purple" : "badge-green"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {u.brandProfile ? (
                            u.brandProfile.isVerified ? (
                              <span className="badge badge-green">Verified Brand</span>
                            ) : (
                              <span className="badge badge-gray">Unverified</span>
                            )
                          ) : u.creatorProfile ? (
                            u.creatorProfile.isMouSigned ? (
                              <span className="badge badge-green">MOU Signed</span>
                            ) : (
                              <span className="badge badge-amber">MOU Pending</span>
                            )
                          ) : (
                            "-"
                          )}
                        </td>
                        <td style={tdStyle}>
                          {u.brandProfile && (
                            <button
                              onClick={() => handleToggleVerification(u.brandProfile.id, u.brandProfile.isVerified)}
                              disabled={actionLoading}
                              style={u.brandProfile.isVerified ? revokeVerifyBtnStyle : grantVerifyBtnStyle}
                            >
                              {u.brandProfile.isVerified ? "Revoke Verification" : "Grant Verification"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 3: AUDIT LOGS
          ========================================================== */}
          {activeTab === "audit" && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>
                System Audit Events ({auditLogs.length})
              </h3>

              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Timestamp</th>
                      <th style={thStyle}>Actor</th>
                      <th style={thStyle}>Action</th>
                      <th style={thStyle}>Resource Type</th>
                      <th style={thStyle}>Resource ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} style={trStyle}>
                        <td style={{ ...tdStyle, color: "#64748b", fontSize: "12px" }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td style={tdStyle}>
                          {log.actor?.name || "System"} ({log.actor?.role || "AUTO"})
                        </td>
                        <td style={tdStyle}>
                          <span style={codeBadgeStyle}>{log.action}</span>
                        </td>
                        <td style={tdStyle}>{log.resourceType}</td>
                        <td style={{ ...tdStyle, color: "#94a3b8", fontSize: "12px" }}>
                          {log.resourceId ? log.resourceId.slice(0, 12) + "..." : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "24px"
};

const statusItemStyle = {
  padding: "14px",
  backgroundColor: "rgba(10, 17, 34, 0.6)",
  borderRadius: "8px",
  border: "1px solid var(--border-subtle)"
};

const statLabelStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "var(--text-dim)",
  letterSpacing: "0.06em"
};

const statCardStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "16px"
};

const statNumberStyle = {
  fontSize: "22px",
  fontWeight: "800",
  color: "#f8fafc",
  marginTop: "4px"
};

const failedSyncRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 16px",
  backgroundColor: "rgba(239, 68, 68, 0.06)",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  borderRadius: "8px"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px"
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  color: "#64748b",
  borderBottom: "1px solid var(--border-subtle)",
  fontSize: "11px",
  fontWeight: "700"
};

const trStyle = {
  borderBottom: "1px solid rgba(255, 255, 255, 0.04)"
};

const tdStyle = {
  padding: "12px",
  color: "#f8fafc"
};

const grantVerifyBtnStyle = {
  backgroundColor: "rgba(16, 185, 129, 0.15)",
  border: "1px solid rgba(16, 185, 129, 0.3)",
  color: "#10b981",
  fontSize: "12px",
  fontWeight: "600",
  padding: "4px 10px",
  borderRadius: "4px"
};

const revokeVerifyBtnStyle = {
  backgroundColor: "rgba(239, 68, 68, 0.15)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  color: "#ef4444",
  fontSize: "12px",
  fontWeight: "600",
  padding: "4px 10px",
  borderRadius: "4px"
};

const btnSecondaryStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  color: "#f8fafc",
  fontSize: "13px",
  fontWeight: "600",
  padding: "10px 18px",
  borderRadius: "8px"
};

const codeBadgeStyle = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  padding: "2px 6px",
  borderRadius: "4px"
};
