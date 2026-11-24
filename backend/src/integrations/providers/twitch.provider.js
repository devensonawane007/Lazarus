const BaseProvider = require("../base.provider");

class TwitchProvider extends BaseProvider {
  constructor() {
    super("TWITCH");
    this.clientId = process.env.TWITCH_CLIENT_ID || "";
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET || "";
    this.redirectUri =
      process.env.TWITCH_REDIRECT_URI ||
      `${process.env.BACKEND_URL || "http://localhost:5000"}/api/integrations/twitch/callback`;
    this.scopes = ["user:read:email", "user:read:broadcast"];
  }

  isConfigured() {
    return Boolean(this.clientId && this.clientSecret);
  }

  getAuthUrl(state) {
    if (!this.isConfigured()) {
      return {
        configured: false,
        url: null,
        message: "Twitch OAuth credentials not configured in backend/.env"
      };
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: this.scopes.join(" "),
      state: state || ""
    });

    return {
      configured: true,
      url: `https://id.twitch.tv/oauth2/authorize?${params.toString()}`,
      state
    };
  }

  async exchangeCode(code) {
    if (!this.isConfigured()) {
      throw new Error("Twitch credentials missing");
    }

    const res = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: this.redirectUri
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to exchange Twitch authorization code");
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scopes: data.scope || this.scopes
    };
  }

  async refreshToken(refreshToken) {
    if (!this.isConfigured()) {
      throw new Error("Twitch credentials missing");
    }

    const res = await fetch("https://id.twitch.tv/oauth2/token", {
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
      throw new Error(data.message || "Failed to refresh Twitch access token");
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in
    };
  }

  async getProfile(accessToken) {
    const userRes = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        "Client-Id": this.clientId,
        Authorization: `Bearer ${accessToken}`
      }
    });

    const userData = await userRes.json();
    if (!userRes.ok || !userData.data || userData.data.length === 0) {
      throw new Error(userData.message || "Failed to retrieve Twitch user profile");
    }

    const user = userData.data[0];

    // Follower count lookup
    let followerCount = 0;
    try {
      const followRes = await fetch(
        `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user.id}`,
        {
          headers: {
            "Client-Id": this.clientId,
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      const followData = await followRes.json();
      if (followRes.ok && typeof followData.total === "number") {
        followerCount = followData.total;
      }
    } catch {
      // Helix followers fallback
    }

    return {
      platformAccountId: user.id,
      username: user.login,
      displayName: user.display_name,
      avatarUrl: user.profile_image_url || "",
      profileUrl: `https://twitch.tv/${user.login}`,
      followerCount,
      totalViews: BigInt(user.view_count || 0),
      videoCount: 0,
      description: user.description || ""
    };
  }

  async getContent(accessToken, externalAccountId, options = {}) {
    const limit = options.limit || 20;
    const videoRes = await fetch(
      `https://api.twitch.tv/helix/videos?user_id=${externalAccountId}&first=${limit}`,
      {
        headers: {
          "Client-Id": this.clientId,
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const videoData = await videoRes.json();
    if (!videoRes.ok || !videoData.data) {
      return [];
    }

    return videoData.data.map((v) => ({
      externalContentId: v.id,
      platform: "TWITCH",
      title: v.title || "Twitch Broadcast / VOD",
      description: v.description || "",
      thumbnailUrl: (v.thumbnail_url || "").replace("%{width}", "640").replace("%{height}", "360"),
      contentUrl: v.url,
      publishedAt: new Date(v.created_at || Date.now()),
      viewCount: Number(v.view_count || 0),
      likeCount: 0,
      commentCount: 0,
      metricsJson: {
        duration: v.duration,
        type: v.type
      }
    }));
  }

  async getMetrics(accessToken, externalAccountId) {
    const profile = await this.getProfile(accessToken);
    const content = await this.getContent(accessToken, externalAccountId, { limit: 10 });

    let totalVODViews = 0;
    content.forEach((c) => {
      totalVODViews += c.viewCount;
    });

    const avgVODViews = content.length > 0 ? Math.round(totalVODViews / content.length) : 0;

    return {
      platform: "TWITCH",
      followerCount: profile.followerCount,
      totalViews: profile.totalViews,
      recentAvgViews: avgVODViews,
      recentContentCount: content.length,
      engagementRate: 0.0 // Twitch live interaction rate requires chat EventSub
    };
  }

  async revokeAccess(token) {
    try {
      await fetch("https://id.twitch.tv/oauth2/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: this.clientId,
          token
        })
      });
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new TwitchProvider();
