# LAZARUS V3 PRODUCT AUDIT & TRANSFORMATION BLUEPRINT
**From Hackathon Prototype to Production-Grade Creator Studio & Opportunity Network**

*Date: 2026-11-24*  
*Target Environment: Node.js (Express) + React (Vite) + PostgreSQL (Neon via Prisma)*  
*Platform Target: Lazarus V3 — Creator Studio & Opportunity Network*

---

## 1. EXECUTIVE SUMMARY & CURRENT STATE ASSESSMENT

Lazarus began as an incomplete hackathon project spanning two disconnected paradigms (a Django REST escrow backend and a partial React/Express app). In V2, the architecture was consolidated onto **React 19 + Vite + Express 5 + Neon PostgreSQL (hosted remote) + Prisma ORM 6**, with core authentication (JWT + bcrypt), strict RBAC, anti-IDOR checks, and an automated test suite.

However, from a **product and market perspective**, the platform is still rudimentary:
1. **Self-Reported / Manually Typed Metrics**: Creator stats (followers, average views, platform URLs) are entered as raw text strings without validation or verification.
2. **Hardcoded Mock Charts**: Components such as `VideoPerformanceGraph.jsx` render static dummy datasets (`[{ name: "Video 1", views: 12000 }]`), and utility scripts (`creatorAnalytics.js`) return fake hardcoded values.
3. **No Real Platform Integrations**: Zero OAuth connections to YouTube, Instagram, or Twitch exist. No real-time synchronisation, metric snapshots, or content imports are performed.
4. **Naive Matching**: Campaign matching relies on a simple array intersection (`niches: { hasSome: creator.niches }`) without scoring, platform requirements, audience thresholds, or explainability.
5. **Incomplete Collaboration Lifecycle**: Applications terminate at `ACCEPTED` or `REJECTED`. There is no collaboration workspace, no deliverable management, no review/revision workflow, and no final completion state.
6. **No Admin Console**: System-level monitoring, moderation, account verification, and audit trails are absent.
7. **Fragmented UI/UX**: The frontend consists of monolithic pages with dense inline styling, lack of an integrated layout/sidebar shell, and disjointed navigation.

---

## 2. DETAILED AUDIT FINDINGS

### 2.1 What Currently Works
- **Database Connection & ORM**: Prisma 6 correctly models and connects to hosted Neon PostgreSQL 18.7. 13 core models (`users`, `creator_profiles`, `brand_profiles`, `investor_profiles`, `projects`, `expense_items`, `milestones`, `submissions`, `investments`, `escrow_transactions`, `campaigns`, `campaign_applications`, `mou_agreements`) exist and persist.
- **Authentication & RBAC**: JWT issuance, bcrypt hashing (rounds = 10), and role authorization (`CREATOR`, `BRAND`, `INVESTOR`, `ADMIN`) middleware function reliably.
- **Security & Anti-IDOR**: Campaign applicant queries and deliverable approvals enforce strict resource ownership.
- **Escrow State Machine**: Finite state machine transitions for milestones (`PENDING -> HELD -> SUBMITTED -> APPROVED -> RELEASED`) are tested and protected against illegal jumps.
- **Automated Backend Tests**: Unit, RBAC, Anti-IDOR, and end-to-end database workflow tests execute cleanly against Neon PostgreSQL.
- **Frontend Build Pipeline**: Vite production build succeeds without syntax or bundling errors.

### 2.2 What Is Incomplete
- **Social Media Verification**: Zero external API integrations. Creators cannot connect Google/YouTube, Instagram, or Twitch accounts.
- **Creator Profile & Media Kit**: No automated aggregation of verified platform metrics into a downloadable or shareable media kit.
- **Content Library**: No unified content repository for uploaded videos, live streams, or reels.
- **Campaign Requirements & Creator Discovery**: Brands cannot search or filter creators based on platform, reach, engagement rate, or verified audience metrics.
- **Collaboration Lifecycle**: The current flow ends at `CampaignApplication.status = ACCEPTED`. There are no deliverable due dates, submission review cycles, revision requests, or completion milestones for brand deals.
- **Notifications**: No notifications table, API endpoints, or user-facing notification center exist.

