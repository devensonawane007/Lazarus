import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import ExpenseList from "../components/ExpenseList";
import PayoutTable from "../components/PayoutTable";

export default function ProjectPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [project, setProject] = useState(location.state || null);
  const [loading, setLoading] = useState(!project);
  const [amount, setAmount] = useState("");
  const [revenue, setRevenue] = useState("");
  const [payouts, setPayouts] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Deliverable submission state (for creator)
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionNote, setSubmissionNote] = useState("");
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);

  useEffect(() => {
    if (project?.id) {
      loadProjectDetails(project.id);
    }
  }, []);

  const loadProjectDetails = async (id) => {
    try {
      const data = await api.projects.getById(id);
      setProject(data);
    } catch (err) {
      console.error("Failed to load project details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!project && !loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <h2>No project data found</h2>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Go Back
        </button>
      </div>
    );
  }

  const fundingTarget = project?.funding_target || project?.fundingTarget || 0;
  const amountRaised = project?.amount_raised || project?.amountRaised || 0;
  const isCreator = user.role?.toLowerCase() === "creator";
  const isInvestor = user.role?.toLowerCase() === "investor";

  const handleContribute = async () => {
    if (!amount || Number(amount) <= 0) return alert("Enter a valid investment amount");
    setActionLoading(true);

    try {
      const res = await api.investments.contribute(project.id, amount);
      alert(`Investment of ₹${amount} successfully pledged to Escrow!`);
      setAmount("");
      loadProjectDetails(project.id);
    } catch (err) {
      alert(err.message || "Failed to contribute to project");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateRevenue = async () => {
    if (!revenue || Number(revenue) <= 0) return alert("Enter projected revenue amount");
    setActionLoading(true);

    try {
      const res = await api.investments.simulateRevenue(project.id, revenue);
      setPayouts(res.payouts || []);
    } catch (err) {
      alert(err.message || "Failed to simulate revenue payouts");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (!submissionUrl) return alert("Please provide a deliverable link or asset URL");
    setActionLoading(true);

    try {
      await api.escrow.submitMilestone(selectedMilestoneId, {
        assetUrl: submissionUrl,
        notes: submissionNote
      });
      alert("Deliverable submitted for investor verification! Escrow state: SUBMITTED 🚀");
      setShowSubmissionModal(false);
      setSubmissionUrl("");
      setSubmissionNote("");
      loadProjectDetails(project.id);
    } catch (err) {
      alert(err.message || "Failed to submit deliverable");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveMilestone = async (milestoneId) => {
    if (!confirm("Are you sure you want to approve this deliverable and release escrow payout to the creator?")) return;
    setActionLoading(true);

    try {
      await api.escrow.approveMilestone(milestoneId, { feedback: "Approved by investor" });
      alert("Milestone approved! Escrow funds released to creator 🎉");
      loadProjectDetails(project.id);
    } catch (err) {
      alert(err.message || "Approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectMilestone = async (milestoneId) => {
    const reason = prompt("Enter reason for requesting revisions:");
    if (!reason) return;
    setActionLoading(true);

    try {
      await api.escrow.rejectMilestone(milestoneId, { reason });
      alert("Changes requested. Milestone remains held in escrow.");
      loadProjectDetails(project.id);
    } catch (err) {
      alert(err.message || "Rejection failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            ← Back
          </button>
          <span style={styles.roleBadge}>
            Logged in as <strong>{user.name}</strong> ({user.role?.toUpperCase()})
          </span>
        </div>

        {/* Project Header Card */}
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <h1 style={styles.projectTitle}>{project.title}</h1>
            <span style={styles.statusPill}>{project.status || "FUNDING"}</span>
          </div>

          <p style={styles.projectDesc}>{project.description}</p>

          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>🎯 Escrow Funding Target</span>
              <span style={styles.statValue}>₹{fundingTarget.toLocaleString()}</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>💰 Total Raised in Hold</span>
              <span style={{ ...styles.statValue, color: "#059669" }}>₹{amountRaised.toLocaleString()}</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>🎬 Video Format</span>
              <span style={styles.statValue}>{project.video_type || project.videoType || "General Video"}</span>
            </div>
          </div>

          {/* Permitted Expenses */}
          <ExpenseList expenses={project.allowed_expenses || []} />
        </div>

        {/* Milestones & Escrow Execution */}
        <div style={styles.card}>
          <h3 style={styles.cardHeading}>⏳ Escrow Milestones & Deliverables</h3>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "2px" }}>
            Funds are locked in escrow and released sequentially upon milestone completion and investor review.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            {(project.milestones || []).map((m, idx) => (
              <div key={m.id || idx} style={styles.milestoneItem}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#111827" }}>
                      Milestone {m.sequenceOrder || idx + 1}: {m.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: "13px", color: "#4b5563" }}>
                      {m.description || "Video deliverable production and approval."}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={styles.milestoneAmount}>₹{(m.targetAmount || fundingTarget).toLocaleString()}</span>
                    <div>
                      <span style={{
                        ...styles.milestoneStatus,
                        backgroundColor: m.status === "RELEASED" ? "#d1fae5" : m.status === "SUBMITTED" ? "#fef3c7" : "#ecfdf5",
                        color: m.status === "RELEASED" ? "#065f46" : m.status === "SUBMITTED" ? "#92400e" : "#059669"
                      }}>
                        {m.status || "HELD"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submissions in this milestone */}
                {m.submissions && m.submissions.length > 0 && (
                  <div style={styles.submissionBox}>
                    <strong>Latest Submission: </strong>
                    <a href={m.submissions[0].assetUrl} target="_blank" rel="noreferrer" style={{ color: "#0071e3" }}>
                      🔗 {m.submissions[0].assetUrl}
                    </a>
                    {m.submissions[0].notes && (
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
                        Note: {m.submissions[0].notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Action buttons depending on role */}
                <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
                  {isCreator && (m.status === "PENDING" || m.status === "HELD") && (
                    <button
                      onClick={() => { setSelectedMilestoneId(m.id); setShowSubmissionModal(true); }}
                      style={styles.creatorActionBtn}
                    >
                      📤 Submit Deliverable Demo
                    </button>
                  )}

                  {isInvestor && m.status === "SUBMITTED" && (
                    <>
                      <button
                        onClick={() => handleApproveMilestone(m.id)}
                        disabled={actionLoading}
                        style={styles.approveBtn}
                      >
                        ✓ Approve & Release Payout
                      </button>
                      <button
                        onClick={() => handleRejectMilestone(m.id)}
                        disabled={actionLoading}
                        style={styles.rejectBtn}
                      >
                        ✕ Request Revisions
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investor Contribution Section (for Investors) */}
        {isInvestor && (
          <div style={styles.card}>
            <h3 style={styles.cardHeading}>💸 Pledge Escrow Funding</h3>
            <p style={{ color: "#6b7280", fontSize: "13px", margin: "4px 0 14px 0" }}>
              Funds are safely held in the smart escrow contract until you approve deliverable milestones.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="number"
                placeholder="Enter pledge amount ₹ (e.g. 10000)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={styles.input}
              />
              <button
                onClick={handleContribute}
                disabled={actionLoading}
                style={styles.primaryBtn}
              >
                {actionLoading ? "Pledging..." : "Fund in Escrow"}
              </button>
            </div>
          </div>
        )}

        {/* Revenue Simulation Section */}
        <div style={styles.card}>
          <h3 style={styles.cardHeading}>📈 Smart-Contract Revenue Simulator</h3>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: "4px 0 14px 0" }}>
            Model projected creator video revenue distributions across contributors.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="number"
              placeholder="Simulated total gross revenue ₹ (e.g. 100000)"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              style={styles.input}
            />
            <button
              onClick={handleSimulateRevenue}
              disabled={actionLoading}
              style={styles.secondaryBtn}
            >
              Simulate Returns
            </button>
          </div>

          <PayoutTable payouts={payouts} />
        </div>
      </div>

      {/* Deliverable Submission Modal */}
      {showSubmissionModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={{ margin: "0 0 12px 0", color: "#111827" }}>📤 Submit Milestone Deliverable</h3>
            <form onSubmit={handleSubmitDeliverable}>
              <div style={{ marginBottom: "16px" }}>
                <label style={styles.label}>Asset / Video Demo URL *</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=... or Google Drive link"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={styles.label}>Deliverable Notes</label>
                <textarea
                  placeholder="Notes for investors regarding completed deliverables, edits, and timestamps..."
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  style={{ ...styles.input, height: "70px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowSubmissionModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={styles.primaryBtn}
                >
                  {actionLoading ? "Submitting..." : "Submit for Verification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    background: "#f9fafb",
    minHeight: "100vh",
    padding: "36px 20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  container: {
    maxWidth: "880px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#059669",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer"
  },
  roleBadge: {
    fontSize: "13px",
    color: "#6b7280",
    backgroundColor: "#ffffff",
    padding: "4px 12px",
    borderRadius: "20px",
    border: "1px solid #e5e7eb"
  },
  card: {
    background: "#ffffff",
    padding: "28px",
    borderRadius: "18px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 16px rgba(0,0,0,0.04)"
  },
  projectTitle: {
    margin: 0,
    fontSize: "26px",
    fontWeight: "700",
    color: "#111827"
  },
  statusPill: {
    backgroundColor: "#ecfdf5",
    color: "#059669",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase"
  },
  projectDesc: {
    color: "#4b5563",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 20px 0"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "14px",
    marginBottom: "10px"
  },
  statBox: {
    backgroundColor: "#f9fafb",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column"
  },
  statLabel: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "4px"
  },
  statValue: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827"
  },
  cardHeading: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827"
  },
  milestoneItem: {
    padding: "18px",
    backgroundColor: "#f9fafb",
    borderRadius: "14px",
    border: "1px solid #e5e7eb"
  },
  milestoneAmount: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827"
  },
  milestoneStatus: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "6px",
    marginTop: "4px"
  },
  submissionBox: {
    marginTop: "10px",
    padding: "10px 14px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "13px"
  },
  creatorActionBtn: {
    padding: "8px 16px",
    backgroundColor: "#059669",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer"
  },
  approveBtn: {
    padding: "8px 16px",
    backgroundColor: "#059669",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer"
  },
  rejectBtn: {
    padding: "8px 16px",
    backgroundColor: "#ffffff",
    color: "#dc2626",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer"
  },
  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px"
  },
  primaryBtn: {
    padding: "12px 20px",
    backgroundColor: "#059669",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer"
  },
  secondaryBtn: {
    padding: "12px 20px",
    backgroundColor: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "28px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
  },
  cancelBtn: {
    padding: "10px 16px",
    backgroundColor: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  }
};
