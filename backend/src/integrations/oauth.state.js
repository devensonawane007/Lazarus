const crypto = require("crypto");

/**
 * LAZARUS V3 OAUTH STATE MANAGER
 *
 * Implements:
 * 1. Cryptographically secure random nonces
 * 2. Time-limited expiry (10-minute TTL)
 * 3. Strict user & platform binding
 * 4. HMAC-SHA256 tamper-proof signatures
 * 5. Single-use replay protection
 */

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const consumedNonces = new Map(); // Nonce -> consumedTimestamp

// Periodically purge old nonces to prevent memory leaks (unref'd to prevent keeping event loop alive)
const purgeInterval = setInterval(() => {
  const now = Date.now();
  for (const [nonce, timestamp] of consumedNonces.entries()) {
    if (now - timestamp > STATE_TTL_MS * 2) {
      consumedNonces.delete(nonce);
    }
  }
}, 5 * 60 * 1000);
purgeInterval.unref();

function getSecret() {
  return process.env.JWT_SECRET || process.env.TOKEN_ENCRYPTION_KEY || "lazarus_oauth_state_hmac_secret_fallback_32b";
}

/**
 * Generate a signed, time-limited, single-use OAuth state token
 * @param {string} userId - Authenticated user ID requesting the OAuth flow
 * @param {string} platform - Social platform (YOUTUBE, INSTAGRAM, TWITCH)
 * @returns {string} Signed state token
 */
function generateState(userId, platform) {
  if (!userId || !platform) {
    throw new Error("userId and platform are required to generate OAuth state");
  }

  const nonce = crypto.randomBytes(24).toString("hex");
  const timestamp = Date.now();

  const payload = {
    userId,
    platform: platform.toUpperCase(),
    nonce,
    timestamp
  };

  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr, "utf8").toString("base64url");

  const hmac = crypto
    .createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest("hex");

  return `${payloadB64}.${hmac}`;
}

/**
 * Validate and consume an OAuth state token
 * @param {string} stateString - The incoming state query/body parameter
 * @param {string} expectedUserId - Authenticated user making the callback request
 * @param {string} expectedPlatform - Platform being connected
 * @returns {{ valid: boolean, payload: object }}
 */
function validateState(stateString, expectedUserId, expectedPlatform) {
  if (!stateString || typeof stateString !== "string") {
    throw new Error("OAuth state token is required and cannot be empty");
  }

  const parts = stateString.split(".");
  if (parts.length !== 2) {
    throw new Error("Malformed OAuth state token: invalid structure");
  }

  const [payloadB64, hmacHex] = parts;

  // 1. Verify HMAC signature
  const expectedHmac = crypto
    .createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest("hex");

  const signatureMatch = crypto.timingSafeEqual(
    Buffer.from(hmacHex, "hex"),
    Buffer.from(expectedHmac, "hex")
  );

  if (!signatureMatch) {
    throw new Error("Invalid OAuth state token: cryptographic signature mismatch");
  }

  // 2. Parse payload
  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    throw new Error("Malformed OAuth state payload: failed to parse JSON");
  }

  // 3. Verify user binding
  if (expectedUserId && payload.userId !== expectedUserId) {
    throw new Error("OAuth state token is bound to a different user account");
  }

  // 4. Verify platform binding
  if (expectedPlatform && payload.platform !== expectedPlatform.toUpperCase()) {
    throw new Error(`OAuth state token is bound to platform ${payload.platform}, not ${expectedPlatform}`);
  }

  // 5. Verify TTL (time-limited)
  const now = Date.now();
  if (now - payload.timestamp > STATE_TTL_MS) {
    throw new Error("OAuth state token has expired. Please initiate connection again.");
  }

  // 6. Verify Single-Use (Replay protection)
  if (consumedNonces.has(payload.nonce)) {
    throw new Error("OAuth state token has already been consumed (replay detected)");
  }

  // Mark nonce as consumed
  consumedNonces.set(payload.nonce, now);

  return {
    valid: true,
    payload
  };
}

module.exports = {
  generateState,
  validateState,
  STATE_TTL_MS
};
