/**
 * Base Abstract Provider for External Social Media Platforms
 * Enforces a strict uniform contract across YouTube, Instagram, Twitch.
 */
class BaseProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Generates the OAuth authorization URL with CSRF state
   * @param {string} state - CSRF state token
   * @returns {{ url: string, state: string }}
   */
  getAuthUrl(state) {
    throw new Error(`getAuthUrl() not implemented for provider ${this.name}`);
  }

  /**
   * Exchanges an authorization code for access & refresh tokens
   * @param {string} code - OAuth authorization code
   * @returns {Promise<{ accessToken: string, refreshToken?: string, expiresIn?: number, rawProfile: any }>}
   */
  async exchangeCode(code) {
    throw new Error(`exchangeCode() not implemented for provider ${this.name}`);
  }

  /**
   * Refreshes an expired access token
   * @param {string} refreshToken - Decrypted refresh token
   * @returns {Promise<{ accessToken: string, expiresIn?: number, newRefreshToken?: string }>}
   */
  async refreshToken(refreshToken) {
    throw new Error(`refreshToken() not implemented for provider ${this.name}`);
  }

  /**
   * Fetches and normalizes the user channel / profile
   * @param {string} accessToken
   * @returns {Promise<NormalizedProfile>}
   */
  async getProfile(accessToken) {
    throw new Error(`getProfile() not implemented for provider ${this.name}`);
  }

  /**
   * Ingests recent media items (videos, posts, streams)
   * @param {string} accessToken
   * @param {string} externalAccountId
   * @param {object} options
   * @returns {Promise<NormalizedContent[]>}
   */
  async getContent(accessToken, externalAccountId, options = {}) {
    throw new Error(`getContent() not implemented for provider ${this.name}`);
  }

  /**
   * Ingests latest performance metrics and audience data
   * @param {string} accessToken
   * @param {string} externalAccountId
   * @returns {Promise<NormalizedMetrics>}
   */
  async getMetrics(accessToken, externalAccountId) {
    throw new Error(`getMetrics() not implemented for provider ${this.name}`);
  }

  /**
   * Revokes token at the platform provider
   * @param {string} token
   * @returns {Promise<boolean>}
   */
  async revokeAccess(token) {
    return true; // Default safe fallback
  }
}

module.exports = BaseProvider;
