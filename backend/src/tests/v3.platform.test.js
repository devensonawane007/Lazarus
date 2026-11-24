const assert = require("assert");
const { encrypt, decrypt } = require("../utils/crypto");
const MockProvider = require("../integrations/providers/mock.provider");
const TokenService = require("../integrations/token.service");
const SyncService = require("../integrations/sync.service");
const MetricsService = require("../services/metrics.service");
const MatchingService = require("../services/matching.service");
const CollaborationService = require("../services/collaboration.service");
const prisma = require("../db/prisma");

async function runV3PlatformTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING LAZARUS V3 PLATFORM AUTOMATED TESTS");
  console.log("=================================================\n");

  const testSuffix = Date.now().toString().slice(-6);

  try {
    // -------------------------------------------------------------
    // 1. AES-256-GCM TOKEN ENCRYPTION & DECRYPTION
    // -------------------------------------------------------------
    console.log("--- [1] Token Encryption & Decryption (AES-256-GCM) ---");
    const rawSecret = `ya29.a0AfH6SMD_test_google_oauth_token_${testSuffix}`;
    const encrypted = encrypt(rawSecret);
    assert(encrypted.encrypted, "Must generate ciphertext");
    assert.strictEqual(encrypted.iv.length, 24, "IV must be 12 bytes (24 hex characters)");
    assert.strictEqual(encrypted.tag.length, 32, "Auth tag must be 16 bytes (32 hex characters)");

    const decrypted = decrypt(encrypted.encrypted, encrypted.iv, encrypted.tag);
    assert.strictEqual(decrypted, rawSecret, "Decrypted token must exactly match plaintext");
    console.log("✅ AES-256-GCM Encryption, IV, Tag & Decryption verified");

    // Tamper resistance
    let tamperedFailed = false;
    try {
      const tamperedCipher = encrypted.encrypted.slice(0, -2) + "00";
      decrypt(tamperedCipher, encrypted.iv, encrypted.tag);
    } catch {
      tamperedFailed = true;
    }
    assert(tamperedFailed, "Tampered ciphertext must fail auth tag verification");
    console.log("✅ Tamper resistance verified (Auth tag verification rejects modified ciphertext)");

    // -------------------------------------------------------------
    // 2. MOCK PROVIDER CONTRACT VERIFICATION
    // -------------------------------------------------------------
    console.log("\n--- [2] Social Provider Normalization & Contract ---");
    const ytMock = new MockProvider("YOUTUBE");
    const authUrl = ytMock.getAuthUrl("state_123");
    assert(authUrl.configured, "Provider should report configured");

    const tokens = await ytMock.exchangeCode("VALID_CODE");
    assert(tokens.accessToken, "Should return access token");

    const profile = await ytMock.getProfile(tokens.accessToken);
    assert.strictEqual(typeof profile.followerCount, "number");
    assert(profile.totalViews >= BigInt(0));
    assert(profile.displayName.includes("Creator"));

    const content = await ytMock.getContent(tokens.accessToken, profile.platformAccountId);
    assert(Array.isArray(content) && content.length > 0);
    assert(content[0].externalContentId);

    const metrics = await ytMock.getMetrics(tokens.accessToken, profile.platformAccountId);
    assert(metrics.engagementRate > 0);
    console.log(`✅ Provider contract verified for ${profile.displayName} (${profile.followerCount} followers)`);

    // -------------------------------------------------------------
    // 3. DATABASE USER & SOCIAL ACCOUNT PERSISTENCE
    // -------------------------------------------------------------
    console.log("\n--- [3] Creator Social Account & Sync Ingestion ---");
    const testEmail = `creator_v3_${testSuffix}@lazarus.test`;
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: "hash_placeholder",
        name: `V3 Creator ${testSuffix}`,
        role: "CREATOR",
        creatorProfile: {
          create: {
            niches: ["tech", "ai"],
            bio: "Building the next-gen AI tech reviews",
            isMouSigned: true
          }
        }
      },
      include: { creatorProfile: true }
    });

    const creatorProfileId = user.creatorProfile.id;

    // Create Social Account
    const socialAccount = await prisma.socialAccount.create({
      data: {
        creatorProfileId,
        platform: "YOUTUBE",
        platformAccountId: `ch_${testSuffix}`,
        username: `techreviewer_${testSuffix}`,
        displayName: `Tech Reviews ${testSuffix}`,
        status: "CONNECTED",
        scopes: ["youtube.readonly"]
      }
    });

    // Save encrypted credentials
    await TokenService.saveCredentials(socialAccount.id, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 3600
    });

    // Verify token retrieval & decryption
    const retrievedToken = await TokenService.getValidToken(socialAccount.id);
    assert.strictEqual(retrievedToken, tokens.accessToken);
    console.log("✅ Encrypted credential stored & decrypted from database");

    // Ingest content & snapshot
    for (const c of content) {
      await prisma.creatorContent.create({
        data: {
          creatorProfileId,
          platform: "YOUTUBE",
          externalContentId: `${c.externalContentId}_${testSuffix}`,
          title: c.title,
          contentUrl: c.contentUrl,
          publishedAt: c.publishedAt,
          viewCount: c.viewCount,
          likeCount: c.likeCount,
          commentCount: c.commentCount
        }
      });
    }

    await prisma.creatorMetricSnapshot.create({
      data: {
        creatorProfileId,
        platform: "YOUTUBE",
        followerCount: 48500,
        totalViews: BigInt(2450000),
        engagementRate: 4.85
      }
    });
    console.log("✅ Content library items and metric snapshots ingested");

    // -------------------------------------------------------------
    // 4. UNIFIED METRICS & MEDIA KIT GENERATION
    // -------------------------------------------------------------
    console.log("\n--- [4] Unified Cross-Platform Analytics & Media Kit ---");
    const unified = await MetricsService.getUnifiedMetrics(creatorProfileId);
    assert.strictEqual(unified.totalAudience, 48500);
    assert(unified.recentAvgViews > 0);
    assert(unified.aggregateEngagementRate > 0);
    assert(unified.platformBreakdown.YOUTUBE);
    console.log(`✅ Unified metrics aggregated: ${unified.totalAudience} audience, ${unified.aggregateEngagementRate}% engagement rate`);

    const mediaKit = await MetricsService.generateMediaKit(creatorProfileId);
    assert.strictEqual(mediaKit.creatorId, creatorProfileId);
    assert.strictEqual(mediaKit.verifiedPlatforms.length, 1);
    assert(mediaKit.topPerformingContent.length > 0);
    console.log("✅ Media Kit compiled successfully with verified badges and top content");

    // -------------------------------------------------------------
    // 5. DETERMINISTIC MATCHING ENGINE & EXPLAINABILITY
    // -------------------------------------------------------------
    console.log("\n--- [5] Opportunity Engine & Explainable Matching ---");
    const brandUser = await prisma.user.create({
      data: {
        email: `brand_v3_${testSuffix}@lazarus.test`,
        passwordHash: "hash_placeholder",
        name: `V3 Brand ${testSuffix}`,
        role: "BRAND",
        brandProfile: {
          create: {
            companyName: `Apex AI Labs ${testSuffix}`,
            isVerified: true
          }
        }
      },
      include: { brandProfile: true }
    });

    const highMatchCampaign = await prisma.campaign.create({
      data: {
        brandProfileId: brandUser.brandProfile.id,
        title: `AI Coding Tools Sponsorship ${testSuffix}`,
        description: "Looking for AI and Tech creators with active YouTube channels to review our developer copilot.",
        niches: ["tech", "ai"],
        targetPlatforms: ["YOUTUBE"],
        minFollowers: 10000,
        minEngagementRate: 2.0,
        budget: 85000,
        deliverables: "1x Dedicated 10-minute YouTube review + 1x Short clip"
      }
    });

    const lowMatchCampaign = await prisma.campaign.create({
      data: {
        brandProfileId: brandUser.brandProfile.id,
        title: `Fitness Apparel Summer Launch ${testSuffix}`,
        description: "Fitness creators for workout gear demonstration on Instagram.",
        niches: ["fitness", "fashion"],
        targetPlatforms: ["INSTAGRAM"],
        minFollowers: 100000,
        minEngagementRate: 6.0,
        budget: 40000,
        deliverables: "2x Instagram Reels"
      }
    });

    const updatedCreatorProfile = await prisma.creatorProfile.findUnique({
      where: { id: creatorProfileId },
      include: { socialAccounts: true }
    });

    const evalHigh = MatchingService.evaluateMatch(updatedCreatorProfile, unified, highMatchCampaign);
    const evalLow = MatchingService.evaluateMatch(updatedCreatorProfile, unified, lowMatchCampaign);

    console.log(`High Match Score: ${evalHigh.overallScore}/100 — Rationale: "${evalHigh.explanation}"`);
    console.log(`Low Match Score: ${evalLow.overallScore}/100 — Rationale: "${evalLow.explanation}"`);

    assert(evalHigh.overallScore >= 80, "Matching tech campaign should score high (>= 80)");
    assert(evalLow.overallScore < 50, "Unrelated fitness/Instagram campaign should score low (< 50)");
    assert(evalHigh.explanation.includes("tech"), "Explanation must cite matching niche");
    console.log("✅ Deterministic multi-factor matching engine and explainability verified");

    // -------------------------------------------------------------
    // 6. 10-STAGE COLLABORATION LIFECYCLE
    // -------------------------------------------------------------
    console.log("\n--- [6] 10-Stage Collaboration Lifecycle Workspace ---");
    const collab = await prisma.collaboration.create({
      data: {
        campaignId: highMatchCampaign.id,
        creatorProfileId,
        brandProfileId: brandUser.brandProfile.id,
        status: "APPLIED",
        agreedAmount: 85000,
        deliverableTerms: highMatchCampaign.deliverables
      }
    });

    // APPLIED -> SHORTLISTED
    const c1 = await CollaborationService.transitionStatus(collab.id, "SHORTLISTED", brandUser.id);
    assert.strictEqual(c1.status, "SHORTLISTED");

    // SHORTLISTED -> NEGOTIATION
    const c2 = await CollaborationService.transitionStatus(collab.id, "NEGOTIATION", brandUser.id);
    assert.strictEqual(c2.status, "NEGOTIATION");

    // NEGOTIATION -> ACCEPTED
    const c3 = await CollaborationService.transitionStatus(collab.id, "ACCEPTED", user.id);
    assert.strictEqual(c3.status, "ACCEPTED");

    // ACCEPTED -> IN_PROGRESS
    const c4 = await CollaborationService.transitionStatus(collab.id, "IN_PROGRESS", user.id);
    assert.strictEqual(c4.status, "IN_PROGRESS");

    // Add Deliverable
    const deliv = await prisma.collaborationDeliverable.create({
      data: {
        collaborationId: collab.id,
        title: "Dedicated YouTube Review Draft",
        description: "Submit unlisted YouTube video URL for review"
      }
    });

    // Creator submits deliverable
    const submittedDeliv = await CollaborationService.submitDeliverable(
      deliv.id,
      {
        submissionUrl: "https://youtu.be/unlisted_demo_draft_123",
        notes: "Draft review is ready for review with timestamps."
      },
      user.id
    );
    assert.strictEqual(submittedDeliv.status, "SUBMITTED");
    console.log("✅ Deliverable submitted by creator");

    // Brand requests revision
    const revisedDeliv = await CollaborationService.reviewDeliverable(
      deliv.id,
      {
        decision: "CHANGES_REQUESTED",
        feedback: "Please add developer discount code in the first 60 seconds."
      },
      brandUser.id
    );
    assert.strictEqual(revisedDeliv.status, "CHANGES_REQUESTED");
    console.log("✅ Brand review requested revisions with feedback");

    // Creator resubmits
    await CollaborationService.submitDeliverable(
      deliv.id,
      {
        submissionUrl: "https://youtu.be/unlisted_demo_draft_v2",
        notes: "Discount code callout added in intro."
      },
      user.id
    );

    // Brand approves
    const approvedDeliv = await CollaborationService.reviewDeliverable(
      deliv.id,
      { decision: "APPROVED", feedback: "Approved! Great work." },
      brandUser.id
    );
    assert.strictEqual(approvedDeliv.status, "APPROVED");

    const finalCollab = await prisma.collaboration.findUnique({
      where: { id: collab.id }
    });
    assert.strictEqual(finalCollab.status, "COMPLETED");
    console.log("✅ Final deliverable approved and collaboration marked COMPLETED");

    // -------------------------------------------------------------
    // 7. NOTIFICATIONS & AUDIT LOGS
    // -------------------------------------------------------------
    console.log("\n--- [7] In-App Notifications & Audit Trail ---");
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id }
    });
    assert(notifications.length > 0, "Creator should have received collaboration notifications");
    console.log(`✅ ${notifications.length} in-app notifications generated for creator`);

    const auditLogs = await prisma.auditLog.findMany({
      where: { resourceId: collab.id }
    });
    assert(auditLogs.length > 0, "Audit logs must record status transitions");
    console.log(`✅ ${auditLogs.length} audit trail events recorded`);

    // Clean up test data gracefully
    await prisma.user.deleteMany({
      where: { id: { in: [user.id, brandUser.id] } }
    });
    console.log("✅ Test sandbox data cleaned up");

    console.log("\n🎉 ALL LAZARUS V3 PLATFORM AUTOMATED TESTS PASSED!");
  } catch (error) {
    console.error("❌ V3 Platform Test Failed:", error);
    process.exit(1);
  }
}

runV3PlatformTests().then(() => process.exit(0));
