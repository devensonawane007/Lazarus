import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import VideoPerformanceGraph from "../components/VideoPerformanceGraph";
const API = "http://localhost:5000";

// Fixed niche list (easy matching)
const NICHE_OPTIONS = [
    "tech",
    "ai",
    "finance",
    "fitness",
    "travel",
    "fashion",
    "gaming",
    "education",
    "food",
    "lifestyle"
];
    
export default function CreatorDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const sigRef = useRef(null);

    const creatorId = user.name.toLowerCase().replace(/\s+/g, "_");

    // Portfolio state
    const [selectedNiches, setSelectedNiches] = useState([]);
    const [portfolio, setPortfolio] = useState({
        platform: "youtube",
        url: "",
        followers: "",
        avgViews: ""
    });

    // MOU state
    const [showMOU, setShowMOU] = useState(false);
    const [hasSigned, setHasSigned] = useState(false);
    const [isMouSigned, setIsMouSigned] = useState(false);

    // Campaign state
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);

    /* ===============================
       SIGN MOU
    ================================ */
    const handleSignAndDownload = () => {
        if (!hasSigned) {
            alert("Please sign the Agentic AI MOU before proceeding.");
            return;
        }

        const dataURL = sigRef.current.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "Agentic_AI_MOU_Signature.png";
        link.click();

        setIsMouSigned(true);
        setShowMOU(false);
        alert("MOU signed successfully! ✅ You can now access all features.");
    };

    const clearSignature = () => {
        sigRef.current.clear();
        setHasSigned(false);
    };

    /* ===============================
       SAVE CREATOR PROFILE
    ================================ */
    const saveProfile = async () => {
        if (!isMouSigned) {
            alert("Please sign the MOU first before saving your profile.");
            setShowMOU(true);
            return;
        }

        if (selectedNiches.length === 0) {
            alert("Select at least one niche");
            return;
        }

        try {
            await fetch(`${API}/api/creator/profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    creatorId,
                    name: user.name,
                    niches: selectedNiches,
                    platform: portfolio.platform,
                    url: portfolio.url,
                    followers: portfolio.followers,
                    avgViews: portfolio.avgViews
                })
            });

            alert("Profile saved ✅");
            fetchMatchedCampaigns();
        } catch {
            alert("Failed to save profile");
        }
    };

    /* ===============================
       FETCH MATCHED CAMPAIGNS
    ================================ */
    const fetchMatchedCampaigns = async () => {
        if (!isMouSigned) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
                `${API}/api/campaigns/match/${creatorId}`
            );
            const data = await res.json();
            setCampaigns(data);
        } catch {
            alert("Failed to load campaigns");
        }
        setLoading(false);
    };

    /* ===============================
       APPLY TO CAMPAIGN
    ================================ */
    const applyCampaign = async (campaignId) => {
        if (!isMouSigned) {
            alert("Please sign the MOU first before applying to campaigns.");
            setShowMOU(true);
            return;
        }

        try {
            await fetch(`${API}/api/campaign/apply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaignId,
                    creatorId
                })
            });

            alert("Applied successfully 🚀");
        } catch {
            alert("Failed to apply");
        }
    };

    /* ===============================
       LOGOUT
    ================================ */
    const logout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    /* ===============================
       UI STYLES
    ================================ */
    const styles = {
        container: {
            minHeight: "100vh",
            background: "linear-gradient(135deg, #d4f4dd 0%, #c8f0d7 100%)",
            padding: "40px 20px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        },
        card: {
            background: "#ffffff",
            borderRadius: "24px",
            padding: "32px",
            marginBottom: "24px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            maxWidth: "1040px",
            margin: "0 auto 24px auto"
        },
        header: {
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "8px"
        },
        avatar: {
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            color: "white"
        },
        title: {
            fontSize: "32px",
            fontWeight: "700",
            color: "#1f2937",
            margin: 0
        },
        userInfo: {
            display: "flex",
            gap: "32px",
            marginTop: "12px",
            fontSize: "16px",
            color: "#6b7280"
        },
        statusBadge: {
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "600",
            marginTop: "12px"
        },
        statusSigned: {
            background: "#d1fae5",
            color: "#065f46"
        },
        statusPending: {
            background: "#fee2e2",
            color: "#991b1b"
        },
        sectionHeader: {
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px"
        },
        iconBox: {
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            color: "white"
        },
        sectionTitle: {
            fontSize: "24px",
            fontWeight: "700",
            color: "#1f2937",
            margin: 0
        },
        label: {
            fontSize: "16px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "16px",
            display: "block"
        },
        mouText: {
            fontSize: "15px",
            color: "#4b5563",
            lineHeight: "1.7",
            marginBottom: "16px"
        },
        signatureContainer: {
            border: "2px solid #10b981",
            borderRadius: "12px",
            marginBottom: "20px",
            overflow: "hidden"
        },
        signatureCanvas: {
            width: "100%",
            height: "200px",
            cursor: "crosshair"
        },
        buttonGroup: {
            display: "flex",
            gap: "12px",
            flexWrap: "wrap"
        },
        nicheGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "12px",
            marginBottom: "24px"
        },
        nicheButton: {
            padding: "12px 20px",
            borderRadius: "12px",
            border: "2px solid #e5e7eb",
            background: "#f9fafb",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "500",
            color: "#374151",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
        },
        nicheButtonActive: {
            background: "#d1fae5",
            borderColor: "#10b981",
            color: "#065f46"
        },
        checkbox: {
            width: "18px",
            height: "18px",
            accentColor: "#10b981",
            cursor: "pointer"
        },
        select: {
            width: "100%",
            padding: "14px 20px",
            borderRadius: "12px",
            border: "2px solid #e5e7eb",
            background: "#f9fafb",
            fontSize: "15px",
            color: "#374151",
            cursor: "pointer",
            marginBottom: "16px",
            appearance: "none",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 16px center"
        },
        input: {
            width: "100%",
            padding: "14px 20px",
            borderRadius: "12px",
            border: "2px solid #e5e7eb",
            background: "#f9fafb",
            fontSize: "15px",
            color: "#374151",
            marginBottom: "16px",
            boxSizing: "border-box",
            outline: "none",
            transition: "all 0.2s ease"
        },
        primaryButton: {
            padding: "14px 28px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "white",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
        },
        secondaryButton: {
            padding: "14px 28px",
            borderRadius: "12px",
            border: "2px solid #10b981",
            background: "white",
            color: "#10b981",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
        },
        clearButton: {
            padding: "14px 28px",
            borderRadius: "12px",
            border: "2px solid #ef4444",
            background: "white",
            color: "#ef4444",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
        },
        logoutButton: {
            padding: "14px 28px",
            borderRadius: "12px",
            border: "none",
            background: "#ef4444",
            color: "white",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
        },
        campaignCard: {
            background: "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            marginBottom: "16px",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
            border: "1px solid #f3f4f6"
        },
        campaignTitle: {
            fontSize: "20px",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "12px"
        },
        campaignText: {
            fontSize: "15px",
            color: "#6b7280",
            marginBottom: "8px",
            lineHeight: "1.6"
        },
        applyButton: {
            padding: "12px 24px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "white",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            marginTop: "12px",
            transition: "all 0.2s ease"
        },
        emptyState: {
            textAlign: "center",
            padding: "60px 20px",
            color: "#9ca3af",
            fontSize: "16px"
        },
        lockedOverlay: {
            position: "relative",
            opacity: "0.6",
            pointerEvents: "none"
        },
        lockMessage: {
            textAlign: "center",
            padding: "20px",
            background: "#fef3c7",
            borderRadius: "12px",
            marginBottom: "20px",
            fontSize: "15px",
            color: "#92400e",
            fontWeight: "600"
        }
    };

    /* ===============================
       UI RENDER
    ================================ */
    return (
        <div style={styles.container}>
            {/* ===============================
         HEADER CARD
      ================================ */}
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.avatar}>
                        👤
                    </div>
                    <div>
                        <h1 style={styles.title}>Creator Dashboard</h1>
                        <div style={styles.userInfo}>
                            <span><strong>Name:</strong> {user?.name}</span>
                            <span><strong>Role:</strong> Creator</span>
                        </div>
                        <div style={{
                            ...styles.statusBadge,
                            ...(isMouSigned ? styles.statusSigned : styles.statusPending)
                        }}>
                            {isMouSigned ? "✅ MOU Signed" : "⚠️ MOU Pending"}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===============================
         ACTION BUTTONS
      ================================ */}
            <div style={styles.card}>
                <div style={styles.buttonGroup}>
                    <button
                        onClick={() => setShowMOU(true)}
                        style={isMouSigned ? styles.secondaryButton : styles.primaryButton}
                        onMouseEnter={(e) => {
                            if (!isMouSigned) {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isMouSigned) {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                            }
                        }}
                    >
                        ✍️ {isMouSigned ? "View MOU" : "Sign MOU"}
                    </button>

                    <button
                        onClick={() => {
                            if (!isMouSigned) {
                                alert("Please sign the MOU first before creating a funding project.");
                                setShowMOU(true);
                            } else {
                                navigate("/create-project");
                            }
                        }}
                        style={styles.secondaryButton}
                        onMouseEnter={(e) => {
                            e.target.style.background = "#10b981";
                            e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "white";
                            e.target.style.color = "#10b981";
                        }}
                    >
                        ➕ Create Funding Project
                    </button>

                    <button
                        onClick={logout}
                        style={styles.logoutButton}
                        onMouseEnter={(e) => {
                            e.target.style.background = "#dc2626";
                            e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "#ef4444";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </div>

            {/* ===============================
         MOU SECTION
      ================================ */}
            {showMOU && (
                <div style={styles.card}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.iconBox}>
                            ✍️
                        </div>
                        <h2 style={styles.sectionTitle}>Agentic AI Agreement & MOU</h2>
                    </div>

                    <p style={styles.mouText}>
                        Our Agentic AI autonomously assists in decision making, risk analysis,
                        funding prioritization, and compliance monitoring.
                    </p>

                    <p style={styles.mouText}>
                        This Memorandum of Understanding legally binds you to platform terms,
                        ethical AI usage, and financial compliance clauses.
                    </p>

                    <p style={styles.mouText}>
                        <strong>Key Terms:</strong>
                    </p>
                    <ul style={{ ...styles.mouText, marginLeft: "20px" }}>
                        <li>You agree to provide accurate and truthful information in your creator profile</li>
                        <li>You will comply with all brand campaign requirements and deliverables</li>
                        <li>You authorize the platform to use AI for matching, analytics, and compliance</li>
                        <li>You understand that payment terms are subject to campaign completion and approval</li>
                        <li>You agree to maintain professional conduct with brands and followers</li>
                    </ul>

                    {!isMouSigned && (
                        <>
                            <label style={styles.label}>Sign Below:</label>
                            <div style={styles.signatureContainer}>
                                <SignatureCanvas
                                    ref={sigRef}
                                    penColor="black"
                                    onEnd={() => setHasSigned(true)}
                                    canvasProps={{
                                        width: 976,
                                        height: 200,
                                        style: styles.signatureCanvas
                                    }}
                                />
                            </div>

                            <div style={styles.buttonGroup}>
                                <button
                                    onClick={handleSignAndDownload}
                                    style={styles.primaryButton}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = "translateY(-2px)";
                                        e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = "translateY(0)";
                                        e.target.style.boxShadow = "none";
                                    }}
                                >
                                    📥 Sign & Download MOU
                                </button>

                                <button
                                    onClick={clearSignature}
                                    style={styles.clearButton}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = "#ef4444";
                                        e.target.style.color = "white";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = "white";
                                        e.target.style.color = "#ef4444";
                                    }}
                                >
                                    🗑️ Clear Signature
                                </button>

                                <button
                                    onClick={() => setShowMOU(false)}
                                    style={styles.secondaryButton}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = "#10b981";
                                        e.target.style.color = "white";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = "white";
                                        e.target.style.color = "#10b981";
                                    }}
                                >
                                    ✖️ Close
                                </button>
                            </div>
                        </>
                    )}

                    {isMouSigned && (
                        <div style={{ textAlign: "center" }}>
                            <p style={{ ...styles.mouText, color: "#065f46", fontWeight: "600", fontSize: "18px" }}>
                                ✅ MOU Signed Successfully
                            </p>
                            <button
                                onClick={() => setShowMOU(false)}
                                style={styles.secondaryButton}
                                onMouseEnter={(e) => {
                                    e.target.style.background = "#10b981";
                                    e.target.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = "white";
                                    e.target.style.color = "#10b981";
                                }}
                            >
                                ✖️ Close
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ===============================
         PORTFOLIO CARD
      ================================ */}
            <div style={styles.card}>
                {!isMouSigned && (
                    <div style={styles.lockMessage}>
                        🔒 Please sign the MOU above to unlock your creator portfolio
                    </div>
                )}

                <div style={isMouSigned ? {} : styles.lockedOverlay}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.iconBox}>
                            📊
                        </div>
                        <h2 style={styles.sectionTitle}>Creator Portfolio</h2>
                    </div>

                    <label style={styles.label}>Select Niches</label>

                    <div style={styles.nicheGrid}>
                        {NICHE_OPTIONS.map((niche) => (
                            <label
                                key={niche}
                                style={{
                                    ...styles.nicheButton,
                                    ...(selectedNiches.includes(niche) ? styles.nicheButtonActive : {})
                                }}
                            >
                                <input
                                    type="checkbox"
                                    value={niche}
                                    checked={selectedNiches.includes(niche)}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSelectedNiches((prev) =>
                                            prev.includes(value)
                                                ? prev.filter(n => n !== value)
                                                : [...prev, value]
                                        );
                                    }}
                                    style={styles.checkbox}
                                    disabled={!isMouSigned}
                                />
                                {niche}
                            </label>
                        ))}
                    </div>

                    <select
                        value={portfolio.platform}
                        onChange={(e) =>
                            setPortfolio({ ...portfolio, platform: e.target.value })
                        }
                        style={styles.select}
                        disabled={!isMouSigned}
                    >
                        <option value="youtube">YouTube</option>
                        <option value="instagram">Instagram</option>
                        <option value="shorts">YouTube Shorts</option>
                    </select>

                    <input
                        type="url"
                        placeholder="Channel / Profile URL"
                        value={portfolio.url}
                        onChange={(e) =>
                            setPortfolio({ ...portfolio, url: e.target.value })
                        }
                        style={styles.input}
                        onFocus={(e) => e.target.style.borderColor = "#10b981"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                        disabled={!isMouSigned}
                    />

                    <input
                        type="number"
                        placeholder="Followers / Subscribers"
                        value={portfolio.followers}
                        onChange={(e) =>
                            setPortfolio({ ...portfolio, followers: e.target.value })
                        }
                        style={styles.input}
                        onFocus={(e) => e.target.style.borderColor = "#10b981"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                        disabled={!isMouSigned}
                    />

                    <input
                        type="number"
                        placeholder="Average Views"
                        value={portfolio.avgViews}
                        onChange={(e) =>
                            setPortfolio({ ...portfolio, avgViews: e.target.value })
                        }
                        style={styles.input}
                        onFocus={(e) => e.target.style.borderColor = "#10b981"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                        disabled={!isMouSigned}
                    />

                    <button
                        onClick={saveProfile}
                        style={isMouSigned ? styles.secondaryButton : { ...styles.secondaryButton, opacity: 0.5 }}
                        onMouseEnter={(e) => {
                            if (isMouSigned) {
                                e.target.style.background = "#10b981";
                                e.target.style.color = "white";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (isMouSigned) {
                                e.target.style.background = "white";
                                e.target.style.color = "#10b981";
                            }
                        }}
                        disabled={!isMouSigned}
                    >
                        💾 Save Profile
                    </button>
                </div>
            </div>

            {/* ===============================
         CAMPAIGNS CARD
      ================================ */}
            <div style={styles.card}>
                {!isMouSigned && (
                    <div style={styles.lockMessage}>
                        🔒 Please sign the MOU to view and apply to brand campaigns
                    </div>
                )}

                <div style={isMouSigned ? {} : styles.lockedOverlay}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.iconBox}>
                            🎯
                        </div>
                        <h2 style={styles.sectionTitle}>Brand Campaigns for You</h2>
                    </div>

                    {loading && <p style={styles.emptyState}>Loading campaigns...</p>}

                    {campaigns.length === 0 && !loading && (
                        <p style={styles.emptyState}>
                            No matching campaigns yet. Save your profile to see personalized campaigns!
                        </p>
                    )}
                    <button onClick={() => navigate("/creator-deals")}>
                        🤝 Brand Deals
                    </button>
                    {campaigns.map((c) => (
                        <div key={c.id} style={styles.campaignCard}>
                            <h3 style={styles.campaignTitle}>{c.title}</h3>
                            <p style={styles.campaignText}>{c.description}</p>
                            <p style={styles.campaignText}><strong>Brand:</strong> {c.brandName}</p>
                            <p style={styles.campaignText}><strong>Niches:</strong> {c.niches.join(", ")}</p>
                            <p style={styles.campaignText}><strong>Budget:</strong> ₹{c.budget}</p>

                            <button
                                onClick={() => applyCampaign(c.id)}
                                style={styles.applyButton}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "none";
                                }}
                            >
                                Apply to Campaign
                            </button>
                            <VideoPerformanceGraph />
                            <hr />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}