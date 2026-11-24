# LAZARUS V3 SECURITY REVIEW & THREAT MODEL

*Date: 2026-11-24*  
*Target Environment: Node.js (Express 5) + React 19 + Hosted Neon PostgreSQL 18.7*

---

## 1. THREAT MODEL & DEFENSE-IN-DEPTH MATRIX

| Attack Vector | Risk Level | Mitigation in Lazarus V3 | Status |
|---|---|---|---|
| **Insecure Direct Object Reference (IDOR)** | Critical | Strict ownership validation in controllers and middleware. Users can only access/modify campaigns, social accounts, and deliverables they own. | Verified |
| **Plaintext OAuth Token Exposure** | Critical | AES-256-GCM encryption with dynamic 12-byte IVs and 16-byte authentication tags. Tokens are never transmitted to frontend or printed in server logs. | Verified |
| **OAuth CSRF State Tampering** | High | Base64URL-encoded state tokens bound cryptographically to the authenticated user ID and random salt. | Verified |
| **Broken Role-Based Access Control (RBAC)** | High | Server-side `authorize("CREATOR", "BRAND", "ADMIN")` guards applied to all sensitive routes. Frontend `ProtectedRoute` mirrors server-side boundaries. | Verified |
| **SQL Injection / Query Tampering** | High | Prisma ORM parameterizes all database queries. Raw SQL string concatenation is strictly prohibited. | Verified |
| **JWT Tampering / Forgery** | High | Standard HMAC-SHA256 signing with secret key validation (`JWT_SECRET`) and default 7-day expiration. | Verified |
| **Password Credential Compromise** | High | Passwords hashed using bcryptjs (salt rounds = 10). Minimum password length enforced. | Verified |
| **Data Privacy (GDPR / CCPA)** | Medium | Dedicated `/api/admin/privacy/export` endpoint allows complete user data export. Disconnect purges OAuth tokens and credentials. | Verified |

---

## 2. AES-256-GCM TOKEN ENCRYPTION AUDIT

External OAuth tokens (Google/YouTube, Meta/Instagram, Twitch) grant persistent access to creator channels.
In Lazarus V3, `backend/src/utils/crypto.js` enforces:
1. **Key Derivation**: 32-byte key derived via SHA-256 hash of `TOKEN_ENCRYPTION_KEY`.
2. **Authenticated Cipher**: AES-256 in Galois/Counter Mode (GCM).
3. **Initialization Vector**: Cryptographically secure 12-byte random IV (`crypto.randomBytes(12)`) per encryption operation.
4. **Integrity Tag**: 16-byte authentication tag (`cipher.getAuthTag()`).
5. **Tamper Detection**: If any byte of the ciphertext or tag is modified, decryption immediately throws an error and rejects the payload.

---

## 3. IDOR DEFENSE VALIDATION

All object lookups across creator profiles, campaigns, social accounts, deliverables, and collaborations perform identity derivation from the authenticated JWT (`req.user.id`).
- When Brand A requests applicants for Campaign B: Rejected with `403 Forbidden`.
- When Creator A attempts to submit a deliverable for Creator B: Rejected with `403 Forbidden`.
- When an unrelated user attempts to view a private collaboration: Rejected with `403 Forbidden`.

---

## 4. SECRET MANAGEMENT & REPOSITORY SANITATION

1. `.env` is listed in root `.gitignore` and `backend/.gitignore`.
2. Git tracking verification (`git ls-files | findstr /i ".env"`) confirms no `.env` file is tracked.
3. Fallback credentials in `.env.example` contain clear placeholders without sensitive secrets.
4. Server logs output only redacted metadata.
