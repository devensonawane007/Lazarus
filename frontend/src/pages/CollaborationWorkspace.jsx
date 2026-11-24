import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { api } from "../services/api";

const STAGES = [
  "APPLIED",
  "SHORTLISTED",
  "NEGOTIATION",
  "ACCEPTED",
  "IN_PROGRESS",
  "SUBMITTED",
  "REVISION_REQUESTED",
  "APPROVED",
  "COMPLETED"
];

export default function CollaborationWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [collab, setCollab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Deliverable Submission Modal
  const [submittingDeliv, setSubmittingDeliv] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");

  // Review Modal
  const [reviewingDeliv, setReviewingDeliv] = useState(null);
  const [reviewDecision, setReviewDecision] = useState("APPROVED");
  const [reviewFeedback, setReviewFeedback] = useState("");

  useEffect(() => {
    loadCollaboration();
  }, [id]);

  const loadCollaboration = async () => {
    setLoading(true);
    try {
      const data = await api.collaborations.getById(id);
      setCollab(data?.collaboration);
    } catch (err) {
      console.error(err);
      alert("Failed to load collaboration: " + (err.message || ""));
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const isCreator = collab?.creatorProfile?.userId === user.id;
  const isBrand = collab?.brandProfile?.userId === user.id;

  const handleTransition = async (targetStatus, note = "") => {
    setActionLoading(true);
    try {
      await api.collaborations.transition(id, targetStatus, note);
      alert(`Deal progressed to ${targetStatus} ✅`);
      await loadCollaboration();
    } catch (err) {
      alert("Transition failed: " + (err.message || ""));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitDeliverable = async () => {
    if (!submissionUrl) {
      alert("Please provide the submission asset or live video link.");
      return;
    }

    setActionLoading(true);
    try {
      await api.collaborations.submitDeliverable(submittingDeliv.id, {
        submissionUrl,
        notes: submissionNotes
      });
      alert("Deliverable submitted for sponsor review! 🚀");
      setSubmittingDeliv(null);
      setSubmissionUrl("");
      setSubmissionNotes("");
      await loadCollaboration();
    } catch (err) {
      alert("Submission failed: " + (err.message || ""));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewDeliverable = async () => {
    setActionLoading(true);
    try {
      await api.collaborations.reviewDeliverable(reviewingDeliv.id, {
        decision: reviewDecision,
        feedback: reviewFeedback
      });
      alert(`Deliverable marked as ${reviewDecision} ✅`);
      setReviewingDeliv(null);
      setReviewFeedback("");
      await loadCollaboration();
    } catch (err) {
      alert("Review failed: " + (err.message || ""));
    } finally {
      setActionLoading(false);
    }
  };

  const currentStageIndex = collab ? STAGES.indexOf(collab.status) : 0;

  return (
    <AppShell
      pageTitle={`Deal Room: ${collab?.campaign?.title || "Collaboration"}`}
      subtitle={`Collaboration between ${collab?.creatorProfile?.user?.name || "Creator"} & ${collab?.brandProfile?.companyName || "Brand"}`}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          Loading collaboration workspace...
        </div>
      ) : !collab ? (
        <p>Collaboration not found.</p>
      ) : (
        <div>
          {/* Back Button */}
          <div style={{ marginBottom: "16px" }}>
            <button
              onClick={() => navigate(-1)}
              style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "600" }}
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* 10-Stage Progress Lifecycle Bar */}
          <div style={lifecycleBarStyle}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "12px", letterSpacing: "0.06em" }}>
              DEAL EXECUTION LIFECYCLE
            </div>
            <div style={stagePillsContainerStyle}>
              {STAGES.map((st, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = collab.status === st;

                return (
                  <div
                    key={st}
                    style={{
                      ...stagePillStyle,
                      backgroundColor: isCurrent ? "#10b981" : isPassed ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.05)",
                      color: isCurrent ? "#ffffff" : isPassed ? "#34d399" : "#64748b",
                      border: isCurrent ? "1px solid #10b981" : "1px solid transparent",
                      fontWeight: isCurrent ? "700" : "500"
                    }}
                  >
                    {idx + 1}. {st.replace("_", " ")}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deal Metadata Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginTop: "24px" }}>
            {/* Left Column: Deliverables & Milestones */}
            <div>
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc" }}>
                    📋 Agreed Deliverables ({collab.deliverables?.length || 0})
                  </h3>

                  {/* Stage Transition Buttons */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    {collab.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleTransition("IN_PROGRESS")}
                        disabled={actionLoading}
                        style={primaryBtnStyle}
                      >
                        🚀 Mark In Progress
                      </button>
                    )}
                  </div>
                </div>

                {collab.deliverables?.length === 0 ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
                    No specific deliverables defined. Brand terms: {collab.deliverableTerms}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {collab.deliverables.map((deliv) => (
                      <div key={deliv.id} style={deliverableCardStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>
                              {deliv.title}
                            </h4>
                            <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                              {deliv.description}
                            </p>
                          </div>

                          <span className={`badge ${
                            deliv.status === "APPROVED"
                              ? "badge-green"
                              : deliv.status === "SUBMITTED"
                              ? "badge-blue"
                              : deliv.status === "CHANGES_REQUESTED"
                              ? "badge-amber"
                              : "badge-gray"
                          }`}>
                            {deliv.status.replace("_", " ")}
                          </span>
                        </div>

                        {/* Submission Link & Review Notes */}
                        {deliv.submissionUrl && (
                          <div style={submissionBoxStyle}>
                            <div style={{ fontSize: "12px", color: "#38bdf8", fontWeight: "600" }}>
                              Submitted Asset Link:
                            </div>
                            <a
                              href={deliv.submissionUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "#f8fafc", fontSize: "13px", wordBreak: "break-all" }}
                            >
                              {deliv.submissionUrl} ↗
                            </a>
                            {deliv.notes && (
                              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                                Note: {deliv.notes}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Brand Feedback if Changes Requested */}
                        {deliv.brandFeedback && (
                          <div style={feedbackBoxStyle}>
                            <strong style={{ color: "#f59e0b", fontSize: "12px" }}>Brand Revision Notes:</strong>
                            <p style={{ fontSize: "13px", color: "#f8fafc", marginTop: "2px" }}>
                              {deliv.brandFeedback}
                            </p>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                          {isCreator && (deliv.status === "PENDING" || deliv.status === "CHANGES_REQUESTED") && (
                            <button
                              onClick={() => { setSubmittingDeliv(deliv); setSubmissionUrl(deliv.submissionUrl || ""); }}
                              style={primaryBtnStyle}
                            >
                              📤 Submit Deliverable Link
                            </button>
                          )}

                          {isBrand && deliv.status === "SUBMITTED" && (
                            <button
                              onClick={() => setReviewingDeliv(deliv)}
                              style={primaryBtnStyle}
                            >
                              🔍 Review & Approve / Request Changes
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Campaign Brief & Parties */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Commercial Terms */}
              <div style={cardStyle}>
                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#f8fafc", marginBottom: "14px" }}>
                  💰 Commercial Terms
                </h4>
                <div style={{ padding: "12px", backgroundColor: "rgba(10, 17, 34, 0.6)", borderRadius: "8px" }}>
                  <span style={statLabelStyle}>TOTAL AGREED COMPENSATION</span>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>
                    ₹{collab.agreedAmount.toLocaleString()} {collab.currency}
                  </div>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>Contractually committed upon deliverable approval</span>
                </div>
              </div>

              {/* Campaign Brief */}
              <div style={cardStyle}>
                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#f8fafc", marginBottom: "8px" }}>
                  📢 Campaign Brief
                </h4>
                <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>
                  {collab.campaign?.description}
                </p>
                <div style={{ marginTop: "12px", fontSize: "12px", color: "#cbd5e1" }}>
                  <strong>Deliverable Terms:</strong> {collab.deliverableTerms}
                </div>
              </div>

              {/* Creator Card */}
              <div style={cardStyle}>
                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#f8fafc", marginBottom: "8px" }}>
                  🎨 Creator Partner
                </h4>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc" }}>
                  {collab.creatorProfile?.user?.name}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {collab.creatorProfile?.user?.email}
                </div>
                <div style={{ marginTop: "8px" }}>
                  <a
                    href={`/media-kit/${collab.creatorProfileId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "12px", color: "#10b981", fontWeight: "600" }}
                  >
                    View Verified Media Kit ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT DELIVERABLE */}
      {submittingDeliv && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", marginBottom: "12px" }}>
              Submit: {submittingDeliv.title}
            </h3>

            <label style={statLabelStyle}>SUBMISSION URL (UNLISTED VIDEO / ASSET / POST LINK)</label>
            <input
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              placeholder="https://youtu.be/... or https://drive.google.com/..."
              required
              style={{ margin: "6px 0 16px 0" }}
            />

            <label style={statLabelStyle}>SUBMISSION NOTES / TIMESTAMPS</label>
            <textarea
              rows={3}
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="e.g. Sponsor integration starts at 01:45 with call-out link in description..."
              style={{ margin: "6px 0 20px 0" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setSubmittingDeliv(null)} style={btnSecondaryStyle}>
                Cancel
              </button>
              <button onClick={handleSubmitDeliverable} disabled={actionLoading} style={primaryBtnStyle}>
                {actionLoading ? "Submitting..." : "Submit for Sponsor Review →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW DELIVERABLE */}
      {reviewingDeliv && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", marginBottom: "12px" }}>
              Review: {reviewingDeliv.title}
            </h3>

            <div style={{ marginBottom: "16px" }}>
              <label style={statLabelStyle}>REVIEW DECISION</label>
              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => setReviewDecision("APPROVED")}
                  style={{
                    ...decisionBtnStyle,
                    backgroundColor: reviewDecision === "APPROVED" ? "#10b981" : "var(--bg-input)",
                    color: reviewDecision === "APPROVED" ? "#ffffff" : "#94a3b8"
                  }}
                >
                  ✅ Approve Deliverable
                </button>
                <button
                  type="button"
                  onClick={() => setReviewDecision("CHANGES_REQUESTED")}
                  style={{
                    ...decisionBtnStyle,
                    backgroundColor: reviewDecision === "CHANGES_REQUESTED" ? "#f59e0b" : "var(--bg-input)",
                    color: reviewDecision === "CHANGES_REQUESTED" ? "#ffffff" : "#94a3b8"
                  }}
                >
                  ⚠️ Request Revisions
                </button>
              </div>
            </div>

            <label style={statLabelStyle}>REVIEW FEEDBACK / REVISION DETAILS</label>
            <textarea
              rows={4}
              value={reviewFeedback}
              onChange={(e) => setReviewFeedback(e.target.value)}
              placeholder={
                reviewDecision === "APPROVED"
                  ? "Optional praise or final publishing authorization..."
                  : "Specify required adjustments before deliverable can be approved..."
              }
              style={{ margin: "6px 0 20px 0" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setReviewingDeliv(null)} style={btnSecondaryStyle}>
                Cancel
              </button>
              <button onClick={handleReviewDeliverable} disabled={actionLoading} style={primaryBtnStyle}>
                {actionLoading ? "Processing..." : "Confirm Review Decision →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

// Styles
const lifecycleBarStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "20px"
};

const stagePillsContainerStyle = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap"
};

const stagePillStyle = {
  padding: "6px 12px",
  borderRadius: "var(--radius-full)",
  fontSize: "11px",
  letterSpacing: "0.03em"
};

const cardStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "24px"
};

const deliverableCardStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.6)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  padding: "20px"
};

const submissionBoxStyle = {
  marginTop: "12px",
  padding: "10px 14px",
  backgroundColor: "rgba(56, 189, 248, 0.08)",
  border: "1px solid rgba(56, 189, 248, 0.2)",
  borderRadius: "6px"
};

const feedbackBoxStyle = {
  marginTop: "12px",
  padding: "10px 14px",
  backgroundColor: "rgba(245, 158, 11, 0.08)",
  border: "1px solid rgba(245, 158, 11, 0.25)",
  borderRadius: "6px"
};

const statLabelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "var(--text-dim)",
  letterSpacing: "0.05em"
};

const primaryBtnStyle = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "#ffffff",
  fontWeight: "700",
  fontSize: "13px",
  padding: "10px 18px",
  borderRadius: "8px"
};

const btnSecondaryStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  color: "#f8fafc",
  fontSize: "13px",
  fontWeight: "600",
  padding: "8px 16px",
  borderRadius: "6px"
};

const decisionBtnStyle = {
  flex: 1,
  padding: "10px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-subtle)",
  fontSize: "13px",
  fontWeight: "600"
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.75)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1200,
  padding: "20px"
};

const modalBoxStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  width: "100%",
  maxWidth: "520px",
  padding: "28px"
};
