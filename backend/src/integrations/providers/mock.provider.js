const BaseProvider = require("../base.provider");

/**
 * Mock Provider for Automated Tests & Development Fixtures
 * Matches the exact NormalizedProfile, NormalizedContent, and NormalizedMetrics shapes.
 */
class MockProvider extends BaseProvider {
  constructor(platformName = "YOUTUBE") {
    super(platformName);
  }

  getAuthUrl(state) {
    return {
      configured: true,
      url: `https://mock-oauth.lazarus.test/auth?platform=${this.name}&state=${state}`,
      state
    };
  }

  async exchangeCode(code) {
    if (code === "INVALID_CODE") {
      throw new Error("Invalid mock authorization code");
    }

    return {
      accessToken: `mock_access_token_${this.name.toLowerCase()}_${Date.now()}`,
      refreshToken: `mock_refresh_token_${this.name.toLowerCase()}_${Date.now()}`,
      expiresIn: 3600,
      scopes: ["read_profile", "read_metrics", "read_content"]
    };
  }

  async refreshToken(refreshToken) {
    if (refreshToken.includes("EXPIRED")) {
      throw new Error("Mock refresh token expired");
    }

    return {
      accessToken: `mock_refreshed_access_token_${Date.now()}`,
      newRefreshToken: `mock_refreshed_token_${Date.now()}`,
      expiresIn: 3600
    };
  }

  async getProfile(accessToken) {
    const isYouTube = this.name === "YOUTUBE";
    const isInstagram = this.name === "INSTAGRAM";

    return {
      platformAccountId: `mock_acc_${this.name.toLowerCase()}_123`,
      username: `creator_${this.name.toLowerCase()}`,
      displayName: `${this.name} Verified Creator`,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
      profileUrl: `https://${this.name.toLowerCase()}.com/creator_mock`,
      followerCount: isYouTube ? 48500 : isInstagram ? 32000 : 18500,
      totalViews: isYouTube ? BigInt(2450000) : BigInt(650000),
      videoCount: 42,
      uploadsPlaylistId: "mock_uploads_playlist_123"
    };
  }

  async getContent(accessToken, externalAccountId, options = {}) {
    const count = options.maxResults || 6;
    const contents = [];

    for (let i = 1; i <= count; i++) {
      contents.push({
        externalContentId: `content_${this.name.toLowerCase()}_${i}`,
        platform: this.name,
        title: `${this.name} Masterclass Episode #${i}: Scaling High-Converting Content`,
        description: `Deep dive into strategies, workflow tools, and audience growth mechanics.`,
        thumbnailUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=640&q=80`,
        contentUrl: `https://${this.name.toLowerCase()}.com/watch?v=mock_${i}`,
        publishedAt: new Date(Date.now() - i * 86400000 * 3),
        viewCount: 15400 - i * 1200,
        likeCount: 920 - i * 60,
        commentCount: 110 - i * 8,
        metricsJson: { tags: ["tech", "ai", "content"] }
      });
    }

    return contents;
  }

  async getMetrics(accessToken, externalAccountId) {
    return {
      platform: this.name,
      followerCount: this.name === "YOUTUBE" ? 48500 : 32000,
      totalViews: BigInt(2450000),
      videoCount: 42,
      recentAvgViews: 12400,
      engagementRate: 4.85,
      recentContentCount: 6
    };
  }

  async revokeAccess(token) {
    return true;
  }
}

module.exports = MockProvider;
