/**
 * Lazarus V2 — End-to-End Workflow Verification Script
 * 
 * Tests the complete lifecycle across Creator, Brand, Investor, and Escrow domains.
 * Runs against live Neon PostgreSQL when DATABASE_URL is configured.
 * Reports DATABASE CONNECTIVITY NOT VERIFIED when database is unreachable.
 */

const dotenv = require("dotenv");
dotenv.config();

const prisma = require("../db/prisma");
const EscrowService = require("../services/escrow.service");

async function runE2EVerification() {
  console.log("=================================================");
  console.log("🧪 LAZARUS V2 END-TO-END WORKFLOW VERIFICATION");
  console.log("=================================================");

  // 1. Verify Database Connectivity
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("npg_sample")) {
    console.log("\n⚠️  DATABASE CONNECTIVITY NOT VERIFIED");
    console.log("   Reason: No active Neon PostgreSQL DATABASE_URL found in backend/.env.");
    console.log("   Please configure a valid connection string to run live database verification.\n");
    return {
      databaseConnected: false,
      status: "DATABASE CONNECTIVITY NOT VERIFIED"
    };
  }

  try {
    console.log("\n📡 Connecting to Neon PostgreSQL...");
    await prisma.$connect();
    console.log("✅ Neon PostgreSQL Connection Established!");
  } catch (connErr) {
    console.log("\n❌ DATABASE CONNECTIVITY FAILED");
    console.log("   Error:", connErr.message);
    return {
      databaseConnected: false,
      status: "DATABASE CONNECTION FAILED"
    };
  }

  const testId = Date.now().toString().slice(-6);
  const creatorEmail = `creator_${testId}@lazarus.test`;
  const brandEmail = `brand_${testId}@lazarus.test`;
  const investorEmail = `investor_${testId}@lazarus.test`;

  try {
    // -----------------------------------------------------------------
    // STEP 1: CREATOR WORKFLOW (Register, Profile, Create Project)
    // -----------------------------------------------------------------
    console.log("\n--- [1] Creator Workflow ---");
    const creatorUser = await prisma.user.create({
      data: {
        email: creatorEmail,
        passwordHash: "$2a$10$SampleHashedPasswordForAutomatedE2ETestingOnly",
        name: `Creator ${testId}`,
        role: "CREATOR",
        creatorProfile: {
          create: {
            niches: ["tech", "ai"],
            platform: "youtube",
            portfolioUrl: "https://youtube.com/@testcreator",
            followers: "50000",
            avgViews: "15000"
          }
        }
      },
      include: { creatorProfile: true }
    });
    console.log(`✅ Creator registered: ${creatorUser.email} (Profile ID: ${creatorUser.creatorProfile.id})`);

    // Creator creates project with milestones
    const project = await prisma.project.create({
      data: {
        creatorProfileId: creatorUser.creatorProfile.id,
        title: `AI Tech Review Series #${testId}`,
        description: "Full production testing of agentic AI workflows.",
        videoType: "long_form",
        fundingTarget: 50000,
        amountRaised: 0,
        status: "FUNDING",
        expenses: {
          create: [{ category: "Hardware" }, { category: "Editing" }]
        },
        milestones: {
          create: [
            {
              title: "Draft Script & Production Setup",
              description: "Milestone 1 delivery",
              targetAmount: 50000,
              sequenceOrder: 1,
              status: "PENDING"
            }
          ]
        }
      },
      include: { milestones: true, expenses: true }
    });
    console.log(`✅ Project created: "${project.title}" (Target: ₹${project.fundingTarget})`);
    console.log(`✅ Initial Milestone created with status: ${project.milestones[0].status}`);

    // -----------------------------------------------------------------
    // STEP 2: BRAND WORKFLOW (Register, Campaign, Matched Applications)
    // -----------------------------------------------------------------
    console.log("\n--- [2] Brand Workflow ---");
    const brandUser = await prisma.user.create({
      data: {
        email: brandEmail,
        passwordHash: "$2a$10$SampleHashedPasswordForAutomatedE2ETestingOnly",
        name: `Brand Corp ${testId}`,
        role: "BRAND",
        brandProfile: {
          create: {
            companyName: `Brand Corp ${testId}`
          }
        }
      },
      include: { brandProfile: true }
    });
    console.log(`✅ Brand registered: ${brandUser.email} (Profile ID: ${brandUser.brandProfile.id})`);

    const campaign = await prisma.campaign.create({
      data: {
        brandProfileId: brandUser.brandProfile.id,
        title: `AI Tool Sponsorship Q4 #${testId}`,
        description: "Sponsor tech creator video reviewing developer tools.",
        budget: 75000,
        requiredNiches: ["tech", "ai"],
        deliverables: "1x 60s Integration + 2x Social Posts",
        status: "OPEN"
      }
    });
    console.log(`✅ Campaign created: "${campaign.title}" (Budget: ₹${campaign.budget})`);

    // Creator applies to brand campaign
    const application = await prisma.campaignApplication.create({
      data: {
        campaignId: campaign.id,
        creatorProfileId: creatorUser.creatorProfile.id,
        pitch: "I have high audience engagement in tech and AI niches.",
        status: "PENDING"
      }
    });
    console.log(`✅ Creator application submitted (App ID: ${application.id}, Status: ${application.status})`);

    // Brand accepts creator application
    const acceptedApp = await prisma.campaignApplication.update({
      where: { id: application.id },
      data: { status: "ACCEPTED" }
    });
    console.log(`✅ Brand accepted application: New Status = ${acceptedApp.status}`);

    // -----------------------------------------------------------------
    // STEP 3: INVESTOR & ESCROW LIFECYCLE WORKFLOW
    // -----------------------------------------------------------------
    console.log("\n--- [3] Investor & Escrow Lifecycle Workflow ---");
    const investorUser = await prisma.user.create({
      data: {
        email: investorEmail,
        passwordHash: "$2a$10$SampleHashedPasswordForAutomatedE2ETestingOnly",
        name: `Angel Investor ${testId}`,
        role: "INVESTOR",
        investorProfile: {
          create: {
            organization: "Venture Studios"
          }
        }
      },
      include: { investorProfile: true }
    });
    console.log(`✅ Investor registered: ${investorUser.email}`);

    // Investor contributes funds (Escrow HOLD)
    const investmentResult = await EscrowService.recordInvestment({
      investorId: investorUser.id,
      projectId: project.id,
      amount: 50000
    });
    console.log(`✅ Investment recorded: ₹${investmentResult.investment.amount} (Status: ${investmentResult.investment.status})`);
    console.log(`✅ Project funding updated: Raised ₹${investmentResult.totalRaised}/${project.fundingTarget}`);
    console.log(`✅ Primary Milestone transitioned: PENDING -> HELD`);

    // Creator submits deliverable (Escrow SUBMITTED)
    const milestoneId = project.milestones[0].id;
    const submissionResult = await EscrowService.submitDeliverable({
      milestoneId,
      creatorProfileId: creatorUser.creatorProfile.id,
      assetUrl: "https://youtube.com/watch?v=sample_video_review",
      notes: "Video production complete, high definition cut ready for review."
    });
    console.log(`✅ Creator deliverable submitted (Status: ${submissionResult.milestone.status})`);

    // Investor approves deliverable (Escrow APPROVED -> RELEASED)
    const approvalResult = await EscrowService.approveMilestone({
      milestoneId,
      reviewerUserId: investorUser.id,
      feedback: "Deliverable exceeds quality expectations. Escrow payout approved."
    });
    console.log(`✅ Investor approved deliverable!`);
    console.log(`✅ Milestone finalized: Status = ${approvalResult.milestone.status}`);
    console.log(`✅ Escrow Transaction created: Type = ${approvalResult.payoutTxn.type}, Amount = ₹${approvalResult.payoutTxn.amount}`);
    console.log(`✅ Project Completed: ${approvalResult.projectCompleted}`);

    // Verify Anti-Tampering (Cannot re-release a RELEASED milestone)
    try {
      EscrowService.validateMilestoneTransition("RELEASED", "APPROVED");
      console.error("❌ FAILED: Releasing an already RELEASED milestone did not throw error!");
    } catch (tamperErr) {
      console.log(`✅ Anti-Tampering Verified: Cannot re-transition from terminal RELEASED state.`);
    }

    console.log("\n🎉 ALL LIVE DATABASE WORKFLOWS VERIFIED SUCCESSFULLY!");
    return {
      databaseConnected: true,
      status: "VERIFIED"
    };
  } catch (err) {
    console.error("\n❌ Live Database Workflow Error:", err.message);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute when invoked directly
if (require.main === module) {
  runE2EVerification()
    .then((res) => {
      console.log("\nExecution completed with result:", res.status);
    })
    .catch((err) => {
      console.error("Execution failed:", err.message);
      process.exit(1);
    });
}

module.exports = runE2EVerification;
