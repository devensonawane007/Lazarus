# LAZARUS V3 DATABASE SCHEMA EVOLUTION

This document records all database alterations required to transform Lazarus V2 into Lazarus V3.

## 1. PRESERVATION COMMITMENT
- All existing V2 models (`users`, `creator_profiles`, `brand_profiles`, `investor_profiles`, `projects`, `expense_items`, `milestones`, `submissions`, `investments`, `escrow_transactions`, `campaigns`, `campaign_applications`, `mou_agreements`) are **retained and untouched** to prevent data loss.
- Foreign keys and existing relationships remain intact.
- New models link gracefully to `users`, `creator_profiles`, `brand_profiles`, and `campaigns`.

## 2. NEW ENUMS

```prisma
enum SocialPlatform {
  YOUTUBE
  INSTAGRAM
  TWITCH
}

enum ConnectionStatus {
  CONNECTED
  EXPIRED
  REVOKED
  SYNC_FAILED
  SYNC_PENDING
  AWAITING_APPROVAL
  DISCONNECTED
}

enum CollaborationStatus {
  DISCOVERED
  APPLIED
  SHORTLISTED
  NEGOTIATION
  ACCEPTED
  IN_PROGRESS
  SUBMITTED
  REVISION_REQUESTED
  APPROVED
  COMPLETED
  REJECTED
  CANCELLED
}

enum DeliverableStatus {
  PENDING
  SUBMITTED
  CHANGES_REQUESTED
  APPROVED
}

enum NotificationType {
  CAMPAIGN_MATCH
  APPLICATION_STATUS
  COLLABORATION_UPDATE
  DELIVERABLE_SUBMITTED
  DELIVERABLE_APPROVED
  SYNC_FAILURE
  SYSTEM
}
```

## 3. NEW TABLES & RELATIONS

### `social_accounts`
Maps a connected third-party social account to a `creator_profiles` record.
- `id`: String (UUID, PK)
- `creatorProfileId`: String (FK -> `creator_profiles.id`, Cascade)
- `platform`: SocialPlatform
- `platformAccountId`: String (Channel ID, Instagram Account ID, Twitch User ID)
- `username`: String
- `displayName`: String
- `avatarUrl`: String?
- `profileUrl`: String?
- `status`: ConnectionStatus (default: CONNECTED)
- `scopes`: String[]
- `lastSyncedAt`: DateTime?
- `syncError`: String?
- `createdAt`, `updatedAt`: DateTime
- *Constraint*: `@@unique([creatorProfileId, platform, platformAccountId])`

### `social_credentials`
Stores encrypted OAuth credentials in 1-to-1 relation with `social_accounts`.
- `id`: String (UUID, PK)
- `socialAccountId`: String (FK -> `social_accounts.id`, Cascade, Unique)
- `encryptedAccessToken`: String (Text)
- `encryptedRefreshToken`: String? (Text)
- `tokenExpiresAt`: DateTime?
- `iv`: String
- `tag`: String
- `updatedAt`: DateTime

### `creator_contents`
Synchronized public videos, posts, reels, or stream clips from authorized APIs.
- `id`: String (UUID, PK)
- `creatorProfileId`: String (FK -> `creator_profiles.id`, Cascade)
- `platform`: SocialPlatform
- `externalContentId`: String
- `title`: String
- `description`: String? (Text)
- `thumbnailUrl`: String?
- `contentUrl`: String
- `publishedAt`: DateTime
- `viewCount`: Int @default(0)
- `likeCount`: Int @default(0)
- `commentCount`: Int @default(0)
- `metricsJson`: Json?
- `createdAt`: DateTime
- *Constraint*: `@@unique([creatorProfileId, platform, externalContentId])`

### `creator_metric_snapshots`
Periodic historical snapshots capturing creator metrics for trend analysis.
- `id`: String (UUID, PK)
- `creatorProfileId`: String (FK -> `creator_profiles.id`, Cascade)
- `platform`: SocialPlatform
- `followerCount`: Int @default(0)
- `totalViews`: BigInt @default(0)
- `engagementRate`: Float @default(0.0)
- `watchTimeMinutes`: Float?
- `snapshotDate`: DateTime @default(now())
- `createdAt`: DateTime

### `collaborations`
Expanded 10-stage lifecycle entity between a creator and a brand campaign.
- `id`: String (UUID, PK)
- `campaignId`: String (FK -> `campaigns.id`, Cascade)
- `creatorProfileId`: String (FK -> `creator_profiles.id`, Cascade)
- `brandProfileId`: String (FK -> `brand_profiles.id`, Cascade)
- `status`: CollaborationStatus (default: APPLIED)
- `agreedAmount`: Float
- `currency`: String @default("INR")
- `deliverableTerms`: String? (Text)
- `startDate`: DateTime?
- `deadline`: DateTime?
- `createdAt`, `updatedAt`: DateTime
- *Constraint*: `@@unique([campaignId, creatorProfileId])`

### `collaboration_deliverables`
Specific milestones/deliverables within a collaboration.
- `id`: String (UUID, PK)
- `collaborationId`: String (FK -> `collaborations.id`, Cascade)
- `title`: String
- `description`: String? (Text)
- `platform`: SocialPlatform?
- `dueDate`: DateTime?
- `status`: DeliverableStatus (default: PENDING)
- `submissionUrl`: String?
- `notes`: String? (Text)
- `brandFeedback`: String? (Text)
- `submittedAt`: DateTime?
- `reviewedAt`: DateTime?
- `createdAt`, `updatedAt`: DateTime

### `notifications`
In-app user notifications.
- `id`: String (UUID, PK)
- `userId`: String (FK -> `users.id`, Cascade)
- `title`: String
- `message`: String (Text)
- `type`: NotificationType
- `isRead`: Boolean @default(false)
- `linkUrl`: String?
- `createdAt`: DateTime

### `audit_logs`
System security and administration trail.
- `id`: String (UUID, PK)
- `actorId`: String? (FK -> `users.id`, SetNull)
- `action`: String
- `resourceType`: String
- `resourceId`: String?
- `detailsJson`: Json?
- `ipAddress`: String?
- `createdAt`: DateTime @default(now())
