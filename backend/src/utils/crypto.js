const crypto = require("crypto");

/**
 * LAZARUS V3 CRYPTOGRAPHIC KEY MANAGEMENT & TOKEN VAULT
 *
 * Implements:
 * 1. AES-256-GCM authenticated encryption
 * 2. 96-bit (12-byte) hardware-randomized IVs per encryption operation
 * 3. Authenticated Additional Data (AAD) cryptographic binding
 * 4. Key versioning and rotation support
 * 5. Production key strength validation (32-byte cryptographically random material)
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard 96-bit IV for GCM
const CURRENT_KEY_VERSION = process.env.TOKEN_ENCRYPTION_KEY_VERSION || "v1";
const SALT = "lazarus_v3_token_vault_salt_constant";

/**
 * Derive a 32-byte buffer key from a secret string or buffer
 */
function deriveKey(secret) {
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL SECURITY VIOLATION: TOKEN_ENCRYPTION_KEY must be configured in production environment."
      );
    }
    // Development fallback
    secret = "lazarus_v3_dev_encryption_key_material_minimum_32_bytes_long";
  }

  // If secret is already a 64-character hex string representing 32 bytes, use directly
  if (typeof secret === "string" && secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return Buffer.from(secret, "hex");
  }

  // Otherwise derive 32-byte key using PBKDF2 with SHA-256
  return crypto.pbkdf2Sync(String(secret), SALT, 100000, 32, "sha256");
}

/**
 * Keyring containing active and historic encryption keys for rotation
 */
const KEY_RING = {
  v1: deriveKey(process.env.TOKEN_ENCRYPTION_KEY || process.env.TOKEN_ENCRYPTION_KEY_V1)
};

// If a secondary or previous key version is defined in the environment, register it
if (process.env.TOKEN_ENCRYPTION_KEY_V2) {
  KEY_RING.v2 = deriveKey(process.env.TOKEN_ENCRYPTION_KEY_V2);
}

/**
 * Retrieve key for a specific key version
 */
function getKey(version = CURRENT_KEY_VERSION) {
  const key = KEY_RING[version];
  if (!key) {
    throw new Error(`Encryption key version "${version}" not found in keyring`);
  }
  return key;
}

/**
 * Validate key material suitability for production
 */
function validateKeyStrength(secret = process.env.TOKEN_ENCRYPTION_KEY) {
  if (!secret) {
    return { valid: false, reason: "No encryption key provided" };
  }
  if (secret === "lazarus_v3_master_encryption_key_default_32b" || secret.includes("default")) {
    return { valid: false, reason: "Default placeholder key cannot be used in production" };
  }
  if (Buffer.byteLength(secret, "utf8") < 32) {
    return { valid: false, reason: "Key material must be at least 32 bytes" };
  }
  return { valid: true };
}

/**
 * Encrypt arbitrary data or token bundle using AES-256-GCM with optional AAD
 * @param {string|object} data - Plaintext string or object payload to encrypt
 * @param {string} [aad=""] - Authenticated Additional Data to bind to the ciphertext
 * @param {string} [keyVersion=CURRENT_KEY_VERSION] - Key version to use
 * @returns {{ encrypted: string, iv: string, tag: string, keyVersion: string }}
 */
function encrypt(data, aad = "", keyVersion = CURRENT_KEY_VERSION) {
  if (data === null || data === undefined) {
    throw new Error("Data to encrypt cannot be null or undefined");
  }

  const plaintext = typeof data === "object" ? JSON.stringify(data) : String(data);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey(keyVersion);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  if (aad) {
    cipher.setAAD(Buffer.from(String(aad), "utf8"));
  }

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag().toString("hex");

  return {
    encrypted,
    iv: iv.toString("hex"),
    tag,
    keyVersion
  };
}

/**
 * Decrypt AES-256-GCM ciphertext with AAD validation
 * @param {string} encryptedHex - Hex ciphertext
 * @param {string} ivHex - Hex IV
 * @param {string} tagHex - Hex Auth Tag
 * @param {string} [aad=""] - Authenticated Additional Data expected
 * @param {string} [keyVersion=CURRENT_KEY_VERSION] - Key version
 * @returns {string|object} - Decrypted plaintext or parsed object
 */
function decrypt(encryptedHex, ivHex, tagHex, aad = "", keyVersion = CURRENT_KEY_VERSION) {
  if (!encryptedHex || !ivHex || !tagHex) {
    throw new Error("Encrypted text, IV, and auth tag are all required for decryption");
  }

  const key = getKey(keyVersion);
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  // Attempt decryption with AAD first
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    if (aad) {
      decipher.setAAD(Buffer.from(String(aad), "utf8"));
    }
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (err) {
    // If AAD was provided but failed, check if this is a legacy record encrypted without AAD
    if (aad) {
      try {
        const fallbackDecipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        fallbackDecipher.setAuthTag(tag);

        let fallbackDecrypted = fallbackDecipher.update(encryptedHex, "hex", "utf8");
        fallbackDecrypted += fallbackDecipher.final("utf8");

        try {
          return JSON.parse(fallbackDecrypted);
        } catch {
          return fallbackDecrypted;
        }
      } catch {
        // Fallback also failed, re-throw original error
      }
    }
    throw new Error(`Decryption failed: cryptographic authentication failure or invalid parameters. ${err.message}`);
  }
}

/**
 * Rotate an existing encrypted credential from oldKeyVersion to newKeyVersion
 */
function rotateCiphertext(encryptedHex, ivHex, tagHex, aad = "", oldVersion = "v1", newVersion = CURRENT_KEY_VERSION) {
  const decrypted = decrypt(encryptedHex, ivHex, tagHex, aad, oldVersion);
  return encrypt(decrypted, aad, newVersion);
}

module.exports = {
  encrypt,
  decrypt,
  rotateCiphertext,
  validateKeyStrength,
  CURRENT_KEY_VERSION,
  ALGORITHM
};
