const prisma = require("../db/prisma");
const { encrypt, decrypt } = require("../utils/crypto");

/**
 * Token Service
 * Manages encrypted credential storage, retrieval, and automated token refreshment.
 */
class TokenService {
  /**
   * Save or update encrypted OAuth credentials for a social account
   */
  static async saveCredentials(socialAccountId, { accessToken, refreshToken, expiresIn }) {
    const encAccess = encrypt(accessToken);
    const encRefresh = refreshToken ? encrypt(refreshToken) : null;

    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + Number(expiresIn) * 1000)
      : null;

    return await prisma.socialCredential.upsert({
      where: { socialAccountId },
      update: {
        encryptedAccessToken: encAccess.encrypted,
        encryptedRefreshToken: encRefresh ? encRefresh.encrypted : undefined,
        tokenExpiresAt,
        iv: encAccess.iv,
        tag: encAccess.tag
      },
      create: {
        socialAccountId,
        encryptedAccessToken: encAccess.encrypted,
        encryptedRefreshToken: encRefresh ? encRefresh.encrypted : null,
        tokenExpiresAt,
        iv: encAccess.iv,
        tag: encAccess.tag
      }
    });
  }

  /**
   * Get valid, decrypted access token, automatically refreshing if expired and provider passed
   */
  static async getValidToken(socialAccountId, provider = null) {
    const cred = await prisma.socialCredential.findUnique({
      where: { socialAccountId }
    });

    if (!cred) {
      throw new Error("No credentials found for social account");
    }

    const isExpired = cred.tokenExpiresAt && cred.tokenExpiresAt <= new Date();

    if (isExpired && cred.encryptedRefreshToken && provider) {
      try {
        const decryptedRefresh = decrypt(cred.encryptedRefreshToken, cred.iv, cred.tag);
        const refreshed = await provider.refreshToken(decryptedRefresh);

        await this.saveCredentials(socialAccountId, {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.newRefreshToken || decryptedRefresh,
          expiresIn: refreshed.expiresIn
        });

        return refreshed.accessToken;
      } catch (refreshErr) {
        // Mark account as EXPIRED
        await prisma.socialAccount.update({
          where: { id: socialAccountId },
          data: { status: "EXPIRED", syncError: "Token expired. Re-authorization required." }
        });
        throw new Error("Token expired and automated refresh failed. Please reconnect.");
      }
    }

    return decrypt(cred.encryptedAccessToken, cred.iv, cred.tag);
  }

  /**
   * Securely delete credentials
   */
  static async deleteCredentials(socialAccountId) {
    return await prisma.socialCredential.deleteMany({
      where: { socialAccountId }
    });
  }
}

module.exports = TokenService;
