const BaseProvider = require("../base.provider");

/**
 * LAZARUS V3 OFFICIAL YOUTUBE PROVIDER
 *
 * Implements:
 * 1. Google OAuth 2.0 Authorization Code flow with offline access (refresh tokens)
 * 2. YouTube Data API v3 Channel import (public statistics, uploads playlist, rounded sub counts)
 * 3. YouTube Data API v3 Content ingestion with pagination & duplicate prevention
 * 4. YouTube Analytics API v2 integration for authorized private analytics (views, watch time, sub gain/loss)
 * 5. Exponential backoff retry handling for transient API errors and rate limits
 * 6. Clean disconnection and token revocation
 */
class YouTubeProvider extends BaseProvider {
  constructor() {
    super("YOUTUBE");
    this.clientId = process.env.GOOGLE_CLIENT_ID || "";
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    this.redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${process.env.BACKEND_URL || "http://localhost:5000"}/api/integrations/youtube/callback`;

    // Standard scopes: Identity + YouTube Data API v3
    this.baseScopes = [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/youtube.readonly"
    ];

    // Optional sensitive scope for private YouTube Analytics API
    this.analyticsScope = "https://www.googleapis.com/auth/yt-analytics.readonly";
  }

  /**
   * Check if Google OAuth app credentials are configured
   */
  isConfigured() {
    return Boolean(this.clientId && this.clientSecret);
  }

  /**
   * Generate Google OAuth authorization URL
   * @param {string} state - Signed, time-limited, single-use CSRF state token
   * @param {boolean} [includeAnalytics=true] - Whether to request YouTube Analytics scope
   */
  getAuthUrl(state, includeAnalytics = true) {
    if (!this.isConfigured()) {
      return {
        configured: false,
        url: null,
        message: "Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) not configured in backend/.env"
      };
    }

    const scopes = [...this.baseScopes];
    if (includeAnalytics) {
      scopes.push(this.analyticsScope);
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      access_type: "offline", // Required to receive a refresh token
      prompt: "consent", // Force consent prompt to guarantee refresh token delivery
      include_granted_scopes: "true",
      state: state || ""
    });

    return {
      configured: true,
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      state
    };
  }

  /**
   * Exchange OAuth authorization code for access and refresh tokens
   */
  async exchangeCode(code) {
    if (!this.isConfigured()) {
      throw new Error("Google OAuth credentials missing from environment");
    }

    const res = await this.fetchWithRetry("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code"
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error_description || data.error || "Failed to exchange Google OAuth code");
    }

    const grantedScopes = (data.scope || "").split(" ");

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || null,
      expiresIn: data.expires_in || 3600,
      scopes: grantedScopes,
      hasAnalyticsScope: grantedScopes.includes(this.analyticsScope)
    };
  }

  /**
   * Refresh expired access token using refresh token
   */
  async refreshToken(refreshToken) {
    if (!this.isConfigured()) {
      throw new Error("Google OAuth credentials missing from environment");
    }

    const res = await this.fetchWithRetry("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token"
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error_description || "Failed to refresh Google access token");
    }

    return {
      accessToken: data.access_token,
      newRefreshToken: data.refresh_token || null,
      expiresIn: data.expires_in || 3600
    };
  }

  /**
   * Import channel profile information using YouTube Data API v3
   */
  async getProfile(accessToken) {
    const url = "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,status&mine=true";
    const res = await this.fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const data = await res.json();
    if (!res.ok || !data.items || data.items.length === 0) {
      const errMsg = data.error?.message || "No YouTube channel found for the authenticated Google account";
      throw new Error(errMsg);
    }

    const ch = data.items[0];
    const snippet = ch.snippet || {};
    const stats = ch.statistics || {};
    const contentDetails = ch.contentDetails || {};

    const isHiddenSubs = Boolean(stats.hiddenSubscriberCount);
    const subCount = isHiddenSubs ? 0 : Number(stats.subscriberCount || 0);

    return {
      platformAccountId: ch.id,
      username: snippet.customUrl || snippet.title || ch.id,
      displayName: snippet.title || "YouTube Creator",
      description: snippet.description || "",
      avatarUrl:
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url ||
        "",
      profileUrl: snippet.customUrl
        ? `https://youtube.com/${snippet.customUrl}`
        : `https://youtube.com/channel/${ch.id}`,
      followerCount: subCount,
      isSubCountHidden: isHiddenSubs,
      totalViews: BigInt(stats.viewCount || 0),
      videoCount: Number(stats.videoCount || 0),
      uploadsPlaylistId: contentDetails.relatedPlaylists?.uploads || null,
      publishedAt: snippet.publishedAt ? new Date(snippet.publishedAt) : null,
      country: snippet.country || null,
      rawStats: stats
    };
  }

  /**
   * Ingest recent content uploads with pagination & duplicate prevention
   */
  async getContent(accessToken, externalAccountId, options = {}) {
    let uploadsPlaylistId = options.uploadsPlaylistId;
    if (!uploadsPlaylistId) {
      const profile = await this.getProfile(accessToken);
      uploadsPlaylistId = profile.uploadsPlaylistId;
      if (!uploadsPlaylistId) return [];
    }

    const maxResults = Math.min(50, options.maxResults || 25);
    const pageToken = options.pageToken ? `&pageToken=${options.pageToken}` : "";

    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}${pageToken}`;
    const playlistRes = await this.fetchWithRetry(playlistUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const playlistData = await playlistRes.json();
    if (!playlistRes.ok || !playlistData.items || playlistData.items.length === 0) {
      return [];
    }

    const videoIds = playlistData.items
      .map((item) => item.contentDetails?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) return [];

    // Retrieve detailed statistics and snippets for these videos
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,status&id=${videoIds.join(",")}`;
    const videoRes = await this.fetchWithRetry(videosUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const videoData = await videoRes.json();
    if (!videoRes.ok || !videoData.items) return [];

    return videoData.items.map((v) => ({
      externalContentId: v.id,
      platform: "YOUTUBE",
      title: v.snippet?.title || "Untitled Video",
      description: v.snippet?.description || "",
      thumbnailUrl:
        v.snippet?.thumbnails?.maxres?.url ||
        v.snippet?.thumbnails?.high?.url ||
        v.snippet?.thumbnails?.medium?.url ||
        v.snippet?.thumbnails?.default?.url ||
        "",
      contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
      publishedAt: new Date(v.snippet?.publishedAt || Date.now()),
      viewCount: Number(v.statistics?.viewCount || 0),
      likeCount: Number(v.statistics?.likeCount || 0),
      commentCount: Number(v.statistics?.commentCount || 0),
      metricsJson: {
        duration: v.contentDetails?.duration,
        dimension: v.contentDetails?.dimension,
        definition: v.contentDetails?.definition,
        caption: v.contentDetails?.caption,
        privacyStatus: v.status?.privacyStatus,
        tags: (v.snippet?.tags || []).slice(0, 10)
      }
    }));
  }

  /**
   * Retrieve authorized private analytics via YouTube Analytics API v2
   * Returns null if analytics scope was not authorized
   */
  async getAuthorizedAnalytics(accessToken, options = {}) {
    const endDate = options.endDate || new Date().toISOString().split("T")[0];
    const startDateDate = new Date();
    startDateDate.setDate(startDateDate.getDate() - (options.days || 30));
    const startDate = options.startDate || startDateDate.toISOString().split("T")[0];

    const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost`;

    try {
      const res = await this.fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const data = await res.json();
      if (!res.ok || !data.rows || data.rows.length === 0) {
        return {
          isAuthorized: false,
          reason: data.error?.message || "No analytics data returned for the requested period"
        };
      }

      // Column headers: [views, estimatedMinutesWatched, averageViewDuration, subscribersGained, subscribersLost]
      const row = data.rows[0];
      return {
        isAuthorized: true,
        startDate,
        endDate,
        views: Number(row[0] || 0),
        estimatedMinutesWatched: Number(row[1] || 0),
        averageViewDurationSec: Number(row[2] || 0),
        subscribersGained: Number(row[3] || 0),
        subscribersLost: Number(row[4] || 0),
        netSubscribers: Number((row[3] || 0) - (row[4] || 0))
      };
    } catch (err) {
      return {
        isAuthorized: false,
        reason: `Analytics API unavailable: ${err.message}`
      };
    }
  }

  /**
   * Ingest and calculate aggregated metrics
   */
  async getMetrics(accessToken, externalAccountId) {
    const profile = await this.getProfile(accessToken);
    const content = await this.getContent(accessToken, externalAccountId, {
      uploadsPlaylistId: profile.uploadsPlaylistId,
      maxResults: 20
    });

    let totalViewsOnRecent = 0;
    let totalEngagementsOnRecent = 0;

    content.forEach((c) => {
      totalViewsOnRecent += c.viewCount;
      totalEngagementsOnRecent += c.likeCount + c.commentCount;
    });

    const engagementRate =
      totalViewsOnRecent > 0
        ? Number(((totalEngagementsOnRecent / totalViewsOnRecent) * 100).toFixed(2))
        : 0.0;

    // Optional private analytics
    const privateAnalytics = await this.getAuthorizedAnalytics(accessToken, { days: 30 });

    return {
      platform: "YOUTUBE",
      followerCount: profile.followerCount,
      isSubCountHidden: profile.isSubCountHidden,
      totalViews: profile.totalViews,
      videoCount: profile.videoCount,
      recentAvgViews: content.length > 0 ? Math.round(totalViewsOnRecent / content.length) : 0,
      engagementRate,
      recentContentCount: content.length,
      privateAnalytics
    };
  }

  /**
   * Revoke OAuth token upon user disconnect
   */
  async revokeAccess(token) {
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fetch helper with exponential backoff for transient HTTP errors
   */
  async fetchWithRetry(url, options, maxRetries = 3) {
    let delay = 500;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, options);

        // If rate limited (429) or transient server error (500, 502, 503), retry with backoff
        if ([429, 500, 502, 503].includes(res.status) && attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }

        return res;
      } catch (err) {
        if (attempt === maxRetries) throw err;
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }
}

module.exports = new YouTubeProvider();
