# LAZARUS V3 — OAUTH & CREDENTIAL CRYPTOGRAPHIC SECURITY REVIEW

**Standard:** OWASP Application Security Verification Standard (ASVS) Level 2 / NIST SP 800-38D  
**Review Target:** OAuth State Validation, AES-256-GCM Credential Storage, Multi-Tenant Protection  
**Modules Reviewed:** `crypto.js`, `oauth.state.js`, `token.service.js`, `integration.controller.js`  

---

## 1. Threat Model & Security Defenses

| Threat / Attack Vector | Severity | Vulnerability Mechanism | Lazarus V3 Cryptographic Defense |
| :--- | :--- | :--- | :--- |
| **OAuth CSRF & State Tampering** | High | Attacker tricks creator into linking attacker's channel or forges state payload. | **HMAC-SHA256 State Signatures:** State token contains signed payload verified with constant-time equality checks (`timingSafeEqual`). |
| **OAuth State Replay Attack** | High | Attacker captures previously consumed state token and attempts replay. | **Single-Use Nonce Store:** Random 24-byte nonces stored in an in-memory consumed-nonce cache with strict 10-minute TTL rejection. |
| **Ciphertext Transplantation** | High | Ciphertext from Tenant A's credential row copied into Tenant B's row. | **GCM Authenticated Additional Data (AAD):** Ciphertext bound to `"social_account:" + socialAccountId`. Decryption fails tag check on row mismatch. |
| **Token Theft at Rest** | Critical | Database backup or disk leak exposes plaintext OAuth access & refresh tokens. | **AES-256-GCM Encryption:** Tokens encrypted with 256-bit keys, unique 96-bit IVs per operation, and 128-bit authentication tags. |
| **Account Hijacking** | Critical | Creator B attempts to authenticate a social channel already linked to Creator A. | **Anti-IDOR Ownership Validation:** Database uniqueness verification halts with `409 Conflict` if channel is linked to another creator. |
| **Secret Lingering on Disconnect** | Medium | Old credentials remain in database after user disconnects integration. | **Cryptographic Purge:** Deletion of `social_credentials` records and status transition to `DISCONNECTED` upon user request. |

---

## 2. OAuth State Token Lifecycle

```
1. Initiation (GET /api/integrations/:platform/auth-url)
   Creator clicks "Connect YouTube"
   ├── Generate 24 random bytes (nonce)
   ├── Create payload: { userId, platform, nonce, timestamp }
   ├── Base64url encode payload
   ├── Compute HMAC-SHA256 signature using JWT_SECRET
   └── Return formatted state: "<payloadB64>.<hmacHex>"

2. Browser OAuth Dance
   User authenticates on Google / Meta / Twitch consent screen
   Redirects to: /api/integrations/:platform/callback?code=...&state=...

3. Callback Verification (GET or POST /api/integrations/:platform/callback)
   ├── Parse state structure: payloadB64 and hmacHex
   ├── Verify HMAC-SHA256 using timingSafeEqual (Tamper defense)
   ├── Verify TTL: (now - timestamp) <= 10 minutes (Expiry defense)
   ├── Verify Single-Use: consumedNonces.has(nonce) === false (Replay defense)
   ├── Verify User Binding: payload.userId === authenticatedUser.id
   ├── Verify Platform Binding: payload.platform === targetPlatform
   └── Mark nonce as consumed in memory
```

---

## 3. Credential Encryption Specification

### Key Derivation & Management:
* Master Key: Derived from `TOKEN_ENCRYPTION_KEY` via SHA-256 to ensure a 32-byte key regardless of character encoding.
* Key Ring: Versioned keyring supporting `v1` and `v2`.
* Rotation: `rotateCiphertext(encrypted, iv, tag, aad, oldVersion, newVersion)` allows re-encrypting stored credentials to a newer key version without decrypting to plaintext outside memory.
* Production Enforcement: `validateKeyStrength()` rejects default fallback keys and keys under 32 bytes in production environments.

### Token Bundle Structure:
```json
{
  "accessToken": "ya29.a0AfH6SM...",
  "refreshToken": "1//04hWp...",
  "savedAt": "2026-11-24T16:00:00.000Z"
}
```
Both tokens are encrypted as a single serialized bundle under one IV and tag, ensuring atomic updates and eliminating tag mismatch issues.

---

## 4. Audit Trail & Incident Response

All credential events generate immutable records in the `AuditLog` table:
* `SOCIAL_ACCOUNT_CONNECTED`: Created upon initial successful authorization.
* `SOCIAL_ACCOUNT_SYNC_SUCCESS`: Created upon data sync completion.
* `SOCIAL_ACCOUNT_SYNC_FAILED`: Created upon API or token error.
* `SOCIAL_ACCOUNT_DISCONNECT`: Created when credentials are wiped.
* `SECURITY_ACCOUNT_HIJACK_BLOCKED`: Created when cross-creator linking attempt is thwarted.
