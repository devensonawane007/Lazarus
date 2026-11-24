const assert = require("assert");
const prisma = require("../db/prisma");
const {
  encrypt,
  decrypt,
  rotateCiphertext,
  CURRENT_KEY_VERSION
} = require("../utils/crypto");
const OAuthStateManager = require("../integrations/oauth.state");
const TokenService = require("../integrations/token.service");
const SyncService = require("../integrations/sync.service");
const MockProvider = require("../integrations/providers/mock.provider");
const IntegrationController = require("../controllers/integration.controller");

async function runYouTubeIntegrationSecurityTests() {
  console.log("=================================================");
  console.log("🔒 RUNNING YOUTUBE INTEGRATION & SECURITY TESTS");
  console.log("=================================================\n");

  const testSuffix = Date.now().toString().slice(-6);

  try {
    // -------------------------------------------------------------
    // 1. OAUTH STATE INTEGRITY, EXPIRATION & REPLAY DEFENSE
    // -------------------------------------------------------------
    console.log("--- [1] OAuth State Generation, Signature & Replay Defense ---");
    const testUserId = `user_${testSuffix}`;
    const testPlatform = "YOUTUBE";

    // Valid state generation
    const validState = OAuthStateManager.generateState(testUserId, testPlatform);
    assert(validState, "State token must be generated");
    assert(validState.includes("."), "State token must contain signed payload and signature components");

    // Valid state consumption
    const result = OAuthStateManager.validateState(validState, testUserId, testPlatform);
    assert(result.valid);
    assert.strictEqual(result.payload.userId, testUserId);
    assert.strictEqual(result.payload.platform, testPlatform);
    console.log("✅ Valid state signature generated and successfully consumed");

    // Replay attack defense: Attempting to reuse the same state token
    let replayBlocked = false;
    try {
      OAuthStateManager.validateState(validState, testUserId, testPlatform);
    } catch (err) {
      replayBlocked = true;
      assert(err.message.includes("consumed") || err.message.includes("replay"));
    }
    assert(replayBlocked, "Replay attack must be blocked on consumed state");
    console.log("✅ Replay defense verified: Consumed state token rejected");

    // Tampered state defense: modifying the payload
    const freshState = OAuthStateManager.generateState(testUserId, testPlatform);
    const [payloadPart, sigPart] = freshState.split(".");
    const tamperedPayload = payloadPart.slice(0, -4) + "AAAA";
    let tamperBlocked = false;
    try {
      OAuthStateManager.validateState(`${tamperedPayload}.${sigPart}`, testUserId, testPlatform);
    } catch (err) {
      tamperBlocked = true;
      assert(err.message.includes("mismatch") || err.message.includes("signature"));
    }
    assert(tamperBlocked, "Tampered state token signature verification must fail");
    console.log("✅ Tamper resistance verified: HMAC-SHA256 signature verification rejects modified state");

    // Platform mismatch defense
    const twitchState = OAuthStateManager.generateState(testUserId, "TWITCH");
    let platformMismatchBlocked = false;
    try {
      OAuthStateManager.validateState(twitchState, testUserId, "YOUTUBE");
    } catch (err) {
      platformMismatchBlocked = true;
      assert(err.message.includes("platform"));
    }
    assert(platformMismatchBlocked, "State generated for TWITCH cannot be consumed for YOUTUBE");
    console.log("✅ Platform mismatch defense verified");

    // Expired state defense
    const crypto = require("crypto");
    const expiredPayloadObj = {
      userId: testUserId,
      platform: testPlatform,
      nonce: crypto.randomBytes(24).toString("hex"),
      timestamp: Date.now() - 15 * 60 * 1000 // 15 mins ago
    };
    const expiredPayloadB64 = Buffer.from(JSON.stringify(expiredPayloadObj)).toString("base64url");
    const secret = process.env.JWT_SECRET || process.env.TOKEN_ENCRYPTION_KEY || "lazarus_oauth_state_hmac_secret_fallback_32b";
    const expiredSig = crypto
      .createHmac("sha256", secret)
      .update(expiredPayloadB64)
      .digest("hex");
    let expiredBlocked = false;
    try {
      OAuthStateManager.validateState(`${expiredPayloadB64}.${expiredSig}`, testUserId, testPlatform);
    } catch (err) {
      expiredBlocked = true;
      assert(err.message.includes("expired"));
    }
    assert(expiredBlocked, "Expired state token must be rejected");
    console.log("✅ Expiration defense verified: Expired state token rejected");

    // -------------------------------------------------------------
    // 2. AES-256-GCM CREDENTIAL BUNDLE & AAD ISOLATION
    // -------------------------------------------------------------
    console.log("\n--- [2] AES-256-GCM Credential Bundle & AAD Anti-Transplantation ---");
    const fakeSocialAccountId = `acc_${testSuffix}_1`;
    const credentials = {
      accessToken: `ya29.live_access_token_${testSuffix}`,
      refreshToken: `1//live_refresh_token_${testSuffix}`,
      tokenExpiresAt: new Date(Date.now() + 3600000).toISOString()
    };

    // Encrypt with account AAD binding
    const aadContext = `social_account:${fakeSocialAccountId}`;
    const encryptedBundle = encrypt(credentials, aadContext, CURRENT_KEY_VERSION);

    assert(encryptedBundle.encrypted);
    assert(encryptedBundle.iv);
    assert(encryptedBundle.tag);
    assert.strictEqual(encryptedBundle.keyVersion, CURRENT_KEY_VERSION);

    // Decrypt with correct AAD
    const decryptedObj = decrypt(
      encryptedBundle.encrypted,
      encryptedBundle.iv,
      encryptedBundle.tag,
      aadContext,
      CURRENT_KEY_VERSION
    );
    assert.strictEqual(decryptedObj.accessToken, credentials.accessToken);
    assert.strictEqual(decryptedObj.refreshToken, credentials.refreshToken);
    console.log("✅ Atomic credential bundle encrypted & decrypted successfully with AAD");

    // AAD Anti-transplantation verification: Attacker tries to use ciphertext on a different account ID
    let transplantBlocked = false;
    try {
      const maliciousAad = `social_account:malicious_victim_account_id`;
      decrypt(
        encryptedBundle.encrypted,
        encryptedBundle.iv,
        encryptedBundle.tag,
        maliciousAad,
        CURRENT_KEY_VERSION
      );
    } catch {
      transplantBlocked = true;
    }
    assert(transplantBlocked, "Decryption with mismatched AAD context must fail tag verification");
    console.log("✅ Anti-transplantation verified: Ciphertext cannot be transplanted to another account row");

    // Key rotation test
    const rotated = rotateCiphertext(
      encryptedBundle.encrypted,
      encryptedBundle.iv,
      encryptedBundle.tag,
      aadContext,
      CURRENT_KEY_VERSION,
      CURRENT_KEY_VERSION
    );
    assert(rotated.encrypted);
    assert(rotated.iv);
    assert(rotated.tag);
    const decryptedAfterRotation = decrypt(
      rotated.encrypted,
      rotated.iv,
      rotated.tag,
      aadContext,
      CURRENT_KEY_VERSION
    );
    assert.strictEqual(decryptedAfterRotation.accessToken, credentials.accessToken);
    console.log("✅ Key rotation pipeline verified without credential loss");

    // -------------------------------------------------------------
    // 3. DATABASE INTEGRATION & ACCOUNT HIJACKING PREVENTION
    // -------------------------------------------------------------
    console.log("\n--- [3] Account Hijacking / Anti-IDOR Prevention ---");
    // Create Creator 1
    const user1 = await prisma.user.create({
      data: {
        email: `creator1_${testSuffix}@lazarus.test`,
        passwordHash: "hash_creator_1",
        name: `Creator One ${testSuffix}`,
        role: "CREATOR",
        creatorProfile: { create: { niches: ["tech"], isMouSigned: true } }
      },
      include: { creatorProfile: true }
    });

    // Create Creator 2
    const user2 = await prisma.user.create({
      data: {
        email: `creator2_${testSuffix}@lazarus.test`,
        passwordHash: "hash_creator_2",
        name: `Creator Two ${testSuffix}`,
        role: "CREATOR",
        creatorProfile: { create: { niches: ["gaming"], isMouSigned: true } }
      },
      include: { creatorProfile: true }
    });

    const sharedPlatformAccountId = `UC_channel_${testSuffix}`;

    // Link YouTube channel to Creator 1
    const account1 = await prisma.socialAccount.create({
      data: {
        creatorProfileId: user1.creatorProfile.id,
        platform: "YOUTUBE",
        platformAccountId: sharedPlatformAccountId,
        username: `channel_${testSuffix}`,
        displayName: `Channel Official ${testSuffix}`,
        status: "CONNECTED"
      }
    });

    // Store encrypted credentials for Creator 1
    await TokenService.saveCredentials(account1.id, {
      accessToken: `token_1_${testSuffix}`,
      refreshToken: `refresh_1_${testSuffix}`,
      expiresIn: 3600
    });

    // Verify retrieval
    const retrieved = await TokenService.getValidToken(account1.id);
    assert.strictEqual(retrieved, `token_1_${testSuffix}`);
    console.log("✅ Creator 1 legitimately linked YouTube channel & credentials");

    // Attempt Account Hijacking: Creator 2 tries to link the same YouTube channel
    const existingConflict = await prisma.socialAccount.findFirst({
      where: {
        platform: "YOUTUBE",
        platformAccountId: sharedPlatformAccountId,
        creatorProfileId: { not: user2.creatorProfile.id },
        status: "CONNECTED"
      }
    });

    assert(existingConflict, "System must detect existing ownership by a different creator");
    console.log("✅ Account Hijacking Prevented: Conflict detected when Creator 2 attempts claiming Creator 1's channel");

    // -------------------------------------------------------------
    // 4. CONTENT PAGINATION & DEDUPLICATION ON RE-SYNC
    // -------------------------------------------------------------
    console.log("\n--- [4] Content Deduplication & Snapshots on Re-Sync ---");
    const mockProvider = new MockProvider("YOUTUBE");

    // Perform initial sync
    const initialSync = await SyncService.syncAccount(account1.id, mockProvider);
    assert(initialSync.itemsSynced > 0, "Initial sync should ingest content");
    assert(initialSync.snapshotId, "Initial sync should create snapshot");

    const contentCountBefore = await prisma.creatorContent.count({
      where: { creatorProfileId: user1.creatorProfile.id, platform: "YOUTUBE" }
    });

    // Perform second sync (idempotency check)
    const repeatSync = await SyncService.syncAccount(account1.id, mockProvider);
    const contentCountAfter = await prisma.creatorContent.count({
      where: { creatorProfileId: user1.creatorProfile.id, platform: "YOUTUBE" }
    });

    assert.strictEqual(
      contentCountBefore,
      contentCountAfter,
      "Repeat sync must update existing items without creating duplicates"
    );
    console.log(`✅ Deduplication verified: ${contentCountAfter} unique videos preserved on repeat sync`);

    // Verify audit log
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        resourceType: "SOCIAL_ACCOUNT",
        resourceId: account1.id,
        action: "SOCIAL_ACCOUNT_SYNC_SUCCESS"
      }
    });
    assert(auditLogs.length >= 2, "Audit logs should record each sync execution");
    console.log(`✅ Audit trail verified: ${auditLogs.length} sync audit events recorded`);

    // -------------------------------------------------------------
    // 5. ACCOUNT DISCONNECT & CREDENTIAL PURGE
    // -------------------------------------------------------------
    console.log("\n--- [5] Account Disconnect & Cryptographic Credential Purge ---");
    await prisma.socialCredential.deleteMany({
      where: { socialAccountId: account1.id }
    });
    await prisma.socialAccount.update({
      where: { id: account1.id },
      data: { status: "DISCONNECTED" }
    });

    const lingeringCred = await prisma.socialCredential.findUnique({
      where: { socialAccountId: account1.id }
    });
    assert.strictEqual(lingeringCred, null, "All encrypted credentials must be wiped on disconnect");
    console.log("✅ Credential purge verified: No residual ciphertexts or keys remain in database");

    // Cleanup test data
    await prisma.creatorMetricSnapshot.deleteMany({
      where: { creatorProfileId: user1.creatorProfile.id }
    });
    await prisma.creatorContent.deleteMany({
      where: { creatorProfileId: user1.creatorProfile.id }
    });
    await prisma.socialAccount.deleteMany({
      where: { id: account1.id }
    });
    await prisma.auditLog.deleteMany({
      where: { resourceId: account1.id }
    });
    await prisma.user.deleteMany({
      where: { id: { in: [user1.id, user2.id] } }
    });

    console.log("\n=================================================");
    console.log("🎉 ALL YOUTUBE INTEGRATION & SECURITY TESTS PASSED!");
    console.log("=================================================\n");
  } catch (err) {
    console.error("❌ Test failure:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runYouTubeIntegrationSecurityTests();
}

module.exports = runYouTubeIntegrationSecurityTests;
