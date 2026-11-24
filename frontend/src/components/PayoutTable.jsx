import React from "react";

export default function PayoutTable({ payouts = [] }) {
  if (!payouts || payouts.length === 0) {
    return (
      <div style={emptyContainerStyle}>
        <p>No payout simulation calculated yet. Enter projected video revenue above to simulate returns.</p>
      </div>
    );
  }

  const totalPayout = payouts.reduce((sum, p) => sum + (Number(p.payout) || 0), 0);
  const totalInvested = payouts.reduce((sum, p) => sum + (Number(p.invested) || 0), 0);

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h4 style={titleStyle}>📊 Simulated Payout Distribution</h4>
          <p style={subStyle}>Escrow automated smart-contract revenue sharing based on equity pledged</p>
        </div>
        <div style={summaryBadgeStyle}>
          Total Payout: <strong>₹{totalPayout.toLocaleString()}</strong>
        </div>
      </div>

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={thRowStyle}>
              <th style={thStyle}>Investor / Contributor</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Invested (₹)</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Ownership Share</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Projected Return (₹)</th>
              <th style={{ ...thStyle, textAlign: "right" }}>ROI</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((item, idx) => {
              const invested = Number(item.invested) || 0;
              const payout = Number(item.payout) || 0;
              const roi = invested > 0 ? (((payout - invested) / invested) * 100).toFixed(1) : "0.0";
              const isPositive = Number(roi) >= 0;

              return (
                <tr key={idx} style={trStyle}>
                  <td style={tdStyle}>
                    <div style={investorCell}>
                      <span style={avatarStyle}>💼</span>
                      <span style={investorNameStyle}>{item.investor || `Investor ${idx + 1}`}</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: "500" }}>
                    ₹{invested.toLocaleString()}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span style={pillStyle}>
                      {item.percentage || `${Math.round((invested / (totalInvested || 1)) * 100)}%`}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: "700", color: "#059669" }}>
                    ₹{payout.toLocaleString()}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <span style={{ ...roiStyle, color: isPositive ? "#059669" : "#dc2626" }}>
                      {isPositive ? `+${roi}%` : `${roi}%`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const containerStyle = {
  marginTop: "20px",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
  overflow: "hidden"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 24px",
  borderBottom: "1px solid #e5e7eb",
  backgroundColor: "#fafafa"
};

const titleStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#111827",
  margin: 0
};

const subStyle = {
  fontSize: "12px",
  color: "#6b7280",
  margin: "4px 0 0 0"
};

const summaryBadgeStyle = {
  fontSize: "14px",
  color: "#059669",
  backgroundColor: "#ecfdf5",
  padding: "6px 14px",
  borderRadius: "20px"
};

const tableWrapperStyle = {
  overflowX: "auto"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px"
};

const thRowStyle = {
  backgroundColor: "#f9fafb"
};

const thStyle = {
  padding: "12px 20px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#4b5563",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const trStyle = {
  borderBottom: "1px solid #f3f4f6"
};

const tdStyle = {
  padding: "14px 20px",
  color: "#374151"
};

const investorCell = {
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const avatarStyle = {
  fontSize: "16px"
};

const investorNameStyle = {
  fontWeight: "600",
  color: "#1f2937"
};

const pillStyle = {
  backgroundColor: "#f3f4f6",
  color: "#4b5563",
  padding: "3px 8px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "600"
};

const roiStyle = {
  fontWeight: "700",
  fontSize: "13px"
};

const emptyContainerStyle = {
  padding: "24px",
  textAlign: "center",
  color: "#9ca3af",
  fontSize: "14px",
  backgroundColor: "#f9fafb",
  borderRadius: "12px",
  border: "1px dashed #d1d5db",
  marginTop: "16px"
};
