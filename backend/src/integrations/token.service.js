const prisma = require("../db/prisma");
const { encrypt, decrypt } = require("../utils/crypto");

/**
 * Token Service
 * Manages encrypted credential storage, retrieval, key rotation, and automated token refreshment.
 * Tokens are stored as an authenticated token bundle bound to the socialAccountId via AES-256-GCM AAD.
 */
class TokenService {
  /**
   * Helper to derive AAD (Authenticated Additional Data) binding
   */
  static getAAD(socialAccountId) {
    return `social_account:${socialAccountId}`;
  }

  /**
   * Save or update encrypted OAuth credentials for a social account as an atomic bundle
   * @param {string} socialAccountId
   * @param {{ accessToken: string, refreshToken?: string, expiresIn?: number|string }} credentials
   */
  static async saveCredentials(socialAccountId, { accessToken, refreshToken, expiresIn }) {
    if (!accessToken) {
      throw new Error("Cannot save credentials: accessToken is required");
    }

    // Atomic bundle containing both access and refresh tokens
    const tokenBundle = {
      accessToken,
      refreshToken: refreshToken || null,
      savedAt: new Date().toISOString()
    };

    const aad = this.getAAD(socialAccountId);
    const enc = encrypt(tokenBundle, aad);

    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + Number(expiresIn) * 1000)
      : null;

    return await prisma.socialCredential.upsert({
      where: { socialAccountId },
      update: {
        encryptedAccessToken: enc.encrypted,
        encryptedRefreshToken: refreshToken ? enc.encrypted : null,
        tokenExpiresAt,
        iv: enc.iv,
        tag: enc.tag
      },
      create: {
        socialAccountId,
        encryptedAccessToken: enc.encrypted,
        encryptedRefreshToken: refreshToken ? enc.encrypted : null,
        tokenExpiresAt,
        iv: enc.iv,
        tag: enc.tag
      }
    });
  }

  /**
   * Retrieve and decrypt credentials bundle for a social account
   * @param {string} socialAccountId
   * @returns {Promise<{ accessToken: string, refreshToken: string|null, tokenExpiresAt: Date|null }>}
   */
  static async getDecryptedCredentials(socialAccountId) {
    const cred = await prisma.socialCredential.findUnique({
      where: { socialAccountId }
    });

    if (!cred) {
      throw new Error("No credentials found for social account");
    }

    const aad = this.getAAD(socialAccountId);
    const decrypted = decrypt(cred.encryptedAccessToken, cred.iv, cred.tag, aad);

    if (typeof decrypted === "object" && decrypted !== null) {
      return {
        accessToken: decrypted.accessToken,
        refreshToken: decrypted.refreshToken || null,
        tokenExpiresAt: cred.tokenExpiresAt
      };
    }

    // Legacy fallback if encrypted as single raw string
    return {
      accessToken: String(decrypted),
      refreshToken: null,
      tokenExpiresAt: cred.tokenExpiresAt
    };
  }

  /**
   * Get valid, decrypted access token, automatically refreshing if expired and provider passed
   * @param {string} socialAccountId
   * @param {object} [provider=null] - Provider instance capable of refreshToken(refreshToken)
   * @returns {Promise<string>} Valid access token
   */
  static async getValidToken(socialAccountId, provider = null) {
    const cred = await prisma.socialCredential.findUnique({
      where: { socialAccountId }
    });

    if (!cred) {
      throw new Error("No credentials found for social account");
    }

    const credentials = await this.getDecryptedCredentials(socialAccountId);
    const isExpired = cred.tokenExpiresAt && cred.tokenExpiresAt <= new Date();

    if (isExpired && credentials.refreshToken && provider && typeof provider.refreshToken === "function") {
      try {
        const refreshed = await provider.refreshToken(credentials.refreshToken);

        await this.saveCredentials(socialAccountId, {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.newRefreshToken || credentials.refreshToken,
          expiresIn: refreshed.expiresIn
        });

        return refreshed.accessToken;
      } catch (refreshErr) {
        // Mark account as EXPIRED so UI alerts the user
        await prisma.socialAccount.update({
          where: { id: socialAccountId },
          data: {
            status: "EXPIRED",
            syncError: `Token expired and automated refresh failed: ${refreshErr.message}. Re-authorization required.`
          }
        });
        throw new Error("Token expired and automated refresh failed. Please reconnect.");
      }
    }

    return credentials.accessToken;
  }

  /**
   * Securely delete credentials
   * @param {string} socialAccountId
   */
  static async deleteCredentials(socialAccountId) {
    return await prisma.socialCredential.deleteMany({
      where: { socialAccountId }
    });
  }
}

module.exports = TokenService;
