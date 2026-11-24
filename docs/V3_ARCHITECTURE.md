# LAZARUS V3 SYSTEM ARCHITECTURE
**Creator Studio & Opportunity Network**

## 1. HIGH-LEVEL ARCHITECTURAL OVERVIEW

Lazarus V3 operates as an integrated, multi-role SaaS application connecting content creators and commercial brands. The architecture is built around three core pillars:
1. **Verified Creator Identity & Performance Core**: Official OAuth platform connectors that ingest, normalize, and continuously snapshot real performance metrics directly from YouTube, Instagram, and Twitch APIs.
2. **Deterministic & Explainable Opportunity Matching Engine**: A multi-criteria scoring pipeline matching brand campaign briefs with verified creator profiles.
3. **Structured Collaboration & Deliverable Workspace**: An auditable 10-stage lifecycle governing campaign discovery, application, negotiation, in-app agreements, asset submissions, revisions, and deliverable approvals.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        LAZARUS V3 FRONTEND                             │
│       React 19 + Vite 7 + Tailwind-Grade Theme Tokens + App Shell      │
├───────────────────┬───────────────────┬────────────────────────────────┤
│  CREATOR STUDIO   │   BRAND STUDIO    │       ADMIN WORKSPACE          │
│ • Unified Stats   │ • Campaign Studio │ • Platform Health & Sync Status│
│ • Content Library │ • Creator Catalog │ • Moderation & Verifications   │
│ • Media Kit Gen   │ • Applications    │ • Audit Logs & System Activity │
│ • Opportunities   │ • Collaborations  │ • User Privacy & Data Deletion │
└─────────┬─────────┴─────────┬─────────┴────────────────┬───────────────┘
          │                   │                          │
          └───────────────────┼──────────────────────────┘
                              │ HTTPS / REST API
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        LAZARUS V3 BACKEND                              │
│              Node.js + Express 5 Modular Architecture                  │
├────────────────────────────────────────────────────────────────────────┤
│ • Security: JWT Auth, RBAC, Anti-IDOR, AES-256 Token Encryption        │
│ • Core Services:                                                       │
│   ├── /api/integrations/ (YouTube, Instagram, Twitch OAuth & Sync)     │
│   ├── /api/creator/ (Unified Analytics, Content, Media Kit)            │
│   ├── /api/brand/ (Campaign Management, Creator Discovery)             │
│   ├── /api/matching/ (Deterministic Scoring & Explainability Engine)   │
│   ├── /api/collaborations/ (10-Stage Deliverable Lifecycle)            │
│   ├── /api/notifications/ (In-App Notification Dispatcher)             │
│   ├── /api/admin/ (Operations, Health Monitoring & Audit Logs)         │
│   └── /api/ai/ (Brief Interpretation & Content Blueprints via Gemini)  │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ Prisma ORM 6
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     NEON POSTGRESQL (HOSTED CLOUD)                     │
│  users, creator_profiles, brand_profiles, social_accounts,             │
│  social_credentials, creator_contents, creator_metric_snapshots,       │
│  campaigns, campaign_applications, collaborations, deliverables,       │
│  mou_agreements, notifications, audit_logs                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. MODULAR BACKEND ORGANIZATION

```text
backend/src/
├── server.js                          # Express initialization & route registry
├── config/
│   ├── env.js                         # Centralized environment variable validation
│   └── constants.js                   # Enums, roles, and status definitions
├── db/
│   └── prisma.js                      # Prisma client singleton instance
├── utils/
│   ├── crypto.js                      # AES-256-GCM token encryption & decryption
│   └── logger.js                      # Structured JSON production logging
├── middleware/
│   ├── auth.middleware.js             # JWT extraction, verification & RBAC guard
│   ├── ownership.middleware.js        # Anti-IDOR resource ownership verifications
│   └── error.middleware.js            # Standardized error responses
├── integrations/
│   ├── base.provider.js               # Abstract Provider class definition
│   ├── token.service.js               # OAuth token encryption, storage & refresh
│   ├── sync.service.js                # Background sync execution & error tracking
│   └── providers/
│       ├── youtube.provider.js        # Google OAuth2 + Data API v3 + Analytics API
│       ├── instagram.provider.js      # Meta Instagram Login / Graph API
│       └── twitch.provider.js         # Twitch OAuth & Helix API
├── services/
│   ├── metrics.service.js             # Cross-platform aggregation & historical snapshots
│   ├── matching.service.js            # Multi-variable deterministic matching algorithm
│   ├── collaboration.service.js       # 10-stage collaboration state machine
│   ├── notification.service.js        # Notification emission and query handler
│   └── audit.service.js               # System-wide audit log dispatcher
├── controllers/
│   ├── auth.controller.js             # User registration, login, profile retrieval
│   ├── integration.controller.js      # OAuth initiate, callback, sync, disconnect
│   ├── creator.controller.js          # Creator profile, analytics, content, media kit
│   ├── brand.controller.js            # Campaign operations, creator discovery
│   ├── collaboration.controller.js    # Collaboration workspace & deliverables
│   ├── notification.controller.js     # User notification retrieval & read receipts
│   └── admin.controller.js            # System health, user management, audit logs
└── routes/
    ├── auth.routes.js
    ├── integration.routes.js
    ├── creator.routes.js
    ├── brand.routes.js
    ├── collaboration.routes.js
    ├── notification.routes.js
    └── admin.routes.js
```

---

## 3. SECURITY & TOKEN ENCRYPTION ARCHITECTURE

Third-party OAuth refresh tokens provide long-term access to external platform APIs. In Lazarus V3:
1. Refresh and access tokens are **never** stored in plaintext.
2. The `backend/src/utils/crypto.js` module uses AES-256-GCM authenticated encryption.
3. Every encryption operation produces an encrypted ciphertext, a random 12-byte initialization vector (`iv`), and a 16-byte authentication tag (`tag`).
4. Decryption validates the auth tag to guarantee ciphertext integrity before returning credentials to the provider client.
5. Tokens are never transmitted to the frontend or printed in server logs.

---

## 4. MULTI-VARIABLE MATCHING ENGINE

The Lazarus V3 matching engine evaluates campaign eligibility deterministically across 4 weighted dimensions:
1. **Niche Compatibility (35%)**: Jaccard similarity and category overlap between creator niches and campaign requirements.
2. **Platform Alignment (25%)**: Whether the creator has active, connected accounts on the platforms required by the campaign brief.
3. **Audience Scale Compatibility (20%)**: Whether the creator's verified follower tier meets the campaign's minimum/target reach.
4. **Engagement Quality (20%)**: Comparison of creator average engagement rate against campaign engagement benchmarks.

Every recommendation returns a detailed JSON breakdown:
```json
{
  "overallScore": 88,
  "breakdown": {
    "nicheScore": 95,
    "platformScore": 100,
    "audienceScore": 80,
    "engagementScore": 75
  },
  "explanation": "Strong match: Your technology content, verified YouTube presence (24k subs), and 4.2% engagement rate align with this campaign's criteria."
}
```
