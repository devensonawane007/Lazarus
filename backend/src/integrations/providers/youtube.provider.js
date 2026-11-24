const BaseProvider = require("../base.provider");

class YouTubeProvider extends BaseProvider {
  constructor() {
    super("YOUTUBE");
    this.clientId = process.env.GOOGLE_CLIENT_ID || "";
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    this.redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${process.env.BACKEND_URL || "http://localhost:5000"}/api/integrations/youtube/callback`;
    this.scopes = [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/youtube.readonly"
    ];
  }

  isConfigured() {
    return Boolean(this.clientId && this.clientSecret);
  }

  getAuthUrl(state) {
    if (!this.isConfigured()) {
      return {
        configured: false,
        url: null,
        message: "Google OAuth credentials not configured in backend/.env"
      };
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: this.scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
      state: state || ""
    });

    return {
      configured: true,
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      state
    };
  }

  async exchangeCode(code) {
    if (!this.isConfigured()) {
      throw new Error("Google OAuth credentials missing");
    }

    const res = await fetch("https://oauth2.googleapis.com/token", {
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

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scopes: (data.scope || "").split(" ")
    };
  }

  async refreshToken(refreshToken) {
    if (!this.isConfigured()) {
      throw new Error("Google OAuth credentials missing");
    }

    const res = await fetch("https://oauth2.googleapis.com/token", {
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
      expiresIn: data.expires_in
    };
  }

  async getProfile(accessToken) {
    const res = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const data = await res.json();
    if (!res.ok || !data.items || data.items.length === 0) {
      throw new Error(data.error?.message || "No YouTube channel found for this Google account");
    }

    const ch = data.items[0];
    const snippet = ch.snippet || {};
    const stats = ch.statistics || {};

    return {
      platformAccountId: ch.id,
      username: snippet.customUrl || snippet.title || ch.id,
      displayName: snippet.title || "YouTube Creator",
      avatarUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || "",
      profileUrl: snippet.customUrl
        ? `https://youtube.com/${snippet.customUrl}`
        : `https://youtube.com/channel/${ch.id}`,
      followerCount: Number(stats.subscriberCount || 0),
      totalViews: BigInt(stats.viewCount || 0),
      videoCount: Number(stats.videoCount || 0),
      uploadsPlaylistId: ch.contentDetails?.relatedPlaylists?.uploads || null,
      rawStats: stats
    };
  }

  async getContent(accessToken, externalAccountId, options = {}) {
    const uploadsPlaylistId = options.uploadsPlaylistId;
    if (!uploadsPlaylistId) {
      // Look up playlist id
      const profile = await this.getProfile(accessToken);
      if (!profile.uploadsPlaylistId) return [];
      return this.getContent(accessToken, externalAccountId, {
        uploadsPlaylistId: profile.uploadsPlaylistId,
        maxResults: options.maxResults || 20
      });
    }

    const maxResults = options.maxResults || 20;
    const playListRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const playlistData = await playListRes.json();
    if (!playListRes.ok || !playlistData.items) {
      return [];
    }

    const videoIds = playlistData.items
      .map((item) => item.contentDetails?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) return [];

    // Fetch video stats
    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(",")}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const videoData = await videoRes.json();
    if (!videoRes.ok || !videoData.items) return [];

    return videoData.items.map((v) => ({
      externalContentId: v.id,
      platform: "YOUTUBE",
      title: v.snippet?.title || "Untitled Video",
      description: v.snippet?.description || "",
      thumbnailUrl:
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
        favoriteCount: v.statistics?.favoriteCount
      }
    }));
  }

  async getMetrics(accessToken, externalAccountId) {
    const profile = await this.getProfile(accessToken);
    const content = await this.getContent(accessToken, externalAccountId, {
      uploadsPlaylistId: profile.uploadsPlaylistId,
      maxResults: 15
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

    return {
      platform: "YOUTUBE",
      followerCount: profile.followerCount,
      totalViews: profile.totalViews,
      videoCount: profile.videoCount,
      recentAvgViews: content.length > 0 ? Math.round(totalViewsOnRecent / content.length) : 0,
      engagementRate,
      recentContentCount: content.length
    };
  }

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
}

module.exports = new YouTubeProvider();
