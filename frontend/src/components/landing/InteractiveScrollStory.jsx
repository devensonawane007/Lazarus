import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  Link2,
  TrendingUp,
  Target,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  Sparkles,
  Eye,
  MessageSquare,
  FileText,
  DollarSign,
  ChevronRight,
  Video,
  Film,
  Tv,
  Check,
  Clock,
  RotateCw
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts";
import { useTheme } from "../../context/ThemeContext";

// Illustrative preview data for Chapter 3
const STUDIO_CHART_DATA = [
  { day: "Day 1", reach: 41200, views: 16400 },
  { day: "Day 6", reach: 42800, views: 21900 },
  { day: "Day 12", reach: 44100, views: 27800 },
  { day: "Day 18", reach: 45600, views: 32400 },
  { day: "Day 24", reach: 47200, views: 39500 },
  { day: "Day 30", reach: 48500, views: 48900 }
];

export default function InteractiveScrollStory() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeChapter, setActiveChapter] = useState(1);
  const [activeCollabStep, setActiveCollabStep] = useState(6); // Default on Stage 6 (Revisions) to show rich review

  // Refs for each chapter narrative block
  const chapter1Ref = useRef(null);
  const chapter2Ref = useRef(null);
  const chapter3Ref = useRef(null);
  const chapter4Ref = useRef(null);
  const chapter5Ref = useRef(null);
  const chapter6Ref = useRef(null);

  // Setup IntersectionObserver to detect which chapter is currently in focus
  useEffect(() => {
    const chapterRefs = [
      { id: 1, ref: chapter1Ref },
      { id: 2, ref: chapter2Ref },
      { id: 3, ref: chapter3Ref },
      { id: 4, ref: chapter4Ref },
      { id: 5, ref: chapter5Ref },
      { id: 6, ref: chapter6Ref }
    ];

    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -40% 0px", // Trigger when chapter is comfortably centered
      threshold: [0, 0.25, 0.5]
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const match = chapterRefs.find((c) => c.ref.current === entry.target);
          if (match) {
            setActiveChapter(match.id);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    chapterRefs.forEach(({ ref }) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToChapter = (chapterNum) => {
    setActiveChapter(chapterNum);
    const targetMap = {
      1: chapter1Ref,
      2: chapter2Ref,
      3: chapter3Ref,
      4: chapter4Ref,
      5: chapter5Ref,
      6: chapter6Ref
    };
    const target = targetMap[chapterNum];
    if (target && target.current) {
      target.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Render individual preview canvases based on chapter
  const renderPreviewCanvas = (chapter) => {
    switch (chapter) {
      case 1:
        return (
          <div style={{ position: "relative", minHeight: "440px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {/* Warning callout */}
            <div
              style={{
                backgroundColor: isDark ? "rgba(239, 68, 68, 0.12)" : "rgba(220, 38, 38, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px"
              }}
            >
              <AlertTriangle size={18} style={{ color: "var(--color-red)", flexShrink: 0 }} />
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                <strong style={{ color: "var(--text-primary)" }}>Status Quo:</strong> 5+ disconnected tools, unverified PDF decks, lost brand emails.
              </div>
            </div>

            {/* Scattered Cards Area */}
            <div style={{ position: "relative", height: "300px", width: "100%" }}>
              {/* Card 1: Static PDF */}
              <div
                className="animate-float-1"
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "15px",
                  width: "220px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px",
                  boxShadow: "var(--shadow-md)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <FileText size={14} style={{ color: "var(--color-amber)" }} />
                    <span style={{ fontSize: "11px", fontWeight: "700" }}>MediaKit_2023.pdf</span>
                  </div>
                  <span className="badge badge-amber" style={{ fontSize: "9px" }}>Stale Data</span>
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  Followers: ~40k (estimate)<br />
                  Avg Views: 15k (unverified)
                </div>
              </div>

              {/* Card 2: Cluttered DM */}
              <div
                className="animate-float-2"
                style={{
                  position: "absolute",
                  top: "50px",
                  right: "15px",
                  width: "210px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px",
                  boxShadow: "var(--shadow-md)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <MessageSquare size={14} style={{ color: "var(--color-blue)" }} />
                  <span style={{ fontSize: "11px", fontWeight: "700" }}>Brand DM (Twitter/X)</span>
                </div>
                <p style={{ fontSize: "10px", color: "var(--text-secondary)", fontStyle: "italic", margin: 0 }}>
                  "Hey Alex! Love your videos. Are you open for a sponsor brief? Email us your rates ASAP."
                </p>
              </div>

              {/* Card 3: Siloed YouTube */}
              <div
                className="animate-float-1"
                style={{
                  position: "absolute",
                  bottom: "35px",
                  left: "25px",
                  width: "200px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px",
                  boxShadow: "var(--shadow-md)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <Video size={14} style={{ color: "var(--color-red)" }} />
                  <span style={{ fontSize: "11px", fontWeight: "700" }}>YouTube Studio</span>
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
                  Siloed analytics • No combined cross-platform metrics
                </div>
              </div>

              {/* Card 4: Overdue Invoice */}
              <div
                className="animate-float-2"
                style={{
                  position: "absolute",
                  bottom: "15px",
                  right: "25px",
                  width: "210px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px",
                  boxShadow: "var(--shadow-md)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <DollarSign size={14} style={{ color: "var(--color-red)" }} />
                    <span style={{ fontSize: "11px", fontWeight: "700" }}>Invoice #04</span>
                  </div>
                  <span className="badge badge-red" style={{ fontSize: "9px" }}>45 Days Late</span>
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
                  ₹45,000 pending • Proof of post lost in email thread
                </div>
              </div>
            </div>

            {/* Convergence Prompt */}
            <div
              style={{
                backgroundColor: "var(--bg-surface-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>
                Ready to converge these silos?
              </span>
              <button
                onClick={() => scrollToChapter(2)}
                className="btn-ghost"
                style={{ padding: "4px 10px", fontSize: "12px", color: "var(--brand-primary)" }}
              >
                Scroll to Connect →
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Header info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
                  Connected Account Vault
                </h4>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
                  Official API contracts authenticated via OAuth 2.0
                </p>
              </div>
              <span className="badge badge-green">3 Providers Ready</span>
            </div>

            {/* Provider 1: YouTube */}
            <div
              style={{
                backgroundColor: "var(--bg-surface-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.12)",
                    color: "var(--color-red)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Video size={20} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>YouTube Data API v3</strong>
                    <span className="badge badge-green" style={{ fontSize: "10px" }}>Connected</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    @alexriveratech • 48,500 Subscribers (Daily Sync)
                  </span>
                </div>
              </div>
              <CheckCircle2 size={18} style={{ color: "var(--brand-primary)" }} />
            </div>

            {/* Provider 2: Instagram (Accurate sandbox/review disclosure) */}
            <div
              style={{
                backgroundColor: "var(--bg-surface-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(56, 189, 248, 0.12)",
                    color: "var(--color-blue)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Film size={20} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>Instagram Meta Graph API</strong>
                    <span className="badge badge-amber" style={{ fontSize: "10px" }}>Pending App Review</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                    Sandbox access active for test testers • Production review submitted
                  </span>
                </div>
              </div>
              <Clock size={18} style={{ color: "var(--color-amber)" }} />
            </div>

            {/* Provider 3: Twitch */}
            <div
              style={{
                backgroundColor: "var(--bg-surface-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(168, 85, 247, 0.12)",
                    color: "var(--color-purple)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Tv size={20} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>Twitch Helix API</strong>
                    <span className="badge badge-purple" style={{ fontSize: "10px" }}>Connected</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    alexrivera_live • 8,420 Followers • VOD Stats Synced
                  </span>
                </div>
              </div>
              <CheckCircle2 size={18} style={{ color: "var(--color-purple)" }} />
            </div>

            {/* Encryption Guarantee Notice */}
            <div
              style={{
                backgroundColor: isDark ? "rgba(16, 185, 129, 0.08)" : "rgba(5, 150, 105, 0.06)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}
            >
              <Lock size={16} style={{ color: "var(--brand-primary)", flexShrink: 0 }} />
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                <strong>AES-256-GCM Token Encryption:</strong> Access tokens are encrypted with authenticated ciphers and hardware-randomized 96-bit IVs. Plaintext tokens never hit the browser.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Header with Illustrative Preview Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
                  Alex Rivera Studio
                </span>
                <span className="badge badge-blue">Illustrative Studio Preview</span>
              </div>
              <span style={{ fontSize: "11px", color: "var(--brand-primary)", fontWeight: "700" }}>
                Live Ingestion Sync
              </span>
            </div>

            {/* 4 Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div className="stat-card" style={{ padding: "12px" }}>
                <span className="stat-label">Verified Audience</span>
                <div className="stat-value" style={{ fontSize: "18px" }}>48,500</div>
                <span style={{ fontSize: "11px", color: "var(--brand-primary)", fontWeight: "600" }}>
                  +14.8% 30d Growth
                </span>
              </div>

              <div className="stat-card" style={{ padding: "12px" }}>
                <span className="stat-label">Engagement Benchmark</span>
                <div className="stat-value" style={{ fontSize: "18px" }}>7.07%</div>
                <span style={{ fontSize: "11px", color: "var(--color-blue)", fontWeight: "600" }}>
                  Top 5% in AI Niche
                </span>
              </div>
            </div>

            {/* Growth Graph */}
            <div
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "12px",
                border: "1px solid var(--border-subtle)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>
                  Cross-Platform Audience Trajectory
                </span>
                <span style={{ fontSize: "11px", color: "var(--brand-primary)", fontWeight: "700" }}>
                  Verified
                </span>
              </div>
              <div style={{ width: "100%", height: 100 }}>
                <ResponsiveContainer>
                  <AreaChart data={STUDIO_CHART_DATA}>
                    <defs>
                      <linearGradient id="colorReachStory" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDark ? "#10b981" : "#059669"} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={isDark ? "#10b981" : "#059669"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="reach"
                      stroke={isDark ? "#10b981" : "#059669"}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorReachStory)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Auto Media Kit Showcase */}
            <div
              style={{
                backgroundColor: "var(--bg-surface-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileCheck2 size={15} style={{ color: "var(--brand-primary)" }} />
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>
                    Dynamic Media Kit Active
                  </span>
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  lazarus.app/kit/alexrivera
                </span>
              </div>

              <button
                onClick={() => navigate("/kit/alexrivera")}
                className="btn-ghost"
                style={{ fontSize: "11px", padding: "4px 10px", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span>Preview</span> <ExternalLink size={12} />
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-blue)", letterSpacing: "0.04em" }}>
                OPPORTUNITY ENGINE RECOMMENDATION
              </span>
              <span className="badge badge-green">High Fit</span>
            </div>

            {/* Campaign Detail Card */}
            <div
              style={{
                backgroundColor: "var(--bg-surface-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "16px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-primary)" }}>
                    AI Developer Copilot Q4 Sponsorship
                  </h4>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Sponsor: <strong>Nexus AI Cloud</strong> • Verified Tech Enterprise
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--brand-primary)", lineHeight: 1 }}>
                    98%
                  </div>
                  <span style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)" }}>
                    MATCH SCORE
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", marginBottom: "14px", flexWrap: "wrap" }}>
                <span className="badge badge-purple" style={{ fontSize: "11px" }}>
                  Budget: ₹85,000
                </span>
                <span className="badge badge-blue" style={{ fontSize: "11px" }}>
                  1x Dedicated Video + 1x Short
                </span>
                <span className="badge badge-green" style={{ fontSize: "11px" }}>
                  Escrow Guaranteed
                </span>
              </div>

              {/* Explainable Match Breakdown */}
              <div
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  EXPLAINABLE MATCH SCORE BREAKDOWN:
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>• Tech & AI Niche Alignment:</span>
                    <strong style={{ color: "var(--brand-primary)" }}>+40% (Exact match)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>• Connected YouTube Channel Presence:</span>
                    <strong style={{ color: "var(--brand-primary)" }}>+30% (Verified 48.5K)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>• Engagement Threshold (7.07% vs 4.5% min):</span>
                    <strong style={{ color: "var(--brand-primary)" }}>+15% (Surpassed)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>• Deliverable History Reliability:</span>
                    <strong style={{ color: "var(--brand-primary)" }}>+13% (100% on-time)</strong>
                  </div>
                </div>
              </div>

              {/* Rationale Quote */}
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                  marginTop: "12px",
                  lineHeight: 1.4,
                  margin: "12px 0 0"
                }}
              >
                "Why this matches: You create verified deep-dive coding tutorials, and Nexus AI requires authentic developer-led tool reviews."
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
                  Active Collaboration Workspace
                </h4>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                  Nexus AI Copilot • Deliverable #1
                </span>
              </div>
              <span className="badge badge-amber">Stage 6: Revisions</span>
            </div>

            {/* 8-Stage Interactive Mini-Lifecycle */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "6px",
                backgroundColor: "var(--bg-subtle)",
                padding: "8px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)"
              }}
            >
              {[
                { id: 1, name: "1. Applied" },
                { id: 2, name: "2. Shortlist" },
                { id: 3, name: "3. Terms" },
                { id: 4, name: "4. Agreement" },
                { id: 5, name: "5. Submitted" },
                { id: 6, name: "6. Revisions" },
                { id: 7, name: "7. Approved" },
                { id: 8, name: "8. Completed" }
              ].map((step) => {
                const isActive = activeCollabStep === step.id;
                const isPassed = step.id < activeCollabStep;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveCollabStep(step.id)}
                    style={{
                      padding: "4px 2px",
                      borderRadius: "4px",
                      fontSize: "9px",
                      fontWeight: "700",
                      textAlign: "center",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: isActive
                        ? "var(--brand-primary)"
                        : isPassed
                        ? "var(--brand-light)"
                        : "var(--bg-surface)",
                      color: isActive
                        ? "#ffffff"
                        : isPassed
                        ? "var(--brand-primary)"
                        : "var(--text-muted)"
                    }}
                  >
                    {step.name}
                  </button>
                );
              })}
            </div>

            {/* Deliverable Review Card */}
            <div
              style={{
                backgroundColor: "var(--bg-surface-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "14px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Video size={16} style={{ color: "var(--brand-primary)" }} />
                  <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                    Draft: "Building Full-Stack App with Nexus AI"
                  </strong>
                </div>
                <span className="badge badge-purple" style={{ fontSize: "10px" }}>
                  Unlisted YouTube
                </span>
              </div>

              {/* Sponsor Feedback Note */}
              <div
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderLeft: "3px solid var(--color-amber)",
                  padding: "10px 12px",
                  borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  marginBottom: "12px",
                  lineHeight: 1.4
                }}
              >
                <strong style={{ color: "var(--text-primary)" }}>Nexus AI Reviewer (Timestamp 02:45):</strong><br />
                "The code walk-through is crisp! Please boost the microphone volume during the terminal live-coding segment before final sign-off."
              </div>

              {/* Escrow Guarantee Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Milestone Escrow: ₹85,000 Locked
                </span>
                <span style={{ fontSize: "11px", color: "var(--brand-primary)", fontWeight: "700" }}>
                  Release Upon Stage 7 Approval
                </span>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", justifyContent: "center", height: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <span className="badge badge-green" style={{ marginBottom: "10px" }}>
                READY TO SCALE
              </span>
              <h4 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)" }}>
                Start Running Your Creator Business
              </h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Join professional creators and leading brand sponsors on Lazarus V3.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {/* Creator Card */}
              <div
                style={{
                  backgroundColor: "var(--bg-surface-raised)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <span className="badge badge-green" style={{ fontSize: "10px" }}>FOR CREATORS</span>
                  <h5 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginTop: "8px" }}>
                    Creator Studio
                  </h5>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>
                    Connect YouTube, Instagram & Twitch. Receive matched campaigns and guaranteed payouts.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/login?role=creator&mode=register")}
                  className="btn-primary"
                  style={{ width: "100%", marginTop: "14px", fontSize: "12px", padding: "8px 12px" }}
                >
                  Join as Creator →
                </button>
              </div>

              {/* Brand Card */}
              <div
                style={{
                  backgroundColor: "var(--bg-surface-raised)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <span className="badge badge-blue" style={{ fontSize: "10px" }}>FOR BRANDS</span>
                  <h5 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginTop: "8px" }}>
                    Brand Studio
                  </h5>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>
                    Deploy briefs, discover authentic creators with verified metrics, and manage 8-stage collaborations.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/login?role=brand&mode=register")}
                  className="btn-secondary"
                  style={{ width: "100%", marginTop: "14px", fontSize: "12px", padding: "8px 12px" }}
                >
                  Post a Campaign →
                </button>
              </div>
            </div>

            {/* Trust Pill */}
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", fontSize: "11px", color: "var(--text-muted)" }}>
              <span>✓ No credit card required</span>
              <span>✓ AES-256-GCM Encryption</span>
              <span>✓ Official API Verification</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="scroll-story-container" id="product-story">
      {/* =========================================================
          STICKY CHAPTER PROGRESS RAIL
      ========================================================== */}
      <nav
        className="scroll-story-progress-rail"
        aria-label="Story chapter navigation"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--brand-primary)", letterSpacing: "0.04em" }}>
            CHAPTER 0{activeChapter} / 06
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>•</span>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)" }}>
            {activeChapter === 1 && "The Fragmented Ecosystem"}
            {activeChapter === 2 && "Connect Your Ecosystem"}
            {activeChapter === 3 && "Understand Your Business"}
            {activeChapter === 4 && "Discover Opportunities"}
            {activeChapter === 5 && "Collaborate & Deliver"}
            {activeChapter === 6 && "Build Your Business"}
          </span>
        </div>

        {/* Chapter jump pills (Keyboard accessible) */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", maxWidth: "100%" }}>
          {[
            { num: 1, label: "01 Fragmented" },
            { num: 2, label: "02 Connect" },
            { num: 3, label: "03 Studio" },
            { num: 4, label: "04 Match" },
            { num: 5, label: "05 Collaborate" },
            { num: 6, label: "06 Launch" }
          ].map((pill) => (
            <button
              key={pill.num}
              onClick={() => scrollToChapter(pill.num)}
              className={`scroll-story-chapter-pill ${activeChapter === pill.num ? "active" : ""}`}
              aria-label={`Jump to ${pill.label}`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </nav>

      {/* =========================================================
          DESKTOP 2-COLUMN SPLIT / MOBILE STACKED CONTAINER
      ========================================================== */}
      <div className="scroll-story-desktop-grid">
        {/* -------------------------------------------------------
            LEFT COLUMN: SCROLLABLE NARRATIVE TRACK
        --------------------------------------------------------- */}
        <div>
          {/* CHAPTER 1 */}
          <div ref={chapter1Ref} id="story-chapter-1" className="scroll-story-narrative-item">
            <div className="badge badge-amber" style={{ width: "fit-content", marginBottom: "16px" }}>
              CHAPTER 01 • THE PROBLEM
            </div>
            <h2
              style={{
                fontSize: "clamp(26px, 3.5vw, 38px)",
                fontWeight: "800",
                lineHeight: 1.2,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em"
              }}
            >
              Your creator business is everywhere.<br />
              <span style={{ color: "var(--color-red)" }}>Your tools are fragmented.</span>
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-secondary)", marginTop: "16px", lineHeight: 1.6 }}>
              You are running a modern multi-channel media enterprise, but your operations are scattered across disparate browser tabs. You manage audience metrics in one platform, send pitch decks over email attachments, track deals on manual spreadsheets, and chase overdue invoice payments across chaotic direct messages.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--color-red)", fontWeight: "800" }}>✕</span>
                <span>Unverified static PDF media kits that go stale in weeks.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--color-red)", fontWeight: "800" }}>✕</span>
                <span>Disjointed analytics across YouTube, Instagram, and Twitch.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--color-red)", fontWeight: "800" }}>✕</span>
                <span>No escrow or milestone protection for completed creator work.</span>
              </div>
            </div>

            {/* Mobile preview block (Visible only on <=991px) */}
            <div className="scroll-story-mobile-preview card">
              {renderPreviewCanvas(1)}
            </div>
          </div>

          {/* CHAPTER 2 */}
          <div ref={chapter2Ref} id="story-chapter-2" className="scroll-story-narrative-item">
            <div className="badge badge-green" style={{ width: "fit-content", marginBottom: "16px" }}>
              CHAPTER 02 • UNIFICATION
            </div>
            <h2
              style={{
                fontSize: "clamp(26px, 3.5vw, 38px)",
                fontWeight: "800",
                lineHeight: 1.2,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em"
              }}
            >
              Bring your creator ecosystem together.
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-secondary)", marginTop: "16px", lineHeight: 1.6 }}>
              Authenticate your official YouTube, Instagram, and Twitch accounts through genuine platform OAuth 2.0 connectors. Lazarus normalizes disparate API data contracts into a single continuous stream while encrypting all sensitive tokens server-side with AES-256-GCM authenticated ciphers.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Google OAuth & YouTube Data API v3 integration.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Meta Graph API (with transparent Sandbox / App Review state).</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Twitch Helix API for broadcaster VODs and live stats.</span>
              </div>
            </div>

            {/* Mobile preview block */}
            <div className="scroll-story-mobile-preview card">
              {renderPreviewCanvas(2)}
            </div>
          </div>

          {/* CHAPTER 3 */}
          <div ref={chapter3Ref} id="story-chapter-3" className="scroll-story-narrative-item">
            <div className="badge badge-blue" style={{ width: "fit-content", marginBottom: "16px" }}>
              CHAPTER 03 • CREATOR STUDIO
            </div>
            <h2
              style={{
                fontSize: "clamp(26px, 3.5vw, 38px)",
                fontWeight: "800",
                lineHeight: 1.2,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em"
              }}
            >
              Understand the business behind your content.
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-secondary)", marginTop: "16px", lineHeight: 1.6 }}>
              Step into a high-octane Creator Studio workspace. Track total reach, audience retention, and authentic engagement percentages computed directly from verified platform analytics. Lazarus automatically compiles a dynamic Public Media Kit updated in real time—ready to share with prospective sponsors at your own personalized URL.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Dynamic cross-channel reach and MoM growth trajectories.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Top-performing content library with genuine engagement benchmarks.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Auto-generated public media kit with verified platform badges.</span>
              </div>
            </div>

            {/* Mobile preview block */}
            <div className="scroll-story-mobile-preview card">
              {renderPreviewCanvas(3)}
            </div>
          </div>

          {/* CHAPTER 4 */}
          <div ref={chapter4Ref} id="story-chapter-4" className="scroll-story-narrative-item">
            <div className="badge badge-purple" style={{ width: "fit-content", marginBottom: "16px" }}>
              CHAPTER 04 • OPPORTUNITY ENGINE
            </div>
            <h2
              style={{
                fontSize: "clamp(26px, 3.5vw, 38px)",
                fontWeight: "800",
                lineHeight: 1.2,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em"
              }}
            >
              The right opportunities should find you.
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-secondary)", marginTop: "16px", lineHeight: 1.6 }}>
              Say goodbye to blind cold emails. The Lazarus Opportunity Engine matches your verified content niche, platform presence, and engagement metrics with tailored brand campaign briefs. Every recommendation features an explainable match score breaking down exactly why a sponsor is a high-yield fit.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Deterministic multi-attribute matching (niche, platform, scale, engagement).</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Transparent scoring rationale: no black-box sorting or pay-to-win ranking.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Pre-funded campaign budgets held in verified escrow milestones.</span>
              </div>
            </div>

            {/* Mobile preview block */}
            <div className="scroll-story-mobile-preview card">
              {renderPreviewCanvas(4)}
            </div>
          </div>

          {/* CHAPTER 5 */}
          <div ref={chapter5Ref} id="story-chapter-5" className="scroll-story-narrative-item">
            <div className="badge badge-amber" style={{ width: "fit-content", marginBottom: "16px" }}>
              CHAPTER 05 • COLLABORATION LIFECYCLE
            </div>
            <h2
              style={{
                fontSize: "clamp(26px, 3.5vw, 38px)",
                fontWeight: "800",
                lineHeight: 1.2,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em"
              }}
            >
              From discovery to collaboration.
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-secondary)", marginTop: "16px", lineHeight: 1.6 }}>
              Transform casual interest into binding brand partnerships. Manage the complete 8-stage collaboration lifecycle inside one collaborative workspace: from initial pitch application and terms negotiation to deliverable draft submission, timestamped revision notes, formal sign-off, and automated escrow release.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Structured 8-stage lifecycle with built-in accountability.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>In-app deliverable review loops with explicit sponsor revision notes.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Escrow state machine: funds are protected until deliverable is verified.</span>
              </div>
            </div>

            {/* Mobile preview block */}
            <div className="scroll-story-mobile-preview card">
              {renderPreviewCanvas(5)}
            </div>
          </div>

          {/* CHAPTER 6 */}
          <div ref={chapter6Ref} id="story-chapter-6" className="scroll-story-narrative-item">
            <div className="badge badge-green" style={{ width: "fit-content", marginBottom: "16px" }}>
              CHAPTER 06 • GET STARTED
            </div>
            <h2
              style={{
                fontSize: "clamp(26px, 3.5vw, 38px)",
                fontWeight: "800",
                lineHeight: 1.2,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em"
              }}
            >
              Build your creator business.<br />
              <span style={{ color: "var(--brand-primary)" }}>Not just your following.</span>
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-secondary)", marginTop: "16px", lineHeight: 1.6 }}>
              Stop letting fragmented tools and delayed payments eat into your creative output. Join Lazarus V3 to manage connected channels, unlock verified brand partnerships, and build lasting equity in your creator enterprise.
            </p>

            <div style={{ display: "flex", gap: "14px", marginTop: "28px", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/login?role=creator&mode=register")}
                className="btn-primary"
                style={{ padding: "14px 28px", fontSize: "15px" }}
              >
                Join as Creator <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("/login?role=brand&mode=register")}
                className="btn-secondary"
                style={{ padding: "14px 28px", fontSize: "15px" }}
              >
                Post Brand Brief
              </button>
            </div>

            {/* Mobile preview block */}
            <div className="scroll-story-mobile-preview card">
              {renderPreviewCanvas(6)}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------
            RIGHT COLUMN: STICKY PRODUCT PREVIEW STAGE (DESKTOP)
        --------------------------------------------------------- */}
        <div className="scroll-story-sticky-pane">
          <div className="scroll-story-preview-window">
            {/* Window Chrome Header */}
            <div className="scroll-story-preview-header">
              <div style={{ display: "flex", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10b981" }} />
              </div>

              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                LAZARUS V3 • INTERACTIVE STORY STAGE
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "var(--brand-primary)",
                    boxShadow: "0 0 8px var(--brand-glow)"
                  }}
                />
                <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--brand-primary)" }}>
                  CH 0{activeChapter}
                </span>
              </div>
            </div>

            {/* Window Chrome Body */}
            <div className="scroll-story-preview-body">
              {renderPreviewCanvas(activeChapter)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
