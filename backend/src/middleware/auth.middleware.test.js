const assert = require("assert");
const jwt = require("jsonwebtoken");
const { authorize, JWT_SECRET } = require("./auth.middleware");

console.log("🧪 Running Auth & RBAC Middleware Unit Tests...");

// Test 1: JWT Signing & Verification
const testPayload = { id: "user_123", email: "creator@example.com", role: "CREATOR" };
const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: "1h" });
const decoded = jwt.verify(token, JWT_SECRET);

assert.strictEqual(decoded.id, testPayload.id);
assert.strictEqual(decoded.role, testPayload.role);
console.log("✅ JWT signing and verification passed");

// Test 2: RBAC Authorization
const mockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.jsonBody = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonBody = data;
    return res;
  };
  return res;
};

// Test 2a: Allowed role
let nextCalled = false;
const creatorReq = { user: { id: "1", role: "CREATOR" } };
const creatorMiddleware = authorize("CREATOR");
creatorMiddleware(creatorReq, mockRes(), () => { nextCalled = true; });
assert(nextCalled, "Expected next() to be called for matching role");
console.log("✅ Allowed role granted access");

// Test 2b: Forbidden role
let forbiddenRes = mockRes();
let forbiddenNext = false;
const brandMiddleware = authorize("BRAND");
brandMiddleware(creatorReq, forbiddenRes, () => { forbiddenNext = true; });
assert(!forbiddenNext, "next() should not be called for forbidden role");
assert.strictEqual(forbiddenRes.statusCode, 403);
assert(forbiddenRes.jsonBody.message.includes("Forbidden"));
console.log("✅ Forbidden role rejected with 403");

// Test 2c: Unauthenticated request to protected route
let unauthRes = mockRes();
let unauthNext = false;
brandMiddleware({ user: null }, unauthRes, () => { unauthNext = true; });
assert(!unauthNext);
assert.strictEqual(unauthRes.statusCode, 401);
console.log("✅ Unauthenticated request rejected with 401");

console.log("🎉 All Auth & RBAC Middleware Unit Tests Passed!");
