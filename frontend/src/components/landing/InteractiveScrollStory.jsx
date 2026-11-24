import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Illustrative preview data
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeWorkflowStage, setActiveWorkflowStage] = useState(6); // Default on Stage 6 (Revision)

  // Master container & narrative section refs
  const storyContainerRef = useRef(null);
  const stageWindowRef = useRef(null);

  const ch1Ref = useRef(null);
  const ch2Ref = useRef(null);
  const ch3Ref = useRef(null);
  const ch4Ref = useRef(null);
  const ch5Ref = useRef(null);
  const ch6Ref = useRef(null);

  // Scene element refs for GSAP scrub control
  const fragLayerRef = useRef(null);
  const fragCardPdfRef = useRef(null);
  const fragCardDmRef = useRef(null);
  const fragCardYtRef = useRef(null);
  const fragCardSheetRef = useRef(null);
  const fragCardCalRef = useRef(null);
  const fragCardAssetsRef = useRef(null);

  const nexusLayerRef = useRef(null);
  const nexusHubRef = useRef(null);
  const nexusYtNodeRef = useRef(null);
  const nexusIgNodeRef = useRef(null);
  const nexusTwNodeRef = useRef(null);
  const nexusLinesRef = useRef(null);
  const nexusSecurityRef = useRef(null);

  const studioLayerRef = useRef(null);
  const studioKpisRef = useRef(null);
  const studioChartRef = useRef(null);
  const studioContentRef = useRef(null);
  const studioKitRef = useRef(null);

  const matchLayerRef = useRef(null);
  const matchCreatorRef = useRef(null);
  const matchBriefRef = useRef(null);
  const matchGaugeCircleRef = useRef(null);
  const matchBar1Ref = useRef(null);
  const matchBar2Ref = useRef(null);
  const matchBar3Ref = useRef(null);
  const matchBar4Ref = useRef(null);
  const matchRationaleRef = useRef(null);

  const collabLayerRef = useRef(null);
  const collabTimelineBarRef = useRef(null);
  const collabDraftCardRef = useRef(null);
  const collabScrubberPinRef = useRef(null);
  const collabFeedbackRef = useRef(null);
  const collabMilestoneRef = useRef(null);

  const launchLayerRef = useRef(null);
  const launchEnginesRef = useRef(null);
  const launchCtaRef = useRef(null);

  // Setup GSAP ScrollTrigger with continuous timeline scrubbing
  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Only enable GSAP scrub on desktop (viewport >= 992px)
    if (typeof window === "undefined" || window.innerWidth < 992 || prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      // Master 100-unit timeline scrubbed continuously by page scroll
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: storyContainerRef.current,
          start: "top top+=140",
          end: "bottom bottom",
          scrub: 0.6, // Smooth, continuous scrubbed interpolation
          onUpdate: (self) => {
            const p = self.progress;
            setScrollProgress(p);
            // Calculate active chapter dynamically across 6 equal segments
            const ch = Math.min(6, Math.max(1, Math.floor(p * 5.99) + 1));
            setActiveChapter(ch);
          }
        }
      });

      // =======================================================
      // MASTER 100-UNIT SCRUBBED PRODUCT TIMELINE
      // Total duration = 100 units. Deterministic keyframe segments:
      // Ch1: 0 - 12 (drift) -> 12 - 16.5 (converge into nexus)
      // Ch2: 16.5 - 28 (hub active) -> 28 - 32.5 (expand into studio)
      // Ch3: 32.5 - 45 (studio active) -> 45 - 49.5 (morph into match)
      // Ch4: 49.5 - 61 (match engine active) -> 61 - 65.5 (morph into deal room)
      // Ch5: 65.5 - 78 (deal room active) -> 78 - 82.5 (resolve into ecosystem)
      // Ch6: 82.5 - 100 (complete OS launchpad active)
      // =======================================================

      masterTl
        // CHAPTER 1 (0 to 12): Floating Drift
        .to(fragCardPdfRef.current, { x: 25, y: 15, rotation: -1, duration: 12, ease: "none" }, 0)
        .to(fragCardDmRef.current, { x: -25, y: 20, rotation: 1, duration: 12, ease: "none" }, 0)
        .to(fragCardSheetRef.current, { x: -20, y: -15, rotation: 0, duration: 12, ease: "none" }, 0)
        .to(fragCardCalRef.current, { x: 15, y: -20, rotation: 0, duration: 12, ease: "none" }, 0)
        .to(fragCardAssetsRef.current, { x: -15, y: -15, rotation: 0, duration: 12, ease: "none" }, 0)

        // TRANSITION 1 -> 2 (12 to 16.5): Cards converge, Nexus Hub reveals over Ch1
        .to(
          [
            fragCardPdfRef.current,
            fragCardDmRef.current,
            fragCardSheetRef.current,
            fragCardCalRef.current,
            fragCardAssetsRef.current
          ],
          { scale: 0.65, y: -30, duration: 3, ease: "power1.in" },
          12
        )
        // Nexus Layer (zIndex 2) fades in smoothly over Ch1
        .to(nexusLayerRef.current, { autoAlpha: 1, duration: 2.5, ease: "power1.in" }, 13.5)
        .set(fragLayerRef.current, { autoAlpha: 0 }, 16.5)
        .fromTo(
          nexusHubRef.current,
          { scale: 0.4, opacity: 0 },
          { scale: 1, opacity: 1, duration: 3, ease: "back.out(1.4)" },
          13.5
        )
        .fromTo(
          nexusYtNodeRef.current,
          { x: -50, y: -30, opacity: 0 },
          { x: 0, y: 0, opacity: 1, duration: 2.5, ease: "power2.out" },
          14
        )
        .fromTo(
          nexusIgNodeRef.current,
          { x: 50, y: -30, opacity: 0 },
          { x: 0, y: 0, opacity: 1, duration: 2.5, ease: "power2.out" },
          14
        )
        .fromTo(
          nexusTwNodeRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 2.5, ease: "power2.out" },
          14.5
        )
        .fromTo(
          ".nexus-connection-path",
          { strokeDashoffset: 400 },
          { strokeDashoffset: 0, duration: 3, ease: "none" },
          14
        )
        .fromTo(
          nexusSecurityRef.current,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 2, ease: "power2.out" },
          15
        )

        // CHAPTER 2 STEADY (16.5 to 28): Hub holds active

        // TRANSITION 2 -> 3 (28 to 32.5): Nexus collapses, Studio reveals over Ch2
        .to(
          [
            nexusHubRef.current,
            nexusYtNodeRef.current,
            nexusIgNodeRef.current,
            nexusTwNodeRef.current,
            ".nexus-connection-path",
            nexusSecurityRef.current
          ],
          { scale: 0.88, duration: 3, ease: "power2.in" },
          28
        )
        // Studio Layer (zIndex 3) fades in smoothly over Ch2
        .to(studioLayerRef.current, { autoAlpha: 1, duration: 2.5, ease: "power1.in" }, 29.5)
        .set(nexusLayerRef.current, { autoAlpha: 0 }, 32.5)
        .fromTo(
          studioKpisRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 2.5, ease: "power2.out" },
          30
        )
        .fromTo(
          studioChartRef.current,
          { scaleY: 0.8, opacity: 0 },
          { scaleY: 1, opacity: 1, duration: 2.5, ease: "power2.out" },
          30.5
        )
        .fromTo(
          studioContentRef.current,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 2, ease: "power2.out" },
          31
        )
        .fromTo(
          studioKitRef.current,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 2, ease: "power2.out" },
          31.5
        )

        // CHAPTER 3 STEADY (32.5 to 45): Studio Dashboard holds active

        // TRANSITION 3 -> 4 (45 to 49.5): Studio shifts out, Match reveals over Ch3
        .to(
          studioLayerRef.current,
          { x: -20, scale: 0.97, duration: 3, ease: "power2.in" },
          45
        )
        // Match Layer (zIndex 4) fades in smoothly over Ch3
        .to(matchLayerRef.current, { autoAlpha: 1, duration: 2.5, ease: "power1.in" }, 46.5)
        .set(studioLayerRef.current, { autoAlpha: 0 }, 49.5)
        .fromTo(
          matchBriefRef.current,
          { x: 25, opacity: 0 },
          { x: 0, opacity: 1, duration: 2.5, ease: "power2.out" },
          47
        )
        // Scrub SVG circular radial gauge progress stroke (0% to 96%)
        .fromTo(
          matchGaugeCircleRef.current,
          { strokeDashoffset: 251.2 },
          { strokeDashoffset: 10.05, duration: 4, ease: "none" },
          47.5
        )
        // Scrub 4 dimension progress bars
        .fromTo(
          matchBar1Ref.current,
          { width: "0%" },
          { width: "100%", duration: 3.5, ease: "none" },
          48
        )
        .fromTo(
          matchBar2Ref.current,
          { width: "0%" },
          { width: "95%", duration: 3.5, ease: "none" },
          48.5
        )
        .fromTo(
          matchBar3Ref.current,
          { width: "0%" },
          { width: "92%", duration: 3.5, ease: "none" },
          49
        )
        .fromTo(
          matchBar4Ref.current,
          { width: "0%" },
          { width: "98%", duration: 3.5, ease: "none" },
          49.5
        )
        .fromTo(
          matchRationaleRef.current,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 2, ease: "power2.out" },
          50
        )

        // CHAPTER 4 STEADY (49.5 to 61): Opportunity Match holds active

        // TRANSITION 4 -> 5 (61 to 65.5): Match shifts up, Deal Room reveals over Ch4
        .to(
          matchLayerRef.current,
          { y: -15, scale: 0.97, duration: 3, ease: "power2.in" },
          61
        )
        // Deal Room Layer (zIndex 5) fades in smoothly over Ch4
        .to(collabLayerRef.current, { autoAlpha: 1, duration: 2.5, ease: "power1.in" }, 62.5)
        .set(matchLayerRef.current, { autoAlpha: 0 }, 65.5)
        // Scrub timeline progress line across the 9 stages
        .fromTo(
          collabTimelineBarRef.current,
          { width: "10%" },
          { width: "75%", duration: 4, ease: "none" },
          63
        )
        .fromTo(
          collabDraftCardRef.current,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 2.5, ease: "power2.out" },
          63.5
        )
        // Scrubber position pins to revision timestamp (02:45)
        .fromTo(
          collabScrubberPinRef.current,
          { left: "10%" },
          { left: "38%", duration: 3.5, ease: "none" },
          64
        )
        .fromTo(
          collabFeedbackRef.current,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 2.5, ease: "back.out(1.2)" },
          64.5
        )
        .fromTo(
          collabMilestoneRef.current,
          { y: 8, opacity: 0 },
          { y: 0, opacity: 1, duration: 2, ease: "power2.out" },
          65
        )

        // CHAPTER 5 STEADY (65.5 to 78): Deal Room holds active

        // TRANSITION 5 -> 6 (78 to 82.5): Deal room scales, Ecosystem Launchpad reveals over Ch5
        .to(
          collabLayerRef.current,
          { scale: 0.95, duration: 3, ease: "power2.in" },
          78
        )
        // Launchpad Layer (zIndex 6) fades in smoothly over Ch5
        .to(launchLayerRef.current, { autoAlpha: 1, duration: 2.5, ease: "power1.in" }, 79.5)
        .set(collabLayerRef.current, { autoAlpha: 0 }, 82.5)
        .fromTo(
          launchEnginesRef.current,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 2.5, ease: "power2.out" },
          80
        )
        .fromTo(
          launchCtaRef.current,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 2.5, ease: "power2.out" },
          81
        )
        // Pad timeline out to 100 so Chapter 6 remains rock-solid stable through 100
        .to({}, { duration: 17.5 }, 82.5);
        // CHAPTER 6 STEADY (85 to 100): Launchpad holds active with dual CTAs
    }, storyContainerRef);

    return () => ctx.revert();
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

  return (
    <section className="scroll-story-container" id="product-story" ref={storyContainerRef}>
      {/* =========================================================
          STICKY PROGRESS NAVIGATION RAIL (SYNCS WITH SCROLL)
      ========================================================== */}
      <nav className="scroll-story-progress-rail" aria-label="Story chapter navigation">
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

        {/* Scroll Progress Meter Line across the rail */}
        <div
          style={{
            position: "absolute",
            bottom: "-1px",
            left: 0,
            height: "3px",
            backgroundColor: "var(--brand-primary)",
            width: `${Math.round(scrollProgress * 100)}%`,
            borderRadius: "0 2px 2px 0",
            transition: "width 0.1s linear"
          }}
        />

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

            {/* Mobile Stacked Preview: Chapter 1 */}
            <div className="scroll-story-mobile-preview card" style={{ padding: "16px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--color-red)" }}>
                <AlertTriangle size={16} />
                <strong style={{ fontSize: "12px" }}>The Fragmented Status Quo</strong>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                <div style={{ backgroundColor: "var(--bg-subtle)", padding: "8px", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontWeight: "700" }}>MediaKit.pdf</div>
                  <span className="badge badge-amber" style={{ fontSize: "8px", marginTop: "4px" }}>Stale (9m)</span>
                </div>
                <div style={{ backgroundColor: "var(--bg-subtle)", padding: "8px", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontWeight: "700" }}>Invoice #04</div>
                  <span className="badge badge-red" style={{ fontSize: "8px", marginTop: "4px" }}>45d Overdue</span>
                </div>
              </div>
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

            {/* Mobile Stacked Preview: Chapter 2 */}
            <div className="scroll-story-mobile-preview card" style={{ padding: "16px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <strong style={{ fontSize: "12px" }}>Connected Channel Hub</strong>
                <span className="badge badge-green" style={{ fontSize: "9px" }}>Active</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                  <span>YouTube Data API v3</span>
                  <span style={{ color: "var(--brand-primary)", fontWeight: "700" }}>48.5K Subs</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                  <span>Instagram Meta Graph</span>
                  <span className="badge badge-amber" style={{ fontSize: "8px" }}>In Review</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                  <span>Twitch Helix</span>
                  <span className="badge badge-purple" style={{ fontSize: "8px" }}>Connected</span>
                </div>
              </div>
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

            {/* Mobile Stacked Preview: Chapter 3 */}
            <div className="scroll-story-mobile-preview card" style={{ padding: "16px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <strong style={{ fontSize: "12px" }}>Alex Rivera Studio</strong>
                  <span className="badge badge-green" style={{ fontSize: "8px" }}>Verified</span>
                </div>
                <span style={{ fontSize: "11px", color: "var(--brand-primary)", fontWeight: "700" }}>48,500 Reach</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px", fontSize: "11px" }}>
                <div style={{ backgroundColor: "var(--bg-subtle)", padding: "8px", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>Engagement</div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--color-blue)" }}>7.07%</div>
                </div>
                <div style={{ backgroundColor: "var(--bg-subtle)", padding: "8px", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>30d Growth</div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--brand-primary)" }}>+14.8%</div>
                </div>
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                Public Kit: lazarus.app/kit/alexrivera
              </div>
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

            {/* Mobile Stacked Preview: Chapter 4 */}
            <div className="scroll-story-mobile-preview card" style={{ padding: "16px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div>
                  <span className="badge badge-purple" style={{ fontSize: "8px" }}>MATCHED BRIEF</span>
                  <div style={{ fontSize: "12px", fontWeight: "700", marginTop: "2px" }}>AI Developer Copilot Q4</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "16px", fontWeight: "800", color: "var(--brand-primary)" }}>96%</span>
                  <div style={{ fontSize: "8px", color: "var(--text-muted)" }}>MATCH</div>
                </div>
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-secondary)", backgroundColor: "var(--bg-subtle)", padding: "6px 8px", borderRadius: "var(--radius-sm)" }}>
                Sponsor: <strong>Nexus AI Cloud</strong> • Budget: ₹85,000 Escrow
              </div>
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

            {/* Mobile Stacked Preview: Chapter 5 */}
            <div className="scroll-story-mobile-preview card" style={{ padding: "16px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ fontSize: "12px" }}>Deal Room • Stage 6</strong>
                <span className="badge badge-amber" style={{ fontSize: "8px" }}>Revision Required</span>
              </div>
              <div style={{ backgroundColor: "var(--bg-surface-raised)", borderLeft: "3px solid var(--color-amber)", padding: "8px", borderRadius: "var(--radius-sm)", fontSize: "10px", color: "var(--text-secondary)" }}>
                <strong style={{ color: "var(--text-primary)" }}>Feedback (02:45):</strong> Boost mic audio during terminal segment before approval.
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "9px", color: "var(--text-muted)" }}>
                <span>Escrow: ₹85,000 Locked</span>
                <span className="badge badge-green" style={{ fontSize: "8px" }}>Auto-Release on Stage 8</span>
              </div>
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

            {/* Mobile Stacked Preview: Chapter 6 */}
            <div className="scroll-story-mobile-preview card" style={{ padding: "16px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface)", marginTop: "24px" }}>
              <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <span className="badge badge-green" style={{ fontSize: "8px" }}>THE COMPLETE PLATFORM</span>
                <div style={{ fontSize: "12px", fontWeight: "800", marginTop: "4px" }}>Lazarus Creator OS</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "10px", marginBottom: "8px" }}>
                <div style={{ backgroundColor: "var(--bg-subtle)", padding: "6px", borderRadius: "var(--radius-sm)" }}>✓ Creator Studio</div>
                <div style={{ backgroundColor: "var(--bg-subtle)", padding: "6px", borderRadius: "var(--radius-sm)" }}>✓ Match Engine</div>
                <div style={{ backgroundColor: "var(--bg-subtle)", padding: "6px", borderRadius: "var(--radius-sm)" }}>✓ Deal Room</div>
                <div style={{ backgroundColor: "var(--bg-subtle)", padding: "6px", borderRadius: "var(--radius-sm)" }}>✓ Milestone Escrow</div>
              </div>
              <div style={{ fontSize: "9px", color: "var(--text-muted)", textAlign: "center" }}>
                AES-256-GCM Vault Isolation • Official APIs
              </div>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------
            RIGHT COLUMN: STICKY CINEMATIC PRODUCT PREVIEW STAGE (DESKTOP)
        --------------------------------------------------------- */}
        <div className="scroll-story-sticky-pane" ref={stageWindowRef}>
          <div className="scroll-story-preview-window">
            {/* Window Chrome Header */}
            <div className="scroll-story-preview-header">
              <div style={{ display: "flex", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10b981" }} />
              </div>

              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                LAZARUS V3 • CONTINUOUS PRODUCT TIMELINE
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
                  STAGE 0{activeChapter}
                </span>
              </div>
            </div>

            {/* Persistent Visual Stage Viewport (All 6 layers scrubbed continuously) */}
            <div className="scroll-story-preview-body">
              <div className="story-stage-viewport" style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
                
                {/* ===================================================
                    LAYER 1: FRAGMENTED TOOLS (0.00 -> 0.17)
                ==================================================== */}
                <div
                  ref={fragLayerRef}
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "var(--radius-xl)",
                    zIndex: 1
                  }}
                >
                  <div
                    style={{
                      backgroundColor: isDark ? "rgba(239, 68, 68, 0.12)" : "rgba(220, 38, 38, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.28)",
                      borderRadius: "var(--radius-md)",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexShrink: 0
                    }}
                  >
                    <AlertTriangle size={16} style={{ color: "var(--color-red)", flexShrink: 0 }} />
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                      <strong style={{ color: "var(--text-primary)" }}>Status Quo:</strong> 6+ disconnected silos across browser tabs.
                    </span>
                  </div>

                  {/* 6 Scattered Cards */}
                  <div style={{ position: "relative", flex: 1, minHeight: "360px", margin: "10px 0" }}>
                    {/* PDF Card */}
                    <div
                      ref={fragCardPdfRef}
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        width: "190px",
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "10px",
                        boxShadow: "var(--shadow-md)",
                        transform: "rotate(-4deg)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <FileText size={13} style={{ color: "var(--color-amber)" }} />
                          <span style={{ fontSize: "10px", fontWeight: "700" }}>MediaKit_2023.pdf</span>
                        </div>
                        <span className="badge badge-amber" style={{ fontSize: "8px" }}>Stale (9m)</span>
                      </div>
                      <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>Followers: ~40k (manual text)</div>
                    </div>

                    {/* DM Card */}
                    <div
                      ref={fragCardDmRef}
                      style={{
                        position: "absolute",
                        top: "20px",
                        right: "10px",
                        width: "200px",
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "10px",
                        boxShadow: "var(--shadow-md)",
                        transform: "rotate(3deg)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                        <MessageSquare size={13} style={{ color: "var(--color-blue)" }} />
                        <span style={{ fontSize: "10px", fontWeight: "700" }}>Direct Message</span>
                      </div>
                      <p style={{ fontSize: "9px", color: "var(--text-secondary)", fontStyle: "italic", margin: 0 }}>
                        "Hey Alex! Do you take sponsors? Email us rates ASAP."
                      </p>
                    </div>

                    {/* YouTube Studio Card */}
                    <div
                      ref={fragCardYtRef}
                      style={{
                        position: "absolute",
                        top: "135px",
                        left: "15px",
                        width: "190px",
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "10px",
                        boxShadow: "var(--shadow-md)",
                        transform: "rotate(2deg)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
                        <Video size={13} style={{ color: "var(--color-red)" }} />
                        <span style={{ fontSize: "10px", fontWeight: "700" }}>YouTube Studio</span>
                      </div>
                      <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>Siloed metrics • No unified reach</div>
                    </div>

                    {/* Spreadsheet Invoice Card */}
                    <div
                      ref={fragCardSheetRef}
                      style={{
                        position: "absolute",
                        top: "150px",
                        right: "15px",
                        width: "200px",
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "10px",
                        boxShadow: "var(--shadow-md)",
                        transform: "rotate(-2.5deg)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <DollarSign size={13} style={{ color: "var(--color-red)" }} />
                          <span style={{ fontSize: "10px", fontWeight: "700" }}>Invoice #04</span>
                        </div>
                        <span className="badge badge-red" style={{ fontSize: "8px" }}>45d Overdue</span>
                      </div>
                      <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>₹45,000 pending • Proof of post lost</div>
                    </div>

                    {/* Calendar Card */}
                    <div
                      ref={fragCardCalRef}
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "25px",
                        width: "170px",
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "8px 10px",
                        boxShadow: "var(--shadow-sm)",
                        transform: "rotate(-1.5deg)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={12} style={{ color: "var(--color-purple)" }} />
                        <span style={{ fontSize: "9px", fontWeight: "700" }}>Sponsor Deadline</span>
                      </div>
                      <div style={{ fontSize: "8px", color: "var(--text-muted)" }}>Draft due tomorrow</div>
                    </div>

                    {/* Assets Card */}
                    <div
                      ref={fragCardAssetsRef}
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "25px",
                        width: "170px",
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "8px 10px",
                        boxShadow: "var(--shadow-sm)",
                        transform: "rotate(2deg)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <FolderOpen size={12} style={{ color: "var(--brand-primary)" }} />
                        <span style={{ fontSize: "9px", fontWeight: "700" }}>Drive Assets</span>
                      </div>
                      <div style={{ fontSize: "8px", color: "var(--text-muted)" }}>120GB unsynced clips</div>
                    </div>
                  </div>

                  <div style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "center", flexShrink: 0 }}>
                    Scroll to scrub convergence →
                  </div>
                </div>

                {/* ===================================================
                    LAYER 2: LAZARUS NEXUS HUB (0.17 -> 0.34)
                ==================================================== */}
                <div
                  ref={nexusLayerRef}
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "var(--radius-xl)",
                    opacity: 0,
                    visibility: "hidden",
                    pointerEvents: "none",
                    zIndex: 2
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                        Lazarus Integration Nexus
                      </h4>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                        Continuous OAuth streaming pipeline
                      </span>
                    </div>
                    <span className="badge badge-green" style={{ fontSize: "9px" }}>Topology Active</span>
                  </div>

                  {/* SVG Topology & Center Hub */}
                  <div style={{ position: "relative", flex: 1, minHeight: "360px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg
                      ref={nexusLinesRef}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                      viewBox="0 0 500 360"
                    >
                      <path
                        d="M 120 70 Q 180 130 250 180"
                        fill="none"
                        stroke="var(--color-red)"
                        strokeWidth="2.5"
                        strokeOpacity="0.7"
                        strokeDasharray="6 6"
                        className="nexus-connection-path"
                      />
                      <path
                        d="M 380 70 Q 320 130 250 180"
                        fill="none"
                        stroke="var(--color-blue)"
                        strokeWidth="2.5"
                        strokeOpacity="0.7"
                        strokeDasharray="6 6"
                        className="nexus-connection-path"
                      />
                      <path
                        d="M 250 310 Q 250 250 250 180"
                        fill="none"
                        stroke="var(--color-purple)"
                        strokeWidth="2.5"
                        strokeOpacity="0.7"
                        strokeDasharray="6 6"
                        className="nexus-connection-path"
                      />
                    </svg>

                    {/* Central Lazarus Hub Node */}
                    <div
                      ref={nexusHubRef}
                      className="animate-pulse-hub"
                      style={{
                        position: "absolute",
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        backgroundColor: "var(--bg-surface)",
                        border: "2px solid var(--brand-primary)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                        boxShadow: "0 0 20px var(--brand-glow)"
                      }}
                    >
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          backgroundColor: "var(--brand-primary)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "3px"
                        }}
                      >
                        <Sparkles size={16} />
                      </div>
                      <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-primary)" }}>
                        LAZARUS HUB
                      </span>
                      <span style={{ fontSize: "8px", color: "var(--brand-primary)", fontWeight: "700" }}>
                        PIPELINE READY
                      </span>
                    </div>

                    {/* YouTube Node (Top-Left) */}
                    <div
                      ref={nexusYtNodeRef}
                      style={{
                        position: "absolute",
                        top: "15px",
                        left: "15px",
                        width: "170px",
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "8px 10px",
                        boxShadow: "var(--shadow-md)",
                        zIndex: 5
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <Video size={14} style={{ color: "var(--color-red)" }} />
                          <strong style={{ fontSize: "11px" }}>YouTube API</strong>
                        </div>
                        <span className="badge badge-green" style={{ fontSize: "8px" }}>Active</span>
                      </div>
                      <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>Google OAuth • 48.5K Subs</div>
                    </div>

                    {/* Instagram Node (Top-Right) */}
                    <div
                      ref={nexusIgNodeRef}
                      style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        width: "170px",
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "8px 10px",
                        boxShadow: "var(--shadow-md)",
                        zIndex: 5
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <Film size={14} style={{ color: "var(--color-blue)" }} />
                          <strong style={{ fontSize: "11px" }}>Instagram Meta</strong>
                        </div>
                        <span className="badge badge-amber" style={{ fontSize: "8px" }}>In Review</span>
                      </div>
                      <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>Sandbox active for test users</div>
                    </div>

                    {/* Twitch Node (Bottom) */}
                    <div
                      ref={nexusTwNodeRef}
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "180px",
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "8px 10px",
                        boxShadow: "var(--shadow-md)",
                        zIndex: 5
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <Tv size={14} style={{ color: "var(--color-purple)" }} />
                          <strong style={{ fontSize: "11px" }}>Twitch Helix</strong>
                        </div>
                        <span className="badge badge-purple" style={{ fontSize: "8px" }}>Connected</span>
                      </div>
                      <div style={{ fontSize: "9px", color: "var(--text-muted)", textAlign: "center" }}>VOD metrics synced</div>
                    </div>
                  </div>

                  {/* Security Banner */}
                  <div
                    ref={nexusSecurityRef}
                    style={{
                      backgroundColor: isDark ? "rgba(16, 185, 129, 0.08)" : "rgba(5, 150, 105, 0.06)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      borderRadius: "var(--radius-md)",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexShrink: 0
                    }}
                  >
                    <Lock size={15} style={{ color: "var(--brand-primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
                      <strong>AES-256-GCM Vault Isolation:</strong> Hardware-randomized 96-bit IVs. <em>Illustrative topology.</em>
                    </span>
                  </div>
                </div>

                {/* ===================================================
                    LAYER 3: CREATOR STUDIO DASHBOARD (0.34 -> 0.51)
                ==================================================== */}
                <div
                  ref={studioLayerRef}
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "var(--radius-xl)",
                    opacity: 0,
                    visibility: "hidden",
                    pointerEvents: "none",
                    zIndex: 3
                  }}
                >
                  {/* Studio Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--color-blue) 100%)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                          fontSize: "12px"
                        }}
                      >
                        AR
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>Alex Rivera</span>
                          <span className="badge badge-green" style={{ fontSize: "8px" }}>YouTube Verified</span>
                        </div>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>@alexriveratech • Tech & AI</span>
                      </div>
                    </div>
                    <span className="badge badge-blue" style={{ fontSize: "9px" }}>Illustrative Studio Preview</span>
                  </div>

                  {/* 4 KPIs */}
                  <div ref={studioKpisRef} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", margin: "10px 0" }}>
                    <div className="stat-card" style={{ padding: "10px" }}>
                      <span className="stat-label" style={{ fontSize: "10px" }}>Verified Reach</span>
                      <div className="stat-value" style={{ fontSize: "18px" }}>48,500</div>
                      <span style={{ fontSize: "10px", color: "var(--brand-primary)", fontWeight: "700" }}>+14.8% 30d</span>
                    </div>
                    <div className="stat-card" style={{ padding: "10px" }}>
                      <span className="stat-label" style={{ fontSize: "10px" }}>Engagement</span>
                      <div className="stat-value" style={{ fontSize: "18px" }}>7.07%</div>
                      <span style={{ fontSize: "10px", color: "var(--color-blue)", fontWeight: "600" }}>Live Ingested</span>
                    </div>
                  </div>

                  {/* Growth Chart */}
                  <div
                    ref={studioChartRef}
                    style={{
                      backgroundColor: "var(--bg-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "8px 10px",
                      border: "1px solid var(--border-subtle)",
                      marginBottom: "8px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary)" }}>
                        30-Day Cross-Platform Audience Curve
                      </span>
                      <span style={{ fontSize: "9px", color: "var(--brand-primary)", fontWeight: "700" }}>Verified</span>
                    </div>
                    <div style={{ width: "100%", height: 75 }}>
                      <ResponsiveContainer>
                        <AreaChart data={STUDIO_GROWTH_DATA}>
                          <defs>
                            <linearGradient id="colorStoryMaster" x1="0" y1="0" x2="0" y2="1">
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
                            fill="url(#colorStoryMaster)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Content cards */}
                  <div ref={studioContentRef} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ backgroundColor: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "6px 8px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Video size={14} style={{ color: "var(--color-red)", flexShrink: 0 }} />
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: "10px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>AI Workflows</div>
                        <div style={{ fontSize: "8px", color: "var(--text-muted)" }}>38.4K views • 8.2% CTR</div>
                      </div>
                    </div>
                    <div style={{ backgroundColor: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "6px 8px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Film size={14} style={{ color: "var(--color-blue)", flexShrink: 0 }} />
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: "10px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Full-Stack 2026</div>
                        <div style={{ fontSize: "8px", color: "var(--text-muted)" }}>46.1K views • 9.1% Eng</div>
                      </div>
                    </div>
                  </div>

                  {/* Media Kit Showcase */}
                  <div
                    ref={studioKitRef}
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "8px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexShrink: 0
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <FileCheck2 size={15} style={{ color: "var(--brand-primary)" }} />
                      <span style={{ fontSize: "11px", fontWeight: "700" }}>Dynamic Media Kit</span>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>lazarus.app/kit/alexrivera</span>
                    </div>
                    <button onClick={() => navigate("/kit/alexrivera")} className="btn-ghost" style={{ fontSize: "10px", padding: "3px 6px" }}>
                      Preview →
                    </button>
                  </div>
                </div>

                {/* ===================================================
                    LAYER 4: OPPORTUNITY MATCHING ENGINE (0.51 -> 0.68)
                ==================================================== */}
                <div
                  ref={matchLayerRef}
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "var(--radius-xl)",
                    opacity: 0,
                    visibility: "hidden",
                    pointerEvents: "none",
                    zIndex: 4
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <div>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--color-blue)" }}>
                        EXPLAINABLE MATCH ENGINE
                      </span>
                      <h4 style={{ fontSize: "14px", fontWeight: "700", margin: 0 }}>Matched Campaign Brief</h4>
                    </div>
                    <span className="badge badge-green" style={{ fontSize: "9px" }}>High Compatibility</span>
                  </div>

                  {/* Split Card + Radial Gauge */}
                  <div
                    style={{
                      backgroundColor: "var(--bg-surface-raised)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-lg)",
                      padding: "14px",
                      margin: "10px 0"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <div ref={matchBriefRef}>
                        <span className="badge badge-purple" style={{ fontSize: "9px" }}>SPONSORSHIP BRIEF</span>
                        <h5 style={{ fontSize: "14px", fontWeight: "800", margin: "2px 0" }}>AI Developer Copilot Q4</h5>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                          Sponsor: <strong>Nexus AI Cloud</strong> • Budget: ₹85,000
                        </div>
                      </div>

                      {/* Continuous Scrubbed Radial Gauge */}
                      <div style={{ position: "relative", width: "68px", height: "68px", flexShrink: 0 }}>
                        <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
                          <circle
                            ref={matchGaugeCircleRef}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="var(--brand-primary)"
                            strokeWidth="8"
                            strokeDasharray="251.2"
                            strokeDashoffset="251.2"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "16px", fontWeight: "800", color: "var(--brand-primary)", lineHeight: 1 }}>96%</span>
                          <span style={{ fontSize: "7px", fontWeight: "700", color: "var(--text-muted)" }}>MATCH</span>
                        </div>
                      </div>
                    </div>

                    {/* 4 Dimension Bars */}
                    <div style={{ backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", padding: "10px", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "6px" }}>
                        EXPLAINABLE MATCHING DIMENSIONS:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", marginBottom: "2px" }}>
                            <span>• Tech & AI Niche Alignment</span>
                            <strong style={{ color: "var(--brand-primary)" }}>100% (+40%)</strong>
                          </div>
                          <div style={{ width: "100%", height: "4px", backgroundColor: "var(--border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                            <div ref={matchBar1Ref} style={{ width: "0%", height: "100%", backgroundColor: "var(--brand-primary)" }} />
                          </div>
                        </div>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", marginBottom: "2px" }}>
                            <span>• YouTube Channel Reach (48.5K)</span>
                            <strong style={{ color: "var(--brand-primary)" }}>95% (+30%)</strong>
                          </div>
                          <div style={{ width: "100%", height: "4px", backgroundColor: "var(--border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                            <div ref={matchBar2Ref} style={{ width: "0%", height: "100%", backgroundColor: "var(--brand-primary)" }} />
                          </div>
                        </div>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", marginBottom: "2px" }}>
                            <span>• Engagement Rate (7.07% vs 4.5% min)</span>
                            <strong style={{ color: "var(--brand-primary)" }}>92% (+15%)</strong>
                          </div>
                          <div style={{ width: "100%", height: "4px", backgroundColor: "var(--border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                            <div ref={matchBar3Ref} style={{ width: "0%", height: "100%", backgroundColor: "var(--brand-primary)" }} />
                          </div>
                        </div>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", marginBottom: "2px" }}>
                            <span>• Historical On-Time Deliverable Record</span>
                            <strong style={{ color: "var(--brand-primary)" }}>98% (+11%)</strong>
                          </div>
                          <div style={{ width: "100%", height: "4px", backgroundColor: "var(--border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                            <div ref={matchBar4Ref} style={{ width: "0%", height: "100%", backgroundColor: "var(--brand-primary)" }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <p ref={matchRationaleRef} style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic", margin: "8px 0 0", lineHeight: 1.3 }}>
                      "Why this fits: You produce verified coding tutorials, and Nexus AI requires technical creator authority to reach software developers."
                    </p>
                  </div>

                  <div style={{ fontSize: "9px", color: "var(--text-muted)", textAlign: "center", flexShrink: 0 }}>
                    Illustrative match engine demonstration • Deterministic scoring
                  </div>
                </div>

                {/* ===================================================
                    LAYER 5: COLLABORATION WORKSPACE (0.68 -> 0.85)
                ==================================================== */}
                <div
                  ref={collabLayerRef}
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "var(--radius-xl)",
                    opacity: 0,
                    visibility: "hidden",
                    pointerEvents: "none",
                    zIndex: 5
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: "700", margin: 0 }}>Collaboration Deal Room</h4>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Nexus AI Copilot • Deliverable #1</span>
                    </div>
                    <span className="badge badge-amber" style={{ fontSize: "9px" }}>Stage 6: Revisions</span>
                  </div>

                  {/* 9-Stage Scrubbed Stepper */}
                  <div style={{ backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", padding: "8px", border: "1px solid var(--border-subtle)", margin: "8px 0" }}>
                    <div style={{ position: "relative", height: "4px", backgroundColor: "var(--border-subtle)", borderRadius: "2px", margin: "6px 0 10px" }}>
                      <div ref={collabTimelineBarRef} style={{ width: "10%", height: "100%", backgroundColor: "var(--brand-primary)", borderRadius: "2px" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "4px" }}>
                      {["1. Apply", "2. Shortlist", "3. Terms", "4. Agree", "5. In Prog", "6. Submit", "7. Revision", "8. Approve", "9. Complete"].map((name, idx) => (
                        <span key={idx} style={{ fontSize: "8px", fontWeight: "700", textAlign: "center", color: idx <= 6 ? "var(--brand-primary)" : "var(--text-muted)" }}>
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Deliverable Review & Scrubber Card */}
                  <div ref={collabDraftCardRef} style={{ backgroundColor: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "12px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <Video size={14} style={{ color: "var(--brand-primary)" }} />
                          <strong style={{ fontSize: "12px" }}>Draft v2: "Building Full-Stack AI Apps"</strong>
                        </div>
                        <span className="badge badge-purple" style={{ fontSize: "8px" }}>Unlisted Link</span>
                      </div>

                      {/* Scrubber with Pin */}
                      <div style={{ backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", padding: "6px 8px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <Play size={12} style={{ color: "var(--brand-primary)" }} />
                        <div style={{ flex: 1, height: "4px", backgroundColor: "var(--border-subtle)", borderRadius: "2px", position: "relative" }}>
                          <div style={{ width: "38%", height: "100%", backgroundColor: "var(--brand-primary)" }} />
                          <div ref={collabScrubberPinRef} style={{ position: "absolute", left: "38%", top: "-4px", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "var(--color-amber)", border: "2px solid #ffffff" }} />
                        </div>
                        <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>02:45 / 12:48</span>
                      </div>

                      {/* Sponsor Revision Bubble */}
                      <div ref={collabFeedbackRef} style={{ backgroundColor: "var(--bg-surface)", borderLeft: "3px solid var(--color-amber)", padding: "8px 10px", borderRadius: "0 var(--radius-sm) var(--radius-sm) 0", fontSize: "10px", color: "var(--text-secondary)", lineHeight: 1.35 }}>
                        <strong style={{ color: "var(--text-primary)" }}>Nexus AI Reviewer (Timestamp 02:45):</strong><br />
                        "The code demo is crisp! Please boost microphone audio during the terminal segment (02:45 - 03:40) before final approval."
                      </div>
                    </div>

                    <div ref={collabMilestoneRef} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>Simulated Milestone: ₹85,000 Locked in State Machine</span>
                      <span className="badge badge-green" style={{ fontSize: "8px" }}>Release Upon Stage 8</span>
                    </div>
                  </div>

                  <div style={{ fontSize: "9px", color: "var(--text-muted)", textAlign: "center", marginTop: "4px", flexShrink: 0 }}>
                    Simulated milestone workflow demonstration • State machine governed
                  </div>
                </div>

                {/* ===================================================
                    LAYER 6: UNIFIED ECOSYSTEM & LAUNCHPAD (0.85 -> 1.00)
                ==================================================== */}
                <div
                  ref={launchLayerRef}
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "var(--radius-xl)",
                    opacity: 0,
                    visibility: "hidden",
                    pointerEvents: "none",
                    zIndex: 6
                  }}
                >
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <span className="badge badge-green" style={{ fontSize: "9px", marginBottom: "4px" }}>THE COMPLETE PLATFORM</span>
                    <h4 style={{ fontSize: "16px", fontWeight: "800", margin: "2px 0" }}>Lazarus Creator OS In Motion</h4>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Four interconnected engines transforming your creative business</span>
                  </div>

                  {/* 4 Engine Quadrants */}
                  <div ref={launchEnginesRef} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", margin: "8px 0" }}>
                    <div style={{ backgroundColor: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "8px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                        <TrendingUp size={13} style={{ color: "var(--brand-primary)" }} />
                        <strong style={{ fontSize: "11px" }}>Creator Studio</strong>
                      </div>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>Unified live analytics & media kits</span>
                    </div>
                    <div style={{ backgroundColor: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "8px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                        <Target size={13} style={{ color: "var(--color-blue)" }} />
                        <strong style={{ fontSize: "11px" }}>Opportunity Engine</strong>
                      </div>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>Deterministic compatibility & scoring</span>
                    </div>
                    <div style={{ backgroundColor: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "8px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                        <Layers size={13} style={{ color: "var(--color-purple)" }} />
                        <strong style={{ fontSize: "11px" }}>Deal Room</strong>
                      </div>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>9-stage deliverable approvals & notes</span>
                    </div>
                    <div style={{ backgroundColor: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "8px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                        <ShieldCheck size={13} style={{ color: "var(--brand-primary)" }} />
                        <strong style={{ fontSize: "11px" }}>Milestone Engine</strong>
                      </div>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>Audit-trailed escrow release protocols</span>
                    </div>
                  </div>

                  {/* Dual CTA Actions */}
                  <div ref={launchCtaRef} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", flexShrink: 0 }}>
                    <div style={{ backgroundColor: "var(--bg-surface-raised)", border: "1px solid var(--brand-primary)", borderRadius: "var(--radius-md)", padding: "10px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <span className="badge badge-green" style={{ fontSize: "8px" }}>FOR CREATORS</span>
                        <div style={{ fontSize: "11px", fontWeight: "700", marginTop: "3px" }}>Build Your Media Kit</div>
                      </div>
                      <button onClick={() => navigate("/login?role=creator&mode=register")} className="btn-primary" style={{ width: "100%", marginTop: "8px", fontSize: "10px", padding: "6px 8px" }}>
                        Join as Creator →
                      </button>
                    </div>

                    <div style={{ backgroundColor: "var(--bg-surface-raised)", border: "1px solid var(--color-blue)", borderRadius: "var(--radius-md)", padding: "10px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <span className="badge badge-blue" style={{ fontSize: "8px" }}>FOR BRANDS</span>
                        <div style={{ fontSize: "11px", fontWeight: "700", marginTop: "3px" }}>Publish Brief</div>
                      </div>
                      <button onClick={() => navigate("/login?role=brand&mode=register")} className="btn-secondary" style={{ width: "100%", marginTop: "8px", fontSize: "10px", padding: "6px 8px" }}>
                        Post Brand Brief →
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", gap: "12px", fontSize: "9px", color: "var(--text-muted)", flexShrink: 0, marginTop: "4px" }}>
                    <span>✓ Zero credit card required</span>
                    <span>✓ AES-256-GCM token vault</span>
                    <span>✓ Official API verification</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
