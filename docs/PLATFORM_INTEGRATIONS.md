# LAZARUS V3 PLATFORM INTEGRATIONS ARCHITECTURE & SPECIFICATION

This document details the official API specifications, OAuth 2.0 protocols, scopes, rate limits, quota considerations, and data schemas for YouTube, Instagram, and Twitch integrations.

---

## 1. INTEGRATION ARCHITECTURE OVERVIEW

All platform integrations inherit from a unified `BaseProvider` contract located in `backend/src/integrations/base.provider.js`:

```text
BaseProvider
├── getAuthUrl(state) -> { url, state }
├── exchangeCode(code) -> { tokens, profile }
├── refreshToken(refreshToken) -> { accessToken, expiresIn, newRefreshToken? }
├── getProfile(accessToken) -> NormalizedProfile
├── getContent(accessToken, externalAccountId, options) -> NormalizedContent[]
├── getMetrics(accessToken, externalAccountId) -> NormalizedMetrics
└── revokeAccess(token) -> boolean
```

### Connection State Lifecycle

Connections strictly transition through verified states:
- `CONNECTED`: Active OAuth token and recent successful synchronization.
- `SYNC_PENDING`: Synchronization scheduled or in-progress.
- `EXPIRED`: Access token expired and requires refresh via refresh token.
- `REVOKED`: User or platform revoked permissions; requires re-authorization.
- `SYNC_FAILED`: API error occurred during sync (persisted in `syncError`).
- `AWAITING_APPROVAL`: Platform developer permission pending Meta/Google/Twitch app review.
- `DISCONNECTED`: User intentionally unlinked account; credentials destroyed.

---

## 2. PROVIDER 1: YOUTUBE (GOOGLE)

### Official Documentation & APIs
- **Google Identity / OAuth 2.0**: `https://developers.google.com/identity/protocols/oauth2/web-server`
- **YouTube Data API v3**: `https://developers.google.com/youtube/v3`
- **YouTube Analytics API**: `https://developers.google.com/youtube/analytics`

### OAuth 2.0 Scopes
| Scope | Purpose | App Review Tier |
|---|---|---|
| `openid email profile` | Authenticate creator Google identity | Basic (No review) |
| `https://www.googleapis.com/auth/youtube.readonly` | Read channel statistics, snippet, playlists, and uploaded videos | Sensitive (Verification required for production) |
| `https://www.googleapis.com/auth/yt-analytics.readonly` | Read channel watch time, views, subscriber gains/losses, and private analytics | Restricted (CASA Tier 2 Assessment required for production) |

### Endpoints Used
1. **OAuth Token Exchange**: `POST https://oauth2.googleapis.com/token`
2. **Channel Profile & Lifetime Statistics**:
   - `GET https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true`
   - Returns: `channelId`, `title`, `description`, `thumbnails`, `subscriberCount`, `viewCount`, `videoCount`, and `uploads` playlist ID.
3. **Public Content Ingestion**:
   - `GET https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId={uploadsPlaylistId}&maxResults=25`
   - `GET https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id={videoIds}`
   - Ingests video title, publish date, thumbnails, `viewCount`, `likeCount`, `commentCount`.
4. **Authorized Private Analytics (when permitted)**:
   - `GET https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate={30DaysAgo}&endDate={Today}&metrics=views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost`
   - Maps estimated watch time and net subscriber velocity.

### Quota & Rate Limit Architecture
- YouTube Data API v3 provides a default quota of **10,000 units/day**.
  - `channels.list`: 1 unit
  - `playlistItems.list`: 1 unit
  - `videos.list`: 1 unit
- Sync runs on demand or cached intervals (maximum once per hour per creator) to preserve quota.
- When `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` are unconfigured, provider cleanly returns `CONFIG_REQUIRED` without fabricating fake data.

---

## 3. PROVIDER 2: INSTAGRAM (META GRAPH API)

### Official Documentation
- **Instagram Graph API**: `https://developers.facebook.com/docs/instagram-platform/instagram-graph-api`
- **Instagram Login for Creators**: `https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login`

