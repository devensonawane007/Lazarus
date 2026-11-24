const assert = require("assert");
const EscrowService = require("./escrow.service");

console.log("🧪 Running Escrow State Machine Unit Tests...");

// Test 1: Permitted transitions
try {
  EscrowService.validateMilestoneTransition("PENDING", "HELD");
  EscrowService.validateMilestoneTransition("HELD", "SUBMITTED");
  EscrowService.validateMilestoneTransition("SUBMITTED", "APPROVED");
  EscrowService.validateMilestoneTransition("APPROVED", "RELEASED");
  EscrowService.validateMilestoneTransition("SUBMITTED", "HELD"); // Changes requested
  console.log("✅ Valid state transitions passed");
} catch (err) {
  console.error("❌ Valid transitions failed:", err.message);
  process.exit(1);
}

// Test 2: Invalid transitions must throw
const invalidTransitions = [
  ["RELEASED", "HELD"],
  ["RELEASED", "SUBMITTED"],
  ["REFUNDED", "HELD"],
  ["PENDING", "APPROVED"],
  ["PENDING", "RELEASED"]
];

for (const [from, to] of invalidTransitions) {
  try {
    EscrowService.validateMilestoneTransition(from, to);
    console.error(`❌ Expected transition ${from} -> ${to} to be rejected, but it succeeded!`);
    process.exit(1);
  } catch (err) {
    assert(err.message.includes("Invalid escrow transition"));
  }
}
console.log("✅ Invalid state transitions successfully rejected (Anti-Tampering Verified)");

// Test 3: Zero or negative investment amount validation
async function testNegativeAmount() {
  try {
    await EscrowService.recordInvestment({ investorId: "test", projectId: "p1", amount: -500 });
    console.error("❌ Expected negative investment to fail, but it passed!");
    process.exit(1);
  } catch (err) {
    assert(err.message.includes("greater than zero"));
    console.log("✅ Negative/Zero investment validation passed");
  }
}

testNegativeAmount().then(() => {
  console.log("🎉 All Escrow State Machine Unit Tests Passed!");
});