### 2.3 What Is Mocked or Hardcoded
- `frontend/src/utils/creatorAnalytics.js`: Hardcoded `{ totalProjects: 3, fundingRaised: 750000, activeBackers: 42 }`.
- `frontend/src/components/VideoPerformanceGraph.jsx`: Hardcoded 4-point view dataset.
- `frontend/src/pages/Home.jsx`: Standalone hero page with a generic Gemini prompt box disconnected from user profile data.
- Creator followers and view statistics in `CreatorProfile.jsx`: Manually entered input fields without provenance.

### 2.4 What Should Be Redesigned
- **Frontend Architecture**: Replace ad-hoc inline styles with a modern, modular design system (Tailwind-like clean design tokens, dark workspace aesthetic, reusable UI components like Cards, Badges, Modals, Tables, StatCards, and Tabs).
- **Navigation Shell**: Implement a persistent, responsive App Shell with a Collapsible Sidebar, Workspace Header, Notifications Drawer, and User Profile Dropdown.
- **Matching Engine**: Replace boolean niche matching with a transparent, multi-factor scoring engine (Niche Alignment, Platform Compatibility, Reach & Engagement Fit, Deliverable Capability).
- **Campaign Management**: Upgrade campaigns into comprehensive briefs with required platforms, minimum follower/engagement tiers, deliverable schedules, and contractual values.

### 2.5 What Should Be Deprecated / Deprioritized
- **Crowdfunding Investor Role**: In V3, the product core is **Creator Studio & Opportunity Network** (Creator-Brand sponsorships and brand deals). The `INVESTOR` role and crowdfunding projects (`Project`, `ExpenseItem`, `Investment`) must be preserved in the database to prevent data loss, but hidden from the primary V3 navigation to avoid market dilution.

### 2.6 Security & Architectural Weaknesses
- **Token Storage for External APIs**: Adding OAuth for YouTube, Instagram, and Twitch requires storing OAuth refresh tokens. These **must not be stored in plaintext**. An AES-256-GCM encryption service must be implemented in the backend using a dedicated `TOKEN_ENCRYPTION_KEY`.
- **OAuth CSRF & State Validation**: OAuth authorization flows must utilize cryptographically secure `state` parameters bound to the authenticated user ID and verified upon callback.
- **Rate Limiting & Quota Management**: Platform API calls must implement exponential backoff, rate limit tracking, and caching to avoid quota exhaustion.
- **Data Privacy & Account Disconnection**: When a creator disconnects an account, tokens must be securely revoked at the provider and deleted locally.

---

## 3. DATABASE SCHEMA EVOLUTION (V3 EXTENSIONS)

To support real social integrations, verified analytics, creator media kits, and the extended collaboration lifecycle, the following entities are added to `schema.prisma`:

1. **`SocialAccount`**:
   - `id`, `creatorProfileId`, `platform` (`YOUTUBE`, `INSTAGRAM`, `TWITCH`), `platformAccountId`, `username`, `displayName`, `avatarUrl`, `profileUrl`, `status` (`CONNECTED`, `EXPIRED`, `REVOKED`, `SYNC_FAILED`, `PENDING`), `scopes` (String[]), `lastSyncedAt`, `syncError`, `createdAt`, `updatedAt`.
2. **`SocialCredential`** (1-to-1 with `SocialAccount`):
   - `id`, `socialAccountId`, `encryptedAccessToken`, `encryptedRefreshToken`, `tokenExpiresAt`, `iv`, `tag`, `updatedAt`.
3. **`CreatorContent`**:
   - `id`, `creatorProfileId`, `platform`, `externalContentId`, `title`, `description`, `thumbnailUrl`, `contentUrl`, `publishedAt`, `viewCount`, `likeCount`, `commentCount`, `metricsJson`, `createdAt`.
4. **`CreatorMetricSnapshot`**:
   - `id`, `creatorProfileId`, `platform`, `followerCount`, `totalViews`, `engagementRate`, `watchTimeMinutes`, `snapshotDate`, `createdAt`.
5. **`Collaboration`** (Expanded lifecycle replacing simple application acceptance):
   - `id`, `campaignId`, `creatorProfileId`, `brandProfileId`, `status` (`SHORTLISTED`, `NEGOTIATION`, `ACCEPTED`, `IN_PROGRESS`, `SUBMITTED`, `REVISION_REQUESTED`, `APPROVED`, `COMPLETED`, `CANCELLED`), `agreedAmount`, `currency` (default "INR"), `deliverableTerms`, `startDate`, `deadline`, `createdAt`, `updatedAt`.
