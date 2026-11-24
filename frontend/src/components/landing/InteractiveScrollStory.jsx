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
  RotateCw,
  FolderOpen,
  Calendar,
  Play,
  Sliders,
  CheckCheck
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts";
import { useTheme } from "../../context/ThemeContext";

// Illustrative preview dataset for Chapter 3
const STUDIO_GROWTH_DATA = [
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
  const [activeWorkflowStage, setActiveWorkflowStage] = useState(6); // Default on Stage 6 (Revision)
  const [radialProgress, setRadialProgress] = useState(0);

  // Chapter narrative container refs for intersection observing
  const ch1Ref = useRef(null);
  const ch2Ref = useRef(null);
  const ch3Ref = useRef(null);
  const ch4Ref = useRef(null);
  const ch5Ref = useRef(null);
  const ch6Ref = useRef(null);

  // Trigger radial gauge count-up when Chapter 4 becomes active
  useEffect(() => {
    if (activeChapter === 4) {
      setRadialProgress(0);
      const timer = setTimeout(() => {
        setRadialProgress(96);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeChapter]);

  // Setup robust IntersectionObserver to detect the active chapter naturally
  useEffect(() => {
    const chapterMap = [
      { id: 1, ref: ch1Ref },
      { id: 2, ref: ch2Ref },
      { id: 3, ref: ch3Ref },
      { id: 4, ref: ch4Ref },
      { id: 5, ref: ch5Ref },
      { id: 6, ref: ch6Ref }
    ];

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -35% 0px", // Trigger when narrative is comfortably in center viewport
      threshold: [0.1, 0.3, 0.6]
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const match = chapterMap.find((c) => c.ref.current === entry.target);
          if (match) {
            setActiveChapter(match.id);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    chapterMap.forEach(({ ref }) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToChapter = (num) => {
    setActiveChapter(num);
    const targetMap = {
      1: ch1Ref,
      2: ch2Ref,
      3: ch3Ref,
      4: ch4Ref,
      5: ch5Ref,
      6: ch6Ref
    };
    const target = targetMap[num];
    if (target && target.current) {
      target.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // =========================================================
  // SCENE RENDERERS (Each chapter has a dedicated composition)
  // =========================================================

  // Scene 1: Fragmented Ecosystem (Chaotic, floating, unorganized tools)
  const renderScene1 = () => (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {/* Top Banner Alert */}
      <div
        style={{
          backgroundColor: isDark ? "rgba(239, 68, 68, 0.12)" : "rgba(220, 38, 38, 0.08)",
          border: "1px solid rgba(239, 68, 68, 0.28)",
          borderRadius: "var(--radius-md)",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0
        }}
      >
        <AlertTriangle size={18} style={{ color: "var(--color-red)", flexShrink: 0 }} />
        <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
          <strong style={{ color: "var(--text-primary)" }}>Status Quo Friction:</strong> Scattered across 6+ tabs with zero verified connection.
        </div>
      </div>

      {/* Scattered Multi-Card Canvas Area */}
      <div style={{ position: "relative", flex: 1, minHeight: "360px", margin: "16px 0" }}>
        {/* Element 1: Stale PDF Media Kit */}
        <div
          className="animate-float-1"
          style={{
            position: "absolute",
            top: "8px",
            left: "12px",
            width: "210px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "12px",
            boxShadow: "var(--shadow-md)",
            transform: "rotate(-3.5deg)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FileText size={14} style={{ color: "var(--color-amber)" }} />
              <span style={{ fontSize: "11px", fontWeight: "700" }}>MediaKit_2023.pdf</span>
            </div>
            <span className="badge badge-amber" style={{ fontSize: "9px" }}>Stale (9m)</span>
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            Followers: ~40,000 (manual text)<br />
            Avg Views: 15k (unverified claim)
          </div>
        </div>

        {/* Element 2: Unstructured Brand DM */}
        <div
          className="animate-float-2"
          style={{
            position: "absolute",
            top: "24px",
            right: "12px",
            width: "215px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "12px",
            boxShadow: "var(--shadow-md)",
            transform: "rotate(2.5deg)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <MessageSquare size={14} style={{ color: "var(--color-blue)" }} />
            <span style={{ fontSize: "11px", fontWeight: "700" }}>Direct Message</span>
          </div>
          <p style={{ fontSize: "10px", color: "var(--text-secondary)", fontStyle: "italic", margin: 0, lineHeight: 1.3 }}>
            "Hey Alex! Do you take sponsors? Send your commercial rate deck to our generic Gmail inbox ASAP."
          </p>
        </div>

        {/* Element 3: Isolated YouTube Studio Tab */}
        <div
          className="animate-float-1"
          style={{
            position: "absolute",
            top: "140px",
            left: "20px",
            width: "200px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "12px",
            boxShadow: "var(--shadow-md)",
            transform: "rotate(1.8deg)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Video size={14} style={{ color: "var(--color-red)" }} />
            <span style={{ fontSize: "11px", fontWeight: "700" }}>YouTube Studio</span>
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            Siloed metrics • No combined cross-platform audience reach
          </div>
        </div>

        {/* Element 4: Manual Deal Spreadsheet Invoice */}
        <div
          className="animate-float-2"
          style={{
            position: "absolute",
            top: "160px",
            right: "18px",
            width: "220px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "12px",
            boxShadow: "var(--shadow-md)",
            transform: "rotate(-2deg)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <DollarSign size={14} style={{ color: "var(--color-red)" }} />
              <span style={{ fontSize: "11px", fontWeight: "700" }}>Invoice #04</span>
            </div>
            <span className="badge badge-red" style={{ fontSize: "9px" }}>45 Days Late</span>
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            ₹45,000 pending • Proof of deliverable lost in email thread
          </div>
        </div>

        {/* Element 5: Calendar Reminder */}
        <div
          className="animate-float-1"
          style={{
            position: "absolute",
            bottom: "8px",
            left: "35px",
            width: "190px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "10px 12px",
            boxShadow: "var(--shadow-sm)",
            transform: "rotate(-1.5deg)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <Calendar size={13} style={{ color: "var(--color-purple)" }} />
            <span style={{ fontSize: "10px", fontWeight: "700" }}>Sponsor Deadline</span>
          </div>
          <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>
            Draft due tomorrow • Contract signed via email?
          </div>
        </div>

        {/* Element 6: Disconnected Cloud Assets */}
        <div
          className="animate-float-2"
          style={{
            position: "absolute",
            bottom: "12px",
            right: "30px",
            width: "190px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "10px 12px",
            boxShadow: "var(--shadow-sm)",
            transform: "rotate(2deg)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <FolderOpen size={13} style={{ color: "var(--brand-primary)" }} />
            <span style={{ fontSize: "10px", fontWeight: "700" }}>Drive Assets</span>
          </div>
          <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>
            120GB raw video clips • No asset review loop
          </div>
        </div>
      </div>

      {/* Illustrative Scenario Footnote */}
      <div
        style={{
          backgroundColor: "var(--bg-surface-raised)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0
        }}
      >
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
          Illustrative creator-workflow scenario
        </span>
        <button
          onClick={() => scrollToChapter(2)}
          className="btn-ghost"
          style={{ padding: "4px 8px", fontSize: "11px", color: "var(--brand-primary)" }}
        >
          Scroll to converge →
        </button>
      </div>
    </div>
  );

  // Scene 2: Connect the Ecosystem (The Central Lazarus Integration Nexus)
  const renderScene2 = () => (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
            Lazarus Integration Nexus
          </h4>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Official platform connectors streaming into one encrypted pipeline
          </span>
        </div>
        <span className="badge badge-green">Topology Active</span>
      </div>

      {/* Central SVG Network Topology Diagram */}
      <div style={{ position: "relative", flex: 1, minHeight: "360px", margin: "10px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* SVG Bezier Connection Lines */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          viewBox="0 0 500 360"
        >
          {/* Curve from YouTube (top-left) to Center (250, 180) */}
          <path
            d="M 120 70 Q 180 130 250 180"
            fill="none"
            stroke="var(--color-red)"
            strokeWidth="2.5"
            strokeOpacity="0.6"
            className="svg-data-path"
          />
          {/* Curve from Instagram (top-right) to Center */}
          <path
            d="M 380 70 Q 320 130 250 180"
            fill="none"
            stroke="var(--color-blue)"
            strokeWidth="2.5"
            strokeOpacity="0.6"
            className="svg-data-path"
          />
          {/* Curve from Twitch (bottom) to Center */}
          <path
            d="M 250 310 Q 250 250 250 180"
            fill="none"
            stroke="var(--color-purple)"
            strokeWidth="2.5"
            strokeOpacity="0.6"
            className="svg-data-path"
          />
        </svg>

        {/* Central Lazarus Hub Node */}
        <div
          className="animate-pulse-hub"
          style={{
            position: "absolute",
            width: "124px",
            height: "124px",
            borderRadius: "50%",
            backgroundColor: "var(--bg-surface)",
            border: "2px solid var(--brand-primary)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            boxShadow: "0 0 24px var(--brand-glow)"
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "var(--brand-primary)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "4px"
            }}
          >
            <Sparkles size={18} />
          </div>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            LAZARUS HUB
          </span>
          <span style={{ fontSize: "9px", color: "var(--brand-primary)", fontWeight: "700" }}>
            PIPELINE READY
          </span>
        </div>

        {/* Node 1: YouTube Card (Top-Left) */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "15px",
            width: "175px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "10px 12px",
            boxShadow: "var(--shadow-md)",
            zIndex: 5
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Video size={15} style={{ color: "var(--color-red)" }} />
              <strong style={{ fontSize: "11px" }}>YouTube API</strong>
            </div>
            <span className="badge badge-green" style={{ fontSize: "8px" }}>Active</span>
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            Google OAuth 2.0 • 48.5K Subs
          </div>
        </div>

        {/* Node 2: Instagram Meta Graph Card (Top-Right) */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "15px",
            width: "175px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "10px 12px",
            boxShadow: "var(--shadow-md)",
            zIndex: 5
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Film size={15} style={{ color: "var(--color-blue)" }} />
              <strong style={{ fontSize: "11px" }}>Instagram Meta</strong>
            </div>
            <span className="badge badge-amber" style={{ fontSize: "8px" }}>In Review</span>
          </div>
          <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>
            Sandbox mode active for test users
          </div>
        </div>

        {/* Node 3: Twitch Helix Card (Bottom) */}
        <div
          style={{
            position: "absolute",
            bottom: "15px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "190px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "10px 12px",
            boxShadow: "var(--shadow-md)",
            zIndex: 5
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Tv size={15} style={{ color: "var(--color-purple)" }} />
              <strong style={{ fontSize: "11px" }}>Twitch Helix API</strong>
            </div>
            <span className="badge badge-purple" style={{ fontSize: "8px" }}>Connected</span>
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "center" }}>
            Broadcaster VOD metrics synced
          </div>
        </div>
      </div>

      {/* Encryption & Disclosure Notice */}
      <div
        style={{
          backgroundColor: isDark ? "rgba(16, 185, 129, 0.08)" : "rgba(5, 150, 105, 0.06)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          borderRadius: "var(--radius-md)",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0
        }}
      >
        <Lock size={16} style={{ color: "var(--brand-primary)", flexShrink: 0 }} />
        <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.35 }}>
          <strong>AES-256-GCM Vault Isolation:</strong> Tokens encrypted server-side with hardware-randomized 96-bit IVs. <em>Illustrative connector topology.</em>
        </p>
      </div>
    </div>
  );

  // Scene 3: Creator Studio (The Intelligence Dashboard)
  const renderScene3 = () => (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {/* Studio Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--color-blue) 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "13px"
            }}
          >
            AR
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>Alex Rivera</span>
              <span className="badge badge-green" style={{ fontSize: "9px" }}>YouTube Verified</span>
            </div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>@alexriveratech • Tech & AI</span>
          </div>
        </div>

        <span className="badge badge-blue" style={{ fontSize: "10px" }}>
          Illustrative Studio Preview
        </span>
      </div>

      {/* 4 KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", margin: "14px 0 10px" }}>
        <div className="stat-card" style={{ padding: "12px" }}>
          <span className="stat-label">Verified Audience</span>
          <div className="stat-value" style={{ fontSize: "20px" }}>48,500</div>
          <span style={{ fontSize: "11px", color: "var(--brand-primary)", fontWeight: "700" }}>
            +14.8% 30d Growth
          </span>
        </div>

        <div className="stat-card" style={{ padding: "12px" }}>
          <span className="stat-label">Engagement Rate</span>
          <div className="stat-value" style={{ fontSize: "20px" }}>7.07%</div>
          <span style={{ fontSize: "11px", color: "var(--color-blue)", fontWeight: "600" }}>
            Live Ingestion Benchmark
          </span>
        </div>
      </div>

      {/* Growth Trend Area Chart */}
      <div
        style={{
          backgroundColor: "var(--bg-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "10px 12px",
          border: "1px solid var(--border-subtle)",
          marginBottom: "10px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>
            Cross-Channel Reach Trajectory (30-Day Window)
          </span>
          <span style={{ fontSize: "10px", color: "var(--brand-primary)", fontWeight: "700" }}>
            Verified
          </span>
        </div>
        <div style={{ width: "100%", height: 85 }}>
          <ResponsiveContainer>
            <AreaChart data={STUDIO_GROWTH_DATA}>
              <defs>
                <linearGradient id="colorStory3" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#colorStory3)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Content Showcase Snippet */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
        <div
          style={{
            backgroundColor: "var(--bg-surface-raised)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 10px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Video size={16} style={{ color: "var(--color-red)", flexShrink: 0 }} />
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Next-Gen AI Workflows
            </div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>38.4K views • 8.2% CTR</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "var(--bg-surface-raised)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 10px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Film size={16} style={{ color: "var(--color-blue)", flexShrink: 0 }} />
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Full-Stack Dev in 2026
            </div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>46.1K views • 9.1% Eng</div>
          </div>
        </div>
      </div>

      {/* Dynamic Media Kit Bar */}
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileCheck2 size={16} style={{ color: "var(--brand-primary)" }} />
          <div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>Dynamic Media Kit Active</span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "8px", fontFamily: "var(--font-mono)" }}>
              lazarus.app/kit/alexrivera
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate("/kit/alexrivera")}
          className="btn-ghost"
          style={{ fontSize: "11px", padding: "4px 8px", display: "flex", alignItems: "center", gap: "4px" }}
        >
          <span>Preview</span> <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );

  // Scene 4: Opportunity Matching (The Match Engine & Transparent Rationale)
  const renderScene4 = () => (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {/* Opportunity Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-blue)", letterSpacing: "0.04em" }}>
            EXPLAINABLE OPPORTUNITY ENGINE
          </span>
          <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
            Matched Campaign Brief
          </h4>
        </div>
        <span className="badge badge-green">High Compatibility</span>
      </div>

      {/* Centerpiece: Split Card with Radial Compatibility Gauge */}
      <div
        style={{
          backgroundColor: "var(--bg-surface-raised)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "16px",
          margin: "12px 0"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <span className="badge badge-purple" style={{ fontSize: "10px", marginBottom: "4px" }}>
              ENTERPRISE SPONSORSHIP
            </span>
            <h5 style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-primary)", margin: "2px 0" }}>
              AI Developer Copilot Q4 Review
            </h5>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Sponsor: <strong>Nexus AI Cloud</strong> • Budget: ₹85,000 (Milestone Escrow)
            </span>
          </div>

          {/* Animated Radial SVG Match Gauge */}
          <div style={{ position: "relative", width: "72px", height: "72px", flexShrink: 0 }}>
            <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--brand-primary)"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * (radialProgress || 96)) / 100}
                strokeLinecap="round"
                className="gauge-progress-ring"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <span style={{ fontSize: "17px", fontWeight: "800", color: "var(--brand-primary)", lineHeight: 1 }}>
                {radialProgress || 96}%
              </span>
              <span style={{ fontSize: "8px", fontWeight: "700", color: "var(--text-muted)" }}>
                MATCH
              </span>
            </div>
          </div>
        </div>

        {/* 4 Dimension Compatibility Breakdown Bars */}
        <div
          style={{
            backgroundColor: "var(--bg-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "12px",
            border: "1px solid var(--border-subtle)"
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "8px" }}>
            EXPLAINABLE MATCHING DIMENSIONS:
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Dimension 1 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "2px" }}>
                <span style={{ color: "var(--text-secondary)" }}>• Tech & AI Niche Alignment</span>
                <strong style={{ color: "var(--brand-primary)" }}>100% Fit (+40%)</strong>
              </div>
              <div style={{ width: "100%", height: "5px", backgroundColor: "var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", backgroundColor: "var(--brand-primary)" }} />
              </div>
            </div>

            {/* Dimension 2 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "2px" }}>
                <span style={{ color: "var(--text-secondary)" }}>• Verified YouTube Channel Reach (48.5K)</span>
                <strong style={{ color: "var(--brand-primary)" }}>95% Fit (+30%)</strong>
              </div>
              <div style={{ width: "100%", height: "5px", backgroundColor: "var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "95%", height: "100%", backgroundColor: "var(--brand-primary)" }} />
              </div>
            </div>

            {/* Dimension 3 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "2px" }}>
                <span style={{ color: "var(--text-secondary)" }}>• Authentic Engagement (7.07% vs 4.5% min)</span>
                <strong style={{ color: "var(--brand-primary)" }}>92% Fit (+15%)</strong>
              </div>
              <div style={{ width: "100%", height: "5px", backgroundColor: "var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "92%", height: "100%", backgroundColor: "var(--brand-primary)" }} />
              </div>
            </div>

            {/* Dimension 4 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "2px" }}>
                <span style={{ color: "var(--text-secondary)" }}>• Historical On-Time Deliverable Record</span>
                <strong style={{ color: "var(--brand-primary)" }}>98% Fit (+11%)</strong>
              </div>
              <div style={{ width: "100%", height: "5px", backgroundColor: "var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "98%", height: "100%", backgroundColor: "var(--brand-primary)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Transparent Rationale Box */}
        <p
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            fontStyle: "italic",
            marginTop: "10px",
            lineHeight: 1.4,
            margin: "10px 0 0"
          }}
        >
          "Why this fits: You produce verified coding tutorials, and Nexus AI requires technical creator authority to reach software developers."
        </p>
      </div>

      {/* Illustrative Footnote */}
      <div style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "center", flexShrink: 0 }}>
        Illustrative match engine demonstration • Deterministic scoring based on creator metadata
      </div>
    </div>
  );

  // Scene 5: Collaboration Workspace (The 9-Stage Deal Room & Deliverable Revisions)
  const renderScene5 = () => (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {/* Workspace Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
            Collaboration Deal Room
          </h4>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Nexus AI Copilot • Deliverable #1 Workflow
          </span>
        </div>
        <span className="badge badge-amber">Stage 6: Revisions</span>
      </div>

      {/* 9-Stage Animated Interactive Stepper */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "4px",
          backgroundColor: "var(--bg-subtle)",
          padding: "8px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          margin: "10px 0"
        }}
      >
        {[
          { id: 1, name: "1. Apply" },
          { id: 2, name: "2. Shortlist" },
          { id: 3, name: "3. Terms" },
          { id: 4, name: "4. Agree" },
          { id: 5, name: "5. In Prog" },
          { id: 6, name: "6. Submit" },
          { id: 7, name: "7. Revision" },
          { id: 8, name: "8. Approve" },
          { id: 9, name: "9. Complete" }
        ].map((step) => {
          const isActive = activeWorkflowStage === step.id;
          const isPassed = step.id < activeWorkflowStage;
          return (
            <button
              key={step.id}
              onClick={() => setActiveWorkflowStage(step.id)}
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

      {/* Deliverable Review & Revision Card */}
      <div
        style={{
          backgroundColor: "var(--bg-surface-raised)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "14px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Video size={16} style={{ color: "var(--brand-primary)" }} />
              <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                Draft v2: "Building Next-Gen Full-Stack Apps"
              </strong>
            </div>
            <span className="badge badge-purple" style={{ fontSize: "9px" }}>
              Unlisted YouTube Link
            </span>
          </div>

          {/* Video Player Scrubber Mockup */}
          <div
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 10px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px"
            }}
          >
            <Play size={14} style={{ color: "var(--brand-primary)" }} />
            <div style={{ flex: 1, height: "4px", backgroundColor: "var(--border-subtle)", borderRadius: "2px", position: "relative" }}>
              <div style={{ width: "35%", height: "100%", backgroundColor: "var(--brand-primary)" }} />
              {/* Timestamp pin for revision */}
              <div
                style={{
                  position: "absolute",
                  left: "35%",
                  top: "-4px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-amber)",
                  border: "2px solid #ffffff"
                }}
              />
            </div>
            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              02:45 / 12:48
            </span>
          </div>

          {/* Sponsor Timestamped Revision Note */}
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderLeft: "3px solid var(--color-amber)",
              padding: "10px 12px",
              borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
              fontSize: "11px",
              color: "var(--text-secondary)",
              lineHeight: 1.4
            }}
          >
            <strong style={{ color: "var(--text-primary)" }}>Nexus AI Brand Reviewer (Timestamp 02:45):</strong><br />
            "The benchmark code walk-through is crisp! Please boost the microphone volume during the terminal live-coding demo (02:45 - 03:40) before final approval."
          </div>
        </div>

        {/* Milestone Guarantee Status */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "10px",
            borderTop: "1px solid var(--border-subtle)",
            marginTop: "10px"
          }}
        >
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            Simulated Milestone: ₹85,000 Locked in State Machine
          </span>
          <span className="badge badge-green" style={{ fontSize: "9px" }}>
            Release Upon Stage 8 Sign-off
          </span>
        </div>
      </div>

      {/* Escrow Disclaimer Footnote */}
      <div style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "center", marginTop: "6px", flexShrink: 0 }}>
        Simulated milestone workflow demonstration • Governed by deterministic state machine
      </div>
    </div>
  );

  // Scene 6: Launch (The Complete Ecosystem & Final Dual Action)
  const renderScene6 = () => (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {/* Ecosystem Title */}
      <div style={{ textAlign: "center", flexShrink: 0 }}>
        <span className="badge badge-green" style={{ marginBottom: "6px", fontSize: "10px" }}>
          THE COMPLETE PLATFORM
        </span>
        <h4 style={{ fontSize: "17px", fontWeight: "800", color: "var(--text-primary)", margin: "2px 0" }}>
          Lazarus Creator OS In Full Motion
        </h4>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          Four interconnected engines transforming your creative business
        </span>
      </div>

      {/* 4 Connected Engine Mini-Tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", margin: "10px 0" }}>
        <div style={{ backgroundColor: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <TrendingUp size={14} style={{ color: "var(--brand-primary)" }} />
            <strong style={{ fontSize: "12px" }}>Creator Studio</strong>
          </div>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Unified live analytics & dynamic media kits</span>
        </div>

        <div style={{ backgroundColor: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <Target size={14} style={{ color: "var(--color-blue)" }} />
            <strong style={{ fontSize: "12px" }}>Opportunity Engine</strong>
          </div>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Deterministic compatibility & explainable match scores</span>
        </div>

        <div style={{ backgroundColor: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <Layers size={14} style={{ color: "var(--color-purple)" }} />
            <strong style={{ fontSize: "12px" }}>Collaboration Deal Room</strong>
          </div>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>9-stage deliverable approvals & revision notes</span>
        </div>

        <div style={{ backgroundColor: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <ShieldCheck size={14} style={{ color: "var(--brand-primary)" }} />
            <strong style={{ fontSize: "12px" }}>Milestone Engine</strong>
          </div>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Audit-trailed deliverables & release protocols</span>
        </div>
      </div>

      {/* Dual Registration Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", flexShrink: 0 }}>
        {/* Creator CTA */}
        <div
          style={{
            backgroundColor: "var(--bg-surface-raised)",
            border: "1px solid var(--brand-primary)",
            borderRadius: "var(--radius-md)",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <span className="badge badge-green" style={{ fontSize: "9px" }}>FOR CREATORS</span>
            <div style={{ fontSize: "12px", fontWeight: "700", marginTop: "4px" }}>Build Your Media Kit</div>
          </div>
          <button
            onClick={() => navigate("/login?role=creator&mode=register")}
            className="btn-primary"
            style={{ width: "100%", marginTop: "10px", fontSize: "11px", padding: "7px 10px" }}
          >
            Join as Creator →
          </button>
        </div>

        {/* Brand CTA */}
        <div
          style={{
            backgroundColor: "var(--bg-surface-raised)",
            border: "1px solid var(--color-blue)",
            borderRadius: "var(--radius-md)",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <span className="badge badge-blue" style={{ fontSize: "9px" }}>FOR BRANDS</span>
            <div style={{ fontSize: "12px", fontWeight: "700", marginTop: "4px" }}>Publish Campaign Brief</div>
          </div>
          <button
            onClick={() => navigate("/login?role=brand&mode=register")}
            className="btn-secondary"
            style={{ width: "100%", marginTop: "10px", fontSize: "11px", padding: "7px 10px" }}
          >
            Post Brand Brief →
          </button>
        </div>
      </div>

      {/* Trust Badges */}
      <div style={{ display: "flex", justifyContent: "center", gap: "14px", fontSize: "10px", color: "var(--text-muted)", flexShrink: 0, marginTop: "6px" }}>
        <span>✓ Zero credit card required</span>
        <span>✓ AES-256-GCM token encryption</span>
        <span>✓ Official API standards</span>
      </div>
    </div>
  );

  return (
    <section className="scroll-story-container" id="product-story">
      {/* =========================================================
          STICKY CHAPTER PROGRESS RAIL (SYNCS WITH SCROLL)
      ========================================================== */}
      <nav
        className="scroll-story-progress-rail"
        aria-label="Story chapter navigation"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--brand-primary)", letterSpacing: "0.04em" }}>
            CHAPTER 0{activeChapter} / 06
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>•</span>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
            {activeChapter === 1 && "The Fragmented Creator Ecosystem"}
            {activeChapter === 2 && "Connect Your Ecosystem"}
            {activeChapter === 3 && "Understand Your Business"}
            {activeChapter === 4 && "Discover Opportunities"}
            {activeChapter === 5 && "From Discovery to Collaboration"}
            {activeChapter === 6 && "Build Your Creator Business"}
          </span>
        </div>

        {/* Interactive Smooth-Scroll Chapter Pills */}
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
              aria-label={`Jump to Chapter ${pill.num}`}
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
          <div ref={ch1Ref} id="story-chapter-1" className="scroll-story-narrative-item">
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
              Creators run modern multi-channel media businesses, yet operations are scattered across separate browser tabs: unverified PDF media kits that go stale in weeks, siloed analytics dashboards, unorganized brand email pitches, and invoice reminders lost in direct messages.
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
                <span>Chasing overdue invoice payments across chaotic direct messages.</span>
              </div>
            </div>

            {/* Mobile preview block */}
            <div className="scroll-story-mobile-preview card">
              {renderScene1()}
            </div>
          </div>

          {/* CHAPTER 2 */}
          <div ref={ch2Ref} id="story-chapter-2" className="scroll-story-narrative-item">
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
              Connect your channels through official platform APIs. Lazarus unifies disparate data contracts into a single continuous stream while encrypting all sensitive access tokens server-side using AES-256-GCM authenticated ciphers.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Google OAuth 2.0 & YouTube Data API v3 connector.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Meta Graph API (with transparent Sandbox / App Review state).</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Twitch Helix API for broadcaster VOD playback and live statistics.</span>
              </div>
            </div>

            {/* Mobile preview block */}
            <div className="scroll-story-mobile-preview card">
              {renderScene2()}
            </div>
          </div>

          {/* CHAPTER 3 */}
          <div ref={ch3Ref} id="story-chapter-3" className="scroll-story-narrative-item">
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
              {renderScene3()}
            </div>
          </div>

          {/* CHAPTER 4 */}
          <div ref={ch4Ref} id="story-chapter-4" className="scroll-story-narrative-item">
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
              {renderScene4()}
            </div>
          </div>

          {/* CHAPTER 5 */}
          <div ref={ch5Ref} id="story-chapter-5" className="scroll-story-narrative-item">
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
              Transform casual interest into structured brand partnerships. Manage the complete 9-stage collaboration lifecycle inside one collaborative workspace: from initial application and commercial terms negotiation to draft deliverable submission, timestamped revision loops, formal brand approval, and milestone completion.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Structured 9-stage lifecycle with built-in accountability.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>In-app deliverable review loops with explicit sponsor revision notes.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Simulated milestone state machine protecting creator deliverables.</span>
              </div>
            </div>

            {/* Mobile preview block */}
            <div className="scroll-story-mobile-preview card">
              {renderScene5()}
            </div>
          </div>

          {/* CHAPTER 6 */}
          <div ref={ch6Ref} id="story-chapter-6" className="scroll-story-narrative-item">
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
              {renderScene6()}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------
            RIGHT COLUMN: STICKY CINEMATIC PRODUCT PREVIEW STAGE (DESKTOP)
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
                  SCENE 0{activeChapter}
                </span>
              </div>
            </div>

            {/* Persistent Viewport with Cross-Fading Scene Panels */}
            <div className="scroll-story-preview-body">
              <div className="story-stage-viewport">
                <div className={`story-scene-panel ${activeChapter === 1 ? "active" : ""}`}>
                  {renderScene1()}
                </div>
                <div className={`story-scene-panel ${activeChapter === 2 ? "active" : ""}`}>
                  {renderScene2()}
                </div>
                <div className={`story-scene-panel ${activeChapter === 3 ? "active" : ""}`}>
                  {renderScene3()}
                </div>
                <div className={`story-scene-panel ${activeChapter === 4 ? "active" : ""}`}>
                  {renderScene4()}
                </div>
                <div className={`story-scene-panel ${activeChapter === 5 ? "active" : ""}`}>
                  {renderScene5()}
                </div>
                <div className={`story-scene-panel ${activeChapter === 6 ? "active" : ""}`}>
                  {renderScene6()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
