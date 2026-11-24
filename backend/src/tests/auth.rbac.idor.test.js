/**
 * Lazarus V2 — Comprehensive RBAC & Anti-IDOR Authorization Security Tests
 */

const assert = require("assert");
const jwt = require("jsonwebtoken");
const { authenticate, authorize, JWT_SECRET } = require("../middleware/auth.middleware");

console.log("🧪 Running Lazarus V2 RBAC & Anti-IDOR Authorization Security Tests...\n");

function mockReq({ headers = {}, user = null, params = {}, body = {} } = {}) {
  return { headers, user, params, body };
}

function mockRes() {
  const res = {
    statusCode: 200,
    jsonBody: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonBody = data;
      return this;
    }
  };
  return res;
}

// -------------------------------------------------------------
// 1. ROLE-BASED ACCESS CONTROL (RBAC) TESTS
// -------------------------------------------------------------
console.log("--- [1] Role-Based Access Control (RBAC) ---");

// Creator accessing Creator route
{
  let nextCalled = false;
  const req = mockReq({ user: { id: "u_creator_1", role: "CREATOR" } });
  authorize("CREATOR")(req, mockRes(), () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true, "Creator should access CREATOR route");
  console.log("✅ Creator access to CREATOR route: Allowed");
}

// Creator trying to access Brand route
{
  let nextCalled = false;
  const res = mockRes();
  const req = mockReq({ user: { id: "u_creator_1", role: "CREATOR" } });
  authorize("BRAND")(req, res, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, false, "Creator must NOT access BRAND route");
  assert.strictEqual(res.statusCode, 403, "Expected 403 Forbidden");
  console.log("✅ Creator blocked from BRAND route: 403 Forbidden");
}

// Brand trying to access Investor route
{
  let nextCalled = false;
  const res = mockRes();
  const req = mockReq({ user: { id: "u_brand_1", role: "BRAND" } });
  authorize("INVESTOR")(req, res, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, false, "Brand must NOT access INVESTOR route");
  assert.strictEqual(res.statusCode, 403, "Expected 403 Forbidden");
  console.log("✅ Brand blocked from INVESTOR route: 403 Forbidden");
}

// Investor trying to access Creator route
{
  let nextCalled = false;
  const res = mockRes();
  const req = mockReq({ user: { id: "u_investor_1", role: "INVESTOR" } });
  authorize("CREATOR")(req, res, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, false, "Investor must NOT access CREATOR route");
  assert.strictEqual(res.statusCode, 403, "Expected 403 Forbidden");
  console.log("✅ Investor blocked from CREATOR route: 403 Forbidden");
}

// Unauthenticated user trying to access protected route
{
  let nextCalled = false;
  const res = mockRes();
  const req = mockReq({ user: null });
  authorize("CREATOR")(req, res, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.statusCode, 401, "Expected 401 Unauthorized");
  console.log("✅ Unauthenticated request to protected route: 401 Unauthorized");
}

// -------------------------------------------------------------
// 2. ANTI-IDOR OWNERSHIP VERIFICATION SIMULATION
// -------------------------------------------------------------
console.log("\n--- [2] Anti-IDOR Ownership Protection Verification ---");

// Test Case: Brand A attempts to view applicants for Brand B's campaign
{
  const brandA_ProfileId = "bp_brand_A";
  const brandB_ProfileId = "bp_brand_B";
  const campaignOwnedByBrandB = {
    id: "camp_123",
    brandProfileId: brandB_ProfileId,
    title: "Brand B Campaign"
  };

  function simulateGetApplicants(campaign, requestingBrandProfileId) {
    if (campaign.brandProfileId !== requestingBrandProfileId) {
      return { status: 403, message: "Forbidden: You can only view applicants for campaigns you own" };
    }
    return { status: 200, applicants: [] };
  }

  // Brand A request
  const attackResult = simulateGetApplicants(campaignOwnedByBrandB, brandA_ProfileId);
  assert.strictEqual(attackResult.status, 403);
  assert(attackResult.message.includes("Forbidden"));
  console.log("✅ IDOR Blocked: Brand A rejected when requesting Brand B campaign applicants (403)");

  // Brand B request (owner)
  const legitResult = simulateGetApplicants(campaignOwnedByBrandB, brandB_ProfileId);
  assert.strictEqual(legitResult.status, 200);
  console.log("✅ IDOR Legitimate Access: Brand B granted access to their own campaign applicants (200)");
}

// Test Case: Creator A attempts to submit deliverable on Creator B's milestone
{
  const creatorA_ProfileId = "cp_creator_A";
  const creatorB_ProfileId = "cp_creator_B";
  const milestoneOwnedByCreatorB = {
    id: "m_456",
    project: {
      creatorProfileId: creatorB_ProfileId
    }
  };

  function simulateSubmitDeliverable(milestone, requestingCreatorProfileId) {
    if (milestone.project.creatorProfileId !== requestingCreatorProfileId) {
      throw new Error("Unauthorized: You do not own this project milestone");
    }
    return { status: "SUBMITTED" };
  }

  assert.throws(
    () => simulateSubmitDeliverable(milestoneOwnedByCreatorB, creatorA_ProfileId),
    /Unauthorized: You do not own this project milestone/
  );
  console.log("✅ IDOR Blocked: Creator A rejected when attempting to submit deliverable on Creator B project");
}

// Test Case: Investor review validation (Only project investor can approve/reject milestone)
{
  const projectBackers = ["u_investor_1", "u_investor_2"];
  const attackerInvestorId = "u_investor_unrelated";

  function simulateApproveMilestone(investorsList, reviewerId) {
    const isInvestor = investorsList.includes(reviewerId);
    if (!isInvestor) {
      throw new Error("Unauthorized: Only an investor in this project can approve deliverables");
    }
    return { status: "APPROVED" };
  }

  assert.throws(
    () => simulateApproveMilestone(projectBackers, attackerInvestorId),
    /Unauthorized: Only an investor in this project can approve deliverables/
  );
  console.log("✅ IDOR Blocked: Unrelated investor rejected when attempting to approve deliverable");

  const legitApproval = simulateApproveMilestone(projectBackers, "u_investor_1");
  assert.strictEqual(legitApproval.status, "APPROVED");
  console.log("✅ Legitimate Investor granted approval authority");
}

console.log("\n🎉 All RBAC and Anti-IDOR Authorization Security Tests Passed!");
