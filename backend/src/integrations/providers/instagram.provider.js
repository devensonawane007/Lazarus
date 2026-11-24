const BaseProvider = require("../base.provider");

class InstagramProvider extends BaseProvider {
  constructor() {
    super("INSTAGRAM");
    this.clientId = process.env.INSTAGRAM_CLIENT_ID || "";
    this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET || "";
    this.redirectUri =
      process.env.INSTAGRAM_REDIRECT_URI ||
      `${process.env.BACKEND_URL || "http://localhost:5000"}/api/integrations/instagram/callback`;
    this.scopes = ["instagram_basic", "instagram_manage_insights", "pages_show_list"];
  }

  isConfigured() {
    return Boolean(this.clientId && this.clientSecret);
  }

  getAuthUrl(state) {
    if (!this.isConfigured()) {
      return {
        configured: false,
        url: null,
        message: "Instagram/Meta app credentials not configured in backend/.env"
      };
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(","),
      response_type: "code",
      state: state || ""
    });

    return {
      configured: true,
      url: `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`,
      state
    };
  }

  async exchangeCode(code) {
    if (!this.isConfigured()) {
      throw new Error("Instagram/Meta app credentials missing");
    }

    // Step 1: Exchange short-lived token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(
        this.redirectUri
      )}&client_secret=${this.clientSecret}&code=${code}`
    );

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error?.message || "Failed to exchange Instagram authorization code");
    }

    const shortToken = tokenData.access_token;

    // Step 2: Exchange for long-lived token (valid for 60 days)
    const longTokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.clientId}&client_secret=${this.clientSecret}&fb_exchange_token=${shortToken}`
    );
    const longData = await longTokenRes.json();

    const accessToken = longData.access_token || shortToken;
    const expiresIn = longData.expires_in || 5184000; // 60 days default

    return {
      accessToken,
      refreshToken: null, // Meta long-lived tokens refresh via grant_type=fb_exchange_token
      expiresIn,
      scopes: this.scopes
    };
  }

  async refreshToken(currentToken) {
    if (!this.isConfigured()) {
      throw new Error("Instagram/Meta app credentials missing");
    }

    const res = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.clientId}&client_secret=${this.clientSecret}&fb_exchange_token=${currentToken}`
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || "Failed to refresh Instagram long-lived token");
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 5184000
    };
  }

  async getProfile(accessToken) {
    // 1. Get connected accounts / Facebook pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=name,instagram_business_account&access_token=${accessToken}`
    );
    const pagesData = await pagesRes.json();

    let igAccountId = null;
    if (pagesData.data && pagesData.data.length > 0) {
      for (const page of pagesData.data) {
        if (page.instagram_business_account?.id) {
          igAccountId = page.instagram_business_account.id;
          break;
        }
      }
    }

    if (!igAccountId) {
      throw new Error(
        "No Instagram Creator or Business Account found linked to your Meta account. Please ensure your Instagram is converted to Professional and connected to a Facebook page."
      );
    }

    // 2. Fetch IG Account details
    const igRes = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}?fields=id,username,name,profile_picture_url,biography,followers_count,follows_count,media_count&access_token=${accessToken}`
    );
    const igData = await igRes.json();

    if (!igRes.ok) {
      throw new Error(igData.error?.message || "Failed to fetch Instagram profile details");
    }

    return {
      platformAccountId: igData.id,
      username: igData.username || igData.id,
      displayName: igData.name || igData.username || "Instagram Creator",
      avatarUrl: igData.profile_picture_url || "",
      profileUrl: `https://instagram.com/${igData.username}`,
      followerCount: Number(igData.followers_count || 0),
      totalViews: BigInt(0), // Instagram does not expose lifetime video views across all media in profile endpoint
      videoCount: Number(igData.media_count || 0),
      biography: igData.biography || ""
    };
  }

  async getContent(accessToken, externalAccountId, options = {}) {
    const limit = options.limit || 20;
    const mediaRes = await fetch(
      `https://graph.facebook.com/v19.0/${externalAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`
    );

    const mediaData = await mediaRes.json();
    if (!mediaRes.ok || !mediaData.data) {
      return [];
    }

    return mediaData.data.map((m) => ({
      externalContentId: m.id,
      platform: "INSTAGRAM",
      title: m.caption ? m.caption.slice(0, 80) : "Instagram Post",
      description: m.caption || "",
      thumbnailUrl: m.thumbnail_url || m.media_url || "",
      contentUrl: m.permalink || `https://instagram.com/p/${m.id}`,
      publishedAt: new Date(m.timestamp || Date.now()),
      viewCount: 0, // Direct video views require video_insights permission
      likeCount: Number(m.like_count || 0),
      commentCount: Number(m.comments_count || 0),
      metricsJson: {
        mediaType: m.media_type
      }
    }));
  }

  async getMetrics(accessToken, externalAccountId) {
    const profile = await this.getProfile(accessToken);
    const content = await this.getContent(accessToken, externalAccountId, { limit: 15 });

    let totalEngagements = 0;
    content.forEach((c) => {
      totalEngagements += c.likeCount + c.commentCount;
    });

    const avgEngagementsPerPost =
      content.length > 0 ? Math.round(totalEngagements / content.length) : 0;

    // Follower-relative engagement rate: (avgEngagements / followers) * 100
    const engagementRate =
      profile.followerCount > 0
        ? Number(((avgEngagementsPerPost / profile.followerCount) * 100).toFixed(2))
        : 0.0;

    return {
      platform: "INSTAGRAM",
      followerCount: profile.followerCount,
      totalViews: BigInt(0),
      videoCount: profile.videoCount,
      recentAvgEngagements: avgEngagementsPerPost,
      engagementRate,
      recentContentCount: content.length
    };
  }

  async revokeAccess(token) {
    try {
      await fetch(`https://graph.facebook.com/v19.0/me/permissions?access_token=${token}`, {
        method: "DELETE"
      });
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new InstagramProvider();
