import React from "react";

export default function ExpenseList({ expenses = [] }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div style={emptyStyle}>
        <p>No specific expense categories specified for this project.</p>
      </div>
    );
  }

  const getCategoryIcon = (category) => {
    const lower = String(category).toLowerCase();
    if (lower.includes("equipment") || lower.includes("camera") || lower.includes("lens")) return "📷";
    if (lower.includes("travel") || lower.includes("flight") || lower.includes("hotel")) return "✈️";
    if (lower.includes("edit") || lower.includes("vfx") || lower.includes("software")) return "💻";
    if (lower.includes("actor") || lower.includes("cast") || lower.includes("crew")) return "👥";
    if (lower.includes("location") || lower.includes("studio")) return "📍";
    if (lower.includes("prop") || lower.includes("costume")) return "🎭";
    if (lower.includes("sound") || lower.includes("audio") || lower.includes("music")) return "🎧";
    return "💰";
  };

  return (
    <div style={containerStyle}>
      <h4 style={titleStyle}>📋 Permitted Milestone Expenses</h4>
      <p style={subStyle}>Funds released from escrow may strictly be allocated towards:</p>
      <div style={gridStyle}>
        {expenses.map((expense, idx) => {
          const name = typeof expense === "string" ? expense : expense.category || "General Expense";
          const amount = typeof expense === "object" && expense.allocatedAmount ? `₹${expense.allocatedAmount.toLocaleString()}` : null;

          return (
            <div key={idx} style={itemStyle}>
              <span style={iconStyle}>{getCategoryIcon(name)}</span>
              <div style={contentStyle}>
                <span style={nameStyle}>{name}</span>
                {amount && <span style={amountStyle}>{amount}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const containerStyle = {
  marginTop: "16px",
  padding: "16px 20px",
  backgroundColor: "#f9fafb",
  borderRadius: "14px",
  border: "1px solid #e5e7eb"
};

const titleStyle = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#1f2937",
  marginBottom: "4px"
};

const subStyle = {
  fontSize: "12px",
  color: "#6b7280",
  marginBottom: "12px"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: "10px"
};

const itemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 14px",
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
};

const iconStyle = {
  fontSize: "20px"
};

const contentStyle = {
  display: "flex",
  flexDirection: "column"
};

const nameStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151"
};

const amountStyle = {
  fontSize: "12px",
  color: "#059669",
  fontWeight: "500"
};

const emptyStyle = {
  padding: "14px",
  color: "#9ca3af",
  fontSize: "13px",
  textAlign: "center"
};
