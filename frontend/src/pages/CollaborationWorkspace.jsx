import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { api } from "../services/api";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Check,
  ExternalLink,
  FileText,
  Sparkles,
  Coins,
  Megaphone,
  Palette,
  X,
  Clock,
  ArrowRight
} from "lucide-react";

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
      alert(`Deal progressed to ${targetStatus}.`);
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
      alert("Deliverable submitted for sponsor review.");
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
      alert(`Deliverable marked as ${reviewDecision}.`);
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
            <Sparkles size={24} />
          </div>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "500" }}>Loading collaboration workspace...</p>
        </div>
      ) : !collab ? (
        <p style={{ color: "var(--text-secondary)" }}>Collaboration not found.</p>
      ) : (
        <div>
          {/* Back Button */}
          <div style={{ marginBottom: "16px" }}>
            <button
              onClick={() => navigate(-1)}
              style={backBtnStyle}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </div>

          {/* 10-Stage Progress Lifecycle Bar */}
          <div style={lifecycleBarStyle}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "12px", letterSpacing: "0.06em" }}>
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
                      backgroundColor: isCurrent ? "var(--brand-primary)" : isPassed ? "var(--brand-light)" : "var(--bg-surface-raised)",
                      color: isCurrent ? "#ffffff" : isPassed ? "var(--brand-primary)" : "var(--text-muted)",
                      border: isCurrent ? "1px solid var(--brand-primary)" : "1px solid var(--border-subtle)",
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginTop: "24px" }}>
            {/* Left Column: Deliverables & Milestones */}
            <div style={{ gridColumn: "span 2" }}>
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={18} style={{ color: "var(--brand-primary)" }} />
                    Agreed Deliverables ({collab.deliverables?.length || 0})
                  </h3>

                  {/* Stage Transition Buttons */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    {collab.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleTransition("IN_PROGRESS")}
                        disabled={actionLoading}
                        style={primaryBtnStyle}
                      >
                        <Sparkles size={14} /> Mark In Progress
                      </button>
                    )}
                  </div>
                </div>

                {collab.deliverables?.length === 0 ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", backgroundColor: "var(--bg-surface-raised)", borderRadius: "var(--radius-md)" }}>
                    No specific deliverables defined. Brand terms: {collab.deliverableTerms}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {collab.deliverables.map((deliv) => (
                      <div key={deliv.id} style={deliverableCardStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                          <div>
                            <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                              {deliv.title}
                            </h4>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", margin: "4px 0 0" }}>
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
                            <div style={{ fontSize: "12px", color: "var(--color-blue)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                              <UploadCloud size={14} /> Submitted Asset Link:
                            </div>
                            <a
                              href={deliv.submissionUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "var(--text-primary)", fontSize: "13px", wordBreak: "break-all", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "4px" }}
                            >
                              {deliv.submissionUrl} <ExternalLink size={12} />
                            </a>
                            {deliv.notes && (
                              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", margin: "4px 0 0" }}>
                                Note: {deliv.notes}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Brand Feedback if Changes Requested */}
                        {deliv.brandFeedback && (
                          <div style={feedbackBoxStyle}>
                            <strong style={{ color: "var(--color-amber)", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                              <AlertTriangle size={14} /> Brand Revision Notes:
                            </strong>
                            <p style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "2px", margin: "2px 0 0" }}>
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
                              <UploadCloud size={14} /> Submit Deliverable Link
                            </button>
                          )}

                          {isBrand && deliv.status === "SUBMITTED" && (
                            <button
                              onClick={() => setReviewingDeliv(deliv)}
                              style={primaryBtnStyle}
                            >
                              <CheckCircle2 size={14} /> Review & Approve / Request Changes
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
                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Coins size={16} style={{ color: "var(--brand-primary)" }} /> Commercial Terms
                </h4>
                <div style={{ padding: "14px", backgroundColor: "var(--bg-surface-raised)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                  <span style={statLabelStyle}>TOTAL AGREED COMPENSATION</span>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--brand-primary)", marginTop: "4px" }}>
                    ₹{collab.agreedAmount.toLocaleString()} {collab.currency}
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Contractually committed upon deliverable approval</span>
                </div>
              </div>

              {/* Campaign Brief */}
              <div style={cardStyle}>
                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Megaphone size={16} style={{ color: "var(--color-blue)" }} /> Campaign Brief
                </h4>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  {collab.campaign?.description}
                </p>
                <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>Deliverable Terms:</strong> {collab.deliverableTerms}
                </div>
              </div>

              {/* Creator Card */}
              <div style={cardStyle}>
                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Palette size={16} style={{ color: "var(--color-purple)" }} /> Creator Partner
                </h4>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                  {collab.creatorProfile?.user?.name}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {collab.creatorProfile?.user?.email}
                </div>
                <div style={{ marginTop: "10px" }}>
                  <a
                    href={`/media-kit/${collab.creatorProfileId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "12px", color: "var(--brand-primary)", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                  >
                    View Verified Media Kit <ExternalLink size={12} />
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                Submit: {submittingDeliv.title}
              </h3>
              <button
                onClick={() => setSubmittingDeliv(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <label style={statLabelStyle}>SUBMISSION URL (UNLISTED VIDEO / ASSET / POST LINK)</label>
            <input
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              placeholder="https://youtu.be/... or https://drive.google.com/..."
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: "13.5px",
                outline: "none",
                margin: "6px 0 16px 0"
              }}
            />

            <label style={statLabelStyle}>SUBMISSION NOTES / TIMESTAMPS</label>
            <textarea
              rows={3}
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="e.g. Sponsor integration starts at 01:45 with call-out link in description..."
              style={{
                width: "100%",
                padding: "10px 14px",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: "13.5px",
                outline: "none",
                margin: "6px 0 20px 0"
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setSubmittingDeliv(null)} style={btnSecondaryStyle}>
                Cancel
              </button>
              <button onClick={handleSubmitDeliverable} disabled={actionLoading} style={primaryBtnStyle}>
                {actionLoading ? "Submitting..." : "Submit for Sponsor Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW DELIVERABLE */}
      {reviewingDeliv && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                Review: {reviewingDeliv.title}
              </h3>
              <button
                onClick={() => setReviewingDeliv(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={statLabelStyle}>REVIEW DECISION</label>
              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => setReviewDecision("APPROVED")}
                  style={{
                    ...decisionBtnStyle,
                    backgroundColor: reviewDecision === "APPROVED" ? "var(--brand-primary)" : "var(--bg-surface-raised)",
                    color: reviewDecision === "APPROVED" ? "#ffffff" : "var(--text-secondary)",
                    borderColor: reviewDecision === "APPROVED" ? "var(--brand-primary)" : "var(--border-subtle)"
                  }}
                >
                  <CheckCircle2 size={16} /> Approve Deliverable
                </button>
                <button
                  type="button"
                  onClick={() => setReviewDecision("CHANGES_REQUESTED")}
                  style={{
                    ...decisionBtnStyle,
                    backgroundColor: reviewDecision === "CHANGES_REQUESTED" ? "var(--color-amber)" : "var(--bg-surface-raised)",
                    color: reviewDecision === "CHANGES_REQUESTED" ? "#000000" : "var(--text-secondary)",
                    borderColor: reviewDecision === "CHANGES_REQUESTED" ? "var(--color-amber)" : "var(--border-subtle)"
                  }}
                >
                  <AlertTriangle size={16} /> Request Revisions
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
              style={{
                width: "100%",
                padding: "10px 14px",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: "13.5px",
                outline: "none",
                margin: "6px 0 20px 0"
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setReviewingDeliv(null)} style={btnSecondaryStyle}>
                Cancel
              </button>
              <button onClick={handleReviewDeliverable} disabled={actionLoading} style={primaryBtnStyle}>
                {actionLoading ? "Processing..." : "Confirm Review Decision"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

// Styles
const backBtnStyle = {
  color: "var(--text-secondary)",
  fontSize: "13px",
  fontWeight: "600",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "4px 0"
};

const lifecycleBarStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "20px",
  boxShadow: "var(--shadow-sm)"
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
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "24px",
  boxShadow: "var(--shadow-sm)"
};

const deliverableCardStyle = {
  backgroundColor: "var(--bg-surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  padding: "20px"
};

const submissionBoxStyle = {
  marginTop: "12px",
  padding: "10px 14px",
  backgroundColor: "var(--color-blue-light)",
  border: "1px solid rgba(56, 189, 248, 0.25)",
  borderRadius: "var(--radius-sm)"
};

const feedbackBoxStyle = {
  marginTop: "12px",
  padding: "10px 14px",
  backgroundColor: "var(--color-amber-light)",
  border: "1px solid rgba(245, 158, 11, 0.3)",
  borderRadius: "var(--radius-sm)"
};

const statLabelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "var(--text-muted)",
  letterSpacing: "0.05em"
};

const primaryBtnStyle = {
  background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "13px",
  padding: "9px 16px",
  borderRadius: "var(--radius-md)",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  boxShadow: "0 2px 8px var(--brand-glow)"
};

const btnSecondaryStyle = {
  backgroundColor: "var(--bg-surface-raised)",
  border: "1px solid var(--border-subtle)",
  color: "var(--text-primary)",
  fontSize: "13px",
  fontWeight: "600",
  padding: "8px 16px",
  borderRadius: "var(--radius-md)",
  cursor: "pointer"
};

const decisionBtnStyle = {
  flex: 1,
  padding: "10px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-subtle)",
  fontSize: "13px",
  fontWeight: "600",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  cursor: "pointer",
  transition: "all 0.15s ease"
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "var(--bg-overlay)",
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
  padding: "28px",
  boxShadow: "var(--shadow-xl)"
};
