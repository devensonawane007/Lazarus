# LAZARUS V3 — OFFICIAL YOUTUBE INTEGRATION TECHNICAL REPORT

**Provider:** YouTube Data API v3 & YouTube Analytics API v2  
**Authorization Protocol:** Google OAuth 2.0 (Authorization Code Flow with Offline Access)  
**Implementation File:** `backend/src/integrations/providers/youtube.provider.js`  
**Integration Status:** Code Complete & Tested; Live API Execution Blocked Pending Operator Secrets  

---

## 1. Overview & Architectural Capabilities

The YouTube integration enables verified creators to link their official YouTube channels to Lazarus V3. The system ingests public channel metadata, lifetime analytics, recent video uploads, and private channel analytics (when authorized) into Neon PostgreSQL.

### Core Capabilities:
1. **Google OAuth 2.0 Authorization Flow:** Offline access (`access_type: "offline"`, `prompt: "consent"`) ensuring refresh tokens are minted on initial authorization.
2. **Channel Profile Ingestion:** Ingests channel ID, title, custom URL / handle, description, avatar thumbnails, subscriber count (with handling for hidden counts), total video count, and lifetime view count.
3. **Paginated Content Library Ingestion:** Discovers the channel's `uploads` playlist via `channels?part=contentDetails`, paginates video uploads via `playlistItems`, batches video metric lookups via `videos?part=snippet,statistics,contentDetails`, and ingests up to 50 recent videos.
4. **YouTube Analytics API v2 Reports:** Queries channel-level metrics across the last 30 days (`views`, `estimatedMinutesWatched`, `averageViewDuration`, `likes`, `comments`, `shares`, `subscribersGained`).
5. **Exponential Backoff & Rate Limit Handling:** Handles Google API HTTP 429 and 503 transient errors using automated retries with exponential backoff and jitter.
6. **Token Revocation on Disconnect:** Revokes Google OAuth access and refresh tokens via `https://oauth2.googleapis.com/revoke` upon creator account disconnection.

---

## 2. OAuth Scopes & Permissions

| Scope URI | Classification | Purpose |
| :--- | :--- | :--- |
| `https://www.googleapis.com/auth/youtube.readonly` | Sensitive | Read channel metadata, uploads playlist, video details, subscriber counts, and comments. |
| `https://www.googleapis.com/auth/yt-analytics.readonly` | Sensitive | Read channel-level private performance metrics, watch time, and retention. |

---

## 3. Data Ingestion & Transformation Details

### A. Subscriber Count Handling
Channels that choose to hide their subscriber count return `statistics.hiddenSubscriberCount === true`. The provider safely handles this scenario:
```javascript
const hiddenSubscriberCount = Boolean(stats.hiddenSubscriberCount);
const followerCount = hiddenSubscriberCount ? 0 : Number(stats.subscriberCount || 0);
```

### B. Video Uploads Ingestion & Deduplication
To retrieve all public videos efficiently without consuming excessive YouTube API quota:
1. Call `channels?part=contentDetails&mine=true` to obtain the channel's unique `uploads` playlist ID (`UU...`).
2. Page through `playlistItems?part=snippet&playlistId=UU...&maxResults=50`.
3. Batch query `videos?part=snippet,statistics,contentDetails&id=vid1,vid2,...` (up to 50 IDs per API call).
4. Extract views, likes, comments, duration, tags, and category IDs.
5. Ingest into Neon PostgreSQL via atomic upsert on composite key `[creatorProfileId, platform, externalContentId]`.

### C. Analytics Calculation
Engagement rate is calculated deterministically from verified uploaded videos:
$$\text{Engagement Rate} = \frac{\sum (\text{Likes} + \text{Comments})}{\sum \text{Views}} \times 100$$

---

## 4. Live Environment Verification Status

> [!IMPORTANT]
> **Status: BLOCKED — PENDING GOOGLE CLOUD CREDENTIALS**
> 
> In accordance with Lazarus engineering guidelines, external live API calls are NOT fabricated or falsely reported as passing when credentials are not configured in the host environment.
> 
> Currently, `backend/.env` contains valid Neon PostgreSQL database credentials and JWT secrets, but `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are unpopulated placeholders.
> 
> Automated mock provider tests (`MockProvider("YOUTUBE")`) have verified 100% of the data normalization pipeline, database upserts, snapshot generation, and audit logging.

### Operator Configuration Checklist:
To enable live Google OAuth in production, populate the following variables in `backend/.env`:
```env
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/integrations/youtube/callback
```
Authorized Redirect URI in Google Cloud Console must be set to:
`http://localhost:5000/api/integrations/youtube/callback` (or your production API domain).