6. **`CollaborationDeliverable`**:
   - `id`, `collaborationId`, `title`, `description`, `platform`, `dueDate`, `status` (`PENDING`, `SUBMITTED`, `CHANGES_REQUESTED`, `APPROVED`), `submissionUrl`, `notes`, `feedback`.
7. **`Notification`**:
   - `id`, `userId`, `title`, `message`, `type` (`CAMPAIGN_MATCH`, `APPLICATION_STATUS`, `COLLABORATION_UPDATE`, `SYNC_FAILURE`, `SYSTEM`), `isRead`, `linkUrl`, `createdAt`.
8. **`AuditLog`**:
   - `id`, `actorId`, `action`, `resourceType`, `resourceId`, `detailsJson`, `ipAddress`, `createdAt`.

---

## 4. SYSTEM IMPLEMENTATION PHASES & DEPENDENCY GRAPH

```
[Phase 0: Audit & Architecture Design] (Completed)
         ↓
[Phase 1: DB Schema Migration & Encryption Infrastructure]
         ↓
[Phase 2: Provider Integration Architecture (YouTube, Instagram, Twitch)]
         ↓
[Phase 3: Creator Studio (Verified Metrics, Media Kit, Content Library)]
         ↓
[Phase 4: Opportunity Engine & Explainable Matching Algorithm]
         ↓
[Phase 5: Brand Studio & Full Collaboration Lifecycle Workspace]
         ↓
[Phase 6: Admin Center, In-App Notifications & Trust/Privacy Workflows]
         ↓
[Phase 7: Comprehensive Automated Verification, Security Audit & Build]
```

### Phase Details

- **Phase 1: Database & Security Foundation**:
  - Implement `backend/src/utils/crypto.js` for AES-256-GCM encryption/decryption of tokens.
  - Apply Prisma schema update and push migration to Neon PostgreSQL.
  - Verify zero impact on existing tables and user accounts.

- **Phase 2: Social Media Integrations**:
  - Establish `backend/src/integrations/` with standardized `BaseProvider` interface.
  - Complete **YouTube Data API v3 & YouTube Analytics API** OAuth flow, channel stats, and video synchronisation.
  - Implement **Instagram Graph API / Instagram Login** provider with permission inspection and rate limiting.
  - Implement **Twitch Helix API** provider with OAuth token handling and stream metrics.
  - Store sync statuses transparently (`CONNECTED`, `EXPIRED`, `SYNC_FAILED`, `AWAITING_APPROVAL`).

- **Phase 3: Creator Studio & Automated Media Kit**:
  - Unified metrics calculation across connected accounts.
  - Historical snapshot tracking for follower growth and engagement.
  - Auto-generated, exportable, and shareable Media Kit with verified badges.
  - Content library with platform filters and sorting.

- **Phase 4: Explainable Opportunity Engine**:
  - Multi-variable deterministic matching algorithm:
    $$\text{MatchScore} = (w_1 \cdot \text{Niche}) + (w_2 \cdot \text{Platform}) + (w_3 \cdot \text{AudienceFit}) + (w_4 \cdot \text{EngagementFit})$$
  - Explainable recommendation breakdowns returned to the creator.

- **Phase 5: Brand Studio & Collaboration Workspace**:
  - Comprehensive campaign builder with targeting and deliverable criteria.
  - Creator discovery catalog with multi-attribute filtering (niches, verified followers, platforms).
  - 10-stage collaboration lifecycle with deliverable submissions, feedback loops, and completion tracking.

- **Phase 6: Notifications, Admin & Privacy**:
  - In-app notification center with real-time polling / read receipts.
  - Administrative moderation dashboard for platform health, account verifications, and audit logs.
  - GDPR/privacy compliant account data export and provider disconnection.

- **Phase 7: End-to-End Verification & Launch Readiness**:
  - Automated test suite covering new integration services, matching algorithm, and collaboration workflows.
  - Production build validation for frontend and backend.
  - Complete technical documentation and deployment blueprints.
