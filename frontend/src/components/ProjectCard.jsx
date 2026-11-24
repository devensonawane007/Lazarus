import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProjectCard({ project, onInvestClick }) {
  const navigate = useNavigate();

  const fundingTarget = project.funding_target || project.fundingTarget || 0;
  const amountRaised = project.amount_raised || project.amountRaised || 0;
  const progressPercent = Math.min(
    100,
    Math.round((amountRaised / (fundingTarget || 1)) * 100)
  );

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return { bg: "#d1fae5", text: "#065f46" };
      case "IN_PROGRESS":
        return { bg: "#dbeafe", text: "#1e40af" };
      case "SUBMITTED":
        return { bg: "#fef3c7", text: "#92400e" };
      case "DISPUTED":
        return { bg: "#fee2e2", text: "#991b1b" };
      default:
        return { bg: "#ecfdf5", text: "#059669" };
    }
  };

  const statusStyle = getStatusColor(project.status);

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div>
          <span style={{ ...badgeStyle, backgroundColor: statusStyle.bg, color: statusStyle.text }}>
            {project.status || "FUNDING"}
          </span>
          <span style={{ ...badgeStyle, backgroundColor: "#f3f4f6", color: "#4b5563", marginLeft: "8px" }}>
            🎬 {project.video_type || project.videoType || "General"}
          </span>
        </div>
        <span style={dateStyle}>
          {project.created_at ? new Date(project.created_at).toLocaleDateString() : ""}
        </span>
      </div>

      <h3 style={titleStyle}>{project.title}</h3>
      <p style={descStyle}>
        {project.description && project.description.length > 130
          ? `${project.description.slice(0, 130)}...`
          : project.description || "No description provided."}
      </p>

      {/* Creator Info */}
      {project.creator && (
        <div style={creatorRowStyle}>
          <span style={creatorIconStyle}>👤</span>
          <span style={creatorNameStyle}>
            Created by <strong>{project.creator.name || "Creator"}</strong>
          </span>
        </div>
      )}

      {/* Funding Progress Bar */}
      <div style={progressContainerStyle}>
        <div style={progressLabelsStyle}>
          <span>Raised: <strong>₹{amountRaised.toLocaleString()}</strong></span>
          <span>Goal: <strong>₹{fundingTarget.toLocaleString()}</strong></span>
        </div>
        <div style={progressBarBgStyle}>
          <div style={{ ...progressBarFillStyle, width: `${progressPercent}%` }} />
        </div>
        <div style={percentTextStyle}>{progressPercent}% Funded in Escrow</div>
      </div>

      {/* Allowed Expenses Badges */}
      {project.allowed_expenses && project.allowed_expenses.length > 0 && (
        <div style={expenseRowStyle}>
          <span style={expenseLabelStyle}>Expenses:</span>
          {project.allowed_expenses.slice(0, 3).map((exp, idx) => (
            <span key={idx} style={expenseTagStyle}>
              {exp}
            </span>
          ))}
          {project.allowed_expenses.length > 3 && (
            <span style={expenseTagStyle}>+{project.allowed_expenses.length - 3}</span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={actionsStyle}>
        <button
          onClick={() => navigate("/project", { state: project })}
          style={secondaryBtnStyle}
        >
          View Details
        </button>
        {onInvestClick && project.status !== "COMPLETED" && (
          <button
            onClick={() => onInvestClick(project)}
            style={primaryBtnStyle}
          >
            💸 Invest in Escrow
          </button>
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#ffffff",
  borderRadius: "18px",
  padding: "24px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: "transform 0.2s, box-shadow 0.2s"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px"
};

const badgeStyle = {
  display: "inline-block",
  fontSize: "12px",
  fontWeight: "600",
  padding: "4px 10px",
  borderRadius: "20px",
  textTransform: "uppercase"
};

const dateStyle = {
  fontSize: "12px",
  color: "#9ca3af"
};

const titleStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#111827",
  marginBottom: "8px",
  lineHeight: "1.3"
};

const descStyle = {
  fontSize: "14px",
  color: "#4b5563",
  lineHeight: "1.5",
  marginBottom: "16px",
  minHeight: "42px"
};

const creatorRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "13px",
  color: "#6b7280",
  marginBottom: "16px"
};

const creatorIconStyle = {
  fontSize: "14px"
};

const creatorNameStyle = {
  color: "#374151"
};

const progressContainerStyle = {
  marginBottom: "16px"
};

const progressLabelsStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "13px",
  color: "#374151",
  marginBottom: "6px"
};

const progressBarBgStyle = {
  height: "8px",
  backgroundColor: "#e5e7eb",
  borderRadius: "999px",
  overflow: "hidden"
};

const progressBarFillStyle = {
  height: "100%",
  backgroundColor: "#10b981",
  borderRadius: "999px",
  transition: "width 0.4s ease"
};

const percentTextStyle = {
  fontSize: "11px",
  color: "#059669",
  fontWeight: "600",
  marginTop: "4px",
  textAlign: "right"
};

const expenseRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px",
  alignItems: "center",
  marginBottom: "18px"
};

const expenseLabelStyle = {
  fontSize: "12px",
  color: "#6b7280",
  marginRight: "4px"
};

const expenseTagStyle = {
  fontSize: "11px",
  backgroundColor: "#f3f4f6",
  color: "#4b5563",
  padding: "2px 8px",
  borderRadius: "6px"
};

const actionsStyle = {
  display: "flex",
  gap: "10px",
  marginTop: "auto"
};

const primaryBtnStyle = {
  flex: 1,
  padding: "10px 14px",
  backgroundColor: "#059669",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer"
};

const secondaryBtnStyle = {
  flex: 1,
  padding: "10px 14px",
  backgroundColor: "#f9fafb",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer"
};
