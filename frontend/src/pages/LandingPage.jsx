import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Video,
  Target,
  Sparkles,
  Layers,
  FileCheck,
  Users,
  Eye,
  Heart,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useTheme } from "../context/ThemeContext";
import InteractiveScrollStory from "../components/landing/InteractiveScrollStory";

const PREVIEW_CHART_DATA = [
  { day: "Mon", followers: 42100, views: 18200 },
  { day: "Tue", followers: 43400, views: 24500 },
  { day: "Wed", followers: 44800, views: 29800 },
  { day: "Thu", followers: 46200, views: 33400 },
  { day: "Fri", followers: 47500, views: 41200 },
  { day: "Sat", followers: 48500, views: 48900 }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div style={{ backgroundColor: "var(--bg-canvas)", color: "var(--text-primary)", minHeight: "100vh" }}>
      {/* =========================================================
          TOP NAVIGATION
      ========================================================== */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: isDark ? "rgba(9, 13, 22, 0.85)" : "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "0 32px",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 0 16px var(--brand-glow)"
            }}
          >
            <Zap size={20} />
          </div>
          <span style={{ fontSize: "19px", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            LAZARUS <span style={{ color: "var(--brand-primary)", fontSize: "12px", fontWeight: "800" }}>V3</span>
          </span>
        </div>

        {/* Center Nav Links */}
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }} className="desktop-links hide-on-mobile">
          <a href="#product-story" style={{ color: "var(--brand-primary)", fontSize: "14px", fontWeight: "700" }}>
            Product Story
          </a>
          <a href="#creator-studio" style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "600" }}>
            Creator Studio
          </a>
          <a href="#opportunity-engine" style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "600" }}>
            Opportunity Engine
          </a>
          <a href="#brand-network" style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "600" }}>
            For Brands
          </a>
          <a href="#integrations" style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "600" }}>
            Platform Integrations
          </a>
        </div>

        {/* Actions: Theme Toggle + Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ThemeToggle />
          <button
            onClick={() => navigate("/login")}
            className="btn-ghost"
            style={{ fontSize: "14px" }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/login?mode=register")}
            className="btn-primary"
            style={{ padding: "8px 18px", fontSize: "13px" }}
          >
            Get Started Free →
          </button>
        </div>
      </nav>

      {/* =========================================================
          HERO SECTION (TWO-COLUMN DESKTOP SAAS)
      ========================================================== */}
      <section style={{ padding: "72px 32px 80px", maxWidth: "1280px", margin: "0 auto" }}>
        <div
          className="hero-grid-responsive"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "56px",
            alignItems: "center"
          }}
        >
          {/* Left Column: Proposition & CTAs */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--brand-light)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "var(--brand-primary)",
                fontSize: "12px",
                fontWeight: "700",
                marginBottom: "24px"
              }}
            >
              <Sparkles size={14} />
              <span>THE CREATOR OPERATING SYSTEM & OPPORTUNITY NETWORK</span>
            </div>

            <h1
              style={{
                fontSize: "clamp(30px, 4.5vw, 48px)",
                fontWeight: "800",
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)"
              }}
            >
              Stop pitching with static PDFs.<br />
              <span
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, #34d399 0%, #10b981 50%, #38bdf8 100%)"
                    : "linear-gradient(135deg, #059669 0%, #047857 50%, #0284c7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                Run your creator business on live verified data.
              </span>
            </h1>

            <p
              style={{
                fontSize: "17px",
                color: "var(--text-secondary)",
                marginTop: "20px",
                lineHeight: 1.6,
                maxWidth: "560px"
              }}
            >
              Connect your official YouTube, Instagram, and Twitch channels. Lazarus in-gests verified metrics, compiles dynamic media kits, matches you with high-budget sponsor briefs, and executes 10-stage deliverable approvals.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "14px", marginTop: "32px", flexWrap: "wrap" }}>
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
                Launch Brand Campaign
              </button>
            </div>

            {/* Verified platform pills */}
            <div style={{ display: "flex", gap: "20px", marginTop: "36px", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Google OAuth & Data API v3</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Meta Graph API</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>
                <CheckCircle2 size={16} style={{ color: "var(--brand-primary)" }} />
                <span>Twitch Helix API</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Product Mockup Card */}
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-xl)",
              padding: "24px",
              position: "relative"
            }}
          >
            {/* Window chrome header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "16px",
                borderBottom: "1px solid var(--border-subtle)",
                marginBottom: "20px"
              }}
            >
              <div style={{ display: "flex", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10b981" }} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                LAZARUS STUDIO DASHBOARD PREVIEW
              </span>
              <span className="badge badge-green">Verified Live</span>
            </div>

            {/* Creator Profile Mini Row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--color-blue) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontWeight: "800",
                    fontSize: "16px"
                  }}
                >
                  AR
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>Alex Rivera</h4>
                    <span className="badge badge-blue">Tech & AI</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    @alexriveratech • YouTube & Instagram Verified
                  </span>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)" }}>VERIFIED AUDIENCE</span>
                <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--brand-primary)" }}>48,500</div>
              </div>
            </div>

            {/* Metric Chart Widget */}
            <div
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                border: "1px solid var(--border-subtle)",
                marginBottom: "16px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)" }}>
                  Audience Growth (Last 30 Days)
                </span>
                <span style={{ fontSize: "12px", color: "var(--brand-primary)", fontWeight: "700" }}>
                  +14.8% MoM
                </span>
              </div>
              <div style={{ width: "100%", height: 110 }}>
                <ResponsiveContainer>
                  <AreaChart data={PREVIEW_CHART_DATA}>
                    <defs>
                      <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDark ? "#10b981" : "#059669"} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={isDark ? "#10b981" : "#059669"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="followers"
                      stroke={isDark ? "#10b981" : "#059669"}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorFollowers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Matched Opportunity Callout */}
            <div
              style={{
                backgroundColor: "var(--bg-surface-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--color-blue)", letterSpacing: "0.04em" }}>
                  HIGH-COMPATIBILITY OPPORTUNITY
                </span>
                <h5 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", marginTop: "2px" }}>
                  AI Developer Copilot Q4 Review
                </h5>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                  Budget: ₹85,000 • 1x Dedicated Video
                </span>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--brand-primary)" }}>98%</div>
                <span style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)" }}>MATCH SCORE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOMEPAGE INTERACTIVE SCROLL STORY (CHAPTERS 1 - 6)
      ========================================================== */}
      <InteractiveScrollStory />

      {/* =========================================================
          FEATURE GRID: CREATOR STUDIO
      ========================================================== */}
      <section
        id="creator-studio"
        style={{
          padding: "80px 32px",
          backgroundColor: "var(--bg-subtle)",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)"
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--brand-primary)", letterSpacing: "0.06em" }}>
              CREATOR STUDIO WORKSPACE
            </span>
            <h2 style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-primary)", marginTop: "8px", letterSpacing: "-0.02em" }}>
              Everything creators need to monetize and scale
            </h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "12px", fontSize: "16px", maxWidth: "640px", margin: "12px auto 0" }}>
              Built for serious professional creators tired of fragmented tools, manual spreadsheets, and unverified deal pitches.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
            {/* Card 1 */}
            <div className="card">
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "var(--brand-light)", color: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                <TrendingUp size={22} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
                Unified Verified Analytics
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Continuous synchronization of real audience growth, watch time, and authentic engagement rates across YouTube, Instagram, and Twitch.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card">
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "var(--color-blue-light)", color: "var(--color-blue)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                <FileCheck size={22} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
                Automated Creator Media Kit
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Shareable public portfolios compiled dynamically from verified API data. Showcase top content, audience demographics, and fulfilled brand partnerships.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card">
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "var(--color-purple-light)", color: "var(--color-purple)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                <Target size={22} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
                Explainable Opportunity Matching
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Deterministic matching engine ranking brand campaigns on niche alignment, platform requirements, audience reach, and engagement benchmarks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION: BRAND NETWORK & COLLABORATION LIFECYCLE
      ========================================================== */}
      <section id="brand-network" style={{ padding: "88px 32px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-blue)", letterSpacing: "0.06em" }}>
              ENTERPRISE BRAND NETWORK
            </span>
            <h2 style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-primary)", marginTop: "8px", letterSpacing: "-0.02em" }}>
              Hire creators backed by real numbers, not inflated vanity metrics.
            </h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "16px", fontSize: "16px", lineHeight: 1.6 }}>
              Brands publish targeted campaign briefs, discover creators through multi-attribute filters, evaluate authentic media kits, and manage collaborations from initial pitch to final deliverable approval.
            </p>

            <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <CheckCircle2 size={18} style={{ color: "var(--brand-primary)", marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  <strong>Targeted Briefs:</strong> Define required platforms, minimum follower tiers, and specific deliverable schedules.
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <CheckCircle2 size={18} style={{ color: "var(--brand-primary)", marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  <strong>10-Stage Deal Room:</strong> Built-in review cycles, written revision notes, and definitive deliverable sign-offs.
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <CheckCircle2 size={18} style={{ color: "var(--brand-primary)", marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  <strong>Audit-Trail Security:</strong> Resource ownership validation and anti-tampering state transitions on all agreements.
                </span>
              </div>
            </div>

            <div style={{ marginTop: "32px" }}>
              <button onClick={() => navigate("/login?role=brand&mode=register")} className="btn-primary">
                Explore Brand Studio →
              </button>
            </div>
          </div>

          {/* Stepper Preview Box */}
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xl)",
              padding: "32px",
              boxShadow: "var(--shadow-lg)"
            }}
          >
            <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "20px" }}>
              10-Stage Collaboration Deal Lifecycle
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { stage: "1. Discovered & Applied", desc: "Creator applies with pitch and deliverable plan" },
                { stage: "2. Shortlisted & Negotiation", desc: "Brand reviews pitch and confirms commercial terms" },
                { stage: "3. In Progress & Delivery", desc: "Creator uploads unlisted video/post link for review" },
                { stage: "4. Review & Revision Notes", desc: "Brand inspects asset and requests revisions if required" },
                { stage: "5. Approved & Completed", desc: "Fulfillment confirmed with audit log verification" }
              ].map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-subtle)",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "var(--brand-light)",
                      color: "var(--brand-primary)",
                      fontSize: "12px",
                      fontWeight: "800",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    ✓
                  </span>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>{s.stage}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION: PLATFORM INTEGRATIONS
      ========================================================== */}
      <section
        id="integrations"
        style={{
          padding: "80px 32px",
          backgroundColor: "var(--bg-subtle)",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)"
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--brand-primary)", letterSpacing: "0.06em" }}>
            AUTHENTIC PLATFORM CONNECTORS
          </span>
          <h2 style={{ fontSize: "32px", fontWeight: "800", color: "var(--text-primary)", marginTop: "8px" }}>
            Direct Authorization with Official APIs
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "15px" }}>
            All OAuth tokens are securely encrypted server-side using AES-256-GCM authenticated ciphers.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginTop: "44px" }}>
            <div className="card" style={{ textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "24px" }}>▶️</span>
                <span className="badge badge-green">Production API</span>
              </div>
              <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>YouTube Data API v3</h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.5 }}>
                Authorizes channel identification, video uploads playlist, lifetime view counts, and video metrics.
              </p>
            </div>

            <div className="card" style={{ textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "24px" }}>📸</span>
                <span className="badge badge-blue">Graph API</span>
              </div>
              <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>Instagram Meta Graph API</h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.5 }}>
                Authorizes professional Creator/Business accounts, recent reels/posts, and authentic interaction rates.
              </p>
            </div>

            <div className="card" style={{ textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "24px" }}>🟣</span>
                <span className="badge badge-purple">Helix API</span>
              </div>
              <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>Twitch Helix API</h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.5 }}>
                Authorizes broadcaster profile details, follower counts, and video-on-demand playback statistics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CALL TO ACTION
      ========================================================== */}
      <section style={{ padding: "100px 32px", textAlign: "center", maxWidth: "860px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "40px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Ready to run your creator business with confidence?
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "17px", marginTop: "16px", lineHeight: 1.6 }}>
          Join Lazarus V3 today. Connect your real social media accounts, discover high-paying brand deals, and get paid with structured contract milestones.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "36px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/login?mode=register")}
            className="btn-primary"
            style={{ padding: "14px 32px", fontSize: "16px" }}
          >
            Create Your Account Free →
          </button>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "48px 32px",
          backgroundColor: "var(--bg-surface)",
          fontSize: "13px",
          color: "var(--text-muted)"
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
              <Zap size={14} />
            </div>
            <strong style={{ color: "var(--text-primary)" }}>LAZARUS V3</strong>
            <span>• Creator Studio & Opportunity Network</span>
          </div>

          <div>
            Built with React 19, Express 5, & Hosted Neon PostgreSQL 18.7.
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            <span style={{ color: "var(--text-muted)" }}>© 2026 Lazarus Technologies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