### OAuth & Eligibility Prerequisites
- Requires an **Instagram Professional Account** (Creator or Business), either connected to a Facebook Page or authorized via Instagram Login for Business.
- Personal accounts do not provide API access to media insights or metrics.

### OAuth 2.0 Scopes & Permissions
| Permission | Description | Access Tier |
|---|---|---|
| `instagram_basic` | Read basic user profile info and public media | Advanced Access (App Review) |
| `instagram_manage_insights` | Read media performance, impressions, reach, profile views, and follower count | Advanced Access (App Review + Business Verification) |
| `pages_show_list` | Find connected Facebook pages to locate the Instagram Business Account | Advanced Access (App Review) |

### Endpoints Used
1. **Token Exchange & Long-Lived Token Exchange**:
   - `GET https://graph.facebook.com/v19.0/oauth/access_token`
   - `GET https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id={id}&client_secret={secret}&fb_exchange_token={shortToken}` (yields 60-day token).
2. **Account Discovery**:
   - `GET https://graph.facebook.com/v19.0/me/accounts` -> retrieves connected Facebook Page.
   - `GET https://graph.facebook.com/v19.0/{page-id}?fields=instagram_business_account` -> retrieves Instagram Business Account ID.
3. **Profile & Follower Counts**:
   - `GET https://graph.facebook.com/v19.0/{ig-user-id}?fields=id,username,name,profile_picture_url,biography,followers_count,follows_count,media_count`
4. **Media Ingestion & Insights**:
   - `GET https://graph.facebook.com/v19.0/{ig-user-id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count`
   - Insights (Media level): `GET https://graph.facebook.com/v19.0/{ig-media-id}/insights?metric=impressions,reach,saved,engagement`

### Transparency Notice
- If Meta App Review has not approved `instagram_manage_insights`, reach and private impressions are flagged as `AWAITING_APPROVAL` and will not be displayed as 0.

---

## 4. PROVIDER 3: TWITCH (HELIX API)

### Official Documentation
- **Twitch Developers Documentation**: `https://dev.twitch.tv/docs/api/`
- **Twitch OAuth Authorization Code Flow**: `https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#authorization-code-grant-flow`

### OAuth 2.0 Scopes
| Scope | Description |
|---|---|
| `user:read:email` | Read user email for account verification |
| `user:read:broadcast` | Read broadcast configuration |
| `channel:read:subscriptions` | Read subscriber count (Broadcaster only) |

### Endpoints Used
1. **OAuth Token Exchange & Refresh**:
   - `POST https://id.twitch.tv/oauth2/token`
2. **Broadcaster Profile & Stream Info**:
   - `GET https://api.twitch.tv/helix/users` (Header: `Client-Id`, `Authorization: Bearer {token}`)
   - Returns: `id`, `login`, `display_name`, `profile_image_url`, `description`, `view_count`.
3. **Follower Count**:
   - `GET https://api.twitch.tv/helix/channels/followers?broadcaster_id={broadcasterId}` -> `total` followers.
4. **Recent Videos & Clips**:
   - `GET https://api.twitch.tv/helix/videos?user_id={broadcasterId}&first=20`
   - Returns title, duration, view_count, thumbnail_url, created_at, url.
5. **Live Stream Status**:
   - `GET https://api.twitch.tv/helix/streams?user_id={broadcasterId}`
   - Captures current live status, viewer count, and game/category.

---

## 5. MOCK PROVIDER ENGINE FOR LOCAL DEVELOPMENT & CI

To ensure test repeatability and development velocity without requiring live platform credentials:
- If credentials (`GOOGLE_CLIENT_ID`, `INSTAGRAM_CLIENT_ID`, `TWITCH_CLIENT_ID`) are absent in the local development environment, the provider service transparently signals:
  `{ status: "AWAITING_CONFIG", message: "Live OAuth credentials pending configuration. Set in backend/.env" }`.
- For automated testing suites (`npm test`), specialized mock fixtures in `backend/src/integrations/providers/mock.provider.js` simulate exact official response shapes to verify ingestion, snapshot creation, and error handling without hitting external networks.
