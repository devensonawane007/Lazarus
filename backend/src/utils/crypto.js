const crypto = require("crypto");

// Derive a 32-byte key from environment or fallback secure default
const getEncryptionKey = () => {
  const secret = process.env.TOKEN_ENCRYPTION_KEY || "lazarus_v3_master_encryption_key_default_32b";
  return crypto.createHash("sha256").update(String(secret)).digest();
};

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard 96-bit IV for GCM

/**
 * Encrypt sensitive plaintext string using AES-256-GCM
 * @param {string} text - Plaintext to encrypt
 * @returns {{ encrypted: string, iv: string, tag: string }}
 */
function encrypt(text) {
  if (!text) {
    throw new Error("Text to encrypt cannot be empty");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  let encrypted = cipher.update(String(text), "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag().toString("hex");

  return {
    encrypted,
    iv: iv.toString("hex"),
    tag
  };
}

/**
 * Decrypt AES-256-GCM ciphertext
 * @param {string} encryptedHex - Hex-encoded ciphertext
 * @param {string} ivHex - Hex-encoded IV
 * @param {string} tagHex - Hex-encoded authentication tag
 * @returns {string} - Decrypted plaintext
 */
function decrypt(encryptedHex, ivHex, tagHex) {
  if (!encryptedHex || !ivHex || !tagHex) {
    throw new Error("Encrypted text, IV, and auth tag are all required for decryption");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};
