# LAZARUS V3 — OPPORTUNITY ENGINE & MATCHING ALGORITHM VALIDATION

**Service:** `MatchingService` (`backend/src/services/matching.service.js`)  
**Design Principle:** Deterministic, Transparent, Explainable Compatibility  
**Target:** Creator-to-Campaign Brand Sponsorship Discovery  

---

## 1. Engine Objective & Philosophy

Lazarus rejects opaque, "black-box" creator matching. Instead, the Opportunity Engine uses a deterministic, multi-factor scoring model that computes explainable compatibility ratings ($0$ to $100\%$) between a creator's verified metrics and a brand's campaign requirements.

Creators and brands can inspect the exact breakdown of why a recommendation was made.

---

## 2. Multi-Factor Scoring Formula

The overall compatibility score is computed as a weighted sum of four independent compatibility factors:

$$\text{Overall Score} = (S_{\text{niche}} \times 0.35) + (S_{\text{platform}} \times 0.25) + (S_{\text{audience}} \times 0.20) + (S_{\text{engagement}} \times 0.20)$$

### A. Factor 1: Niche Compatibility ($S_{\text{niche}}$, Weight: 35%)
Evaluates alignment between creator focus tags (`creatorProfile.niches`) and campaign target niches (`campaign.niches`):
* If campaign has no specific niche requirements: $S_{\text{niche}} = 80$ (Open catalog).
* If overlap exists:
  $$S_{\text{niche}} = \min\left(100, \left\lfloor \frac{|N_{\text{creator}} \cap N_{\text{campaign}}|}{|N_{\text{campaign}}|} \times 100 \right\rfloor + 20\right)$$
* If zero overlap: $S_{\text{niche}} = 15$.

### B. Factor 2: Platform Alignment ($S_{\text{platform}}$, Weight: 25%)
Evaluates whether the creator has connected the platforms requested by the brand (`campaign.targetPlatforms`):
* If campaign has no target platforms: $S_{\text{platform}} = 100$.
* If creator has connected all required platforms: $S_{\text{platform}} = 100$.
* Partial match: proportional to matching count:
  $$S_{\text{platform}} = \left\lfloor \frac{|P_{\text{creator}} \cap P_{\text{campaign}}|}{|P_{\text{campaign}}|} \times 100 \right\rfloor$$
* Zero match: $S_{\text{platform}} = 10$.

### C. Factor 3: Audience Scale Compatibility ($S_{\text{audience}}$, Weight: 20%)
Evaluates creator's verified total audience against campaign minimum (`campaign.minFollowers`):
* If creator meets or exceeds minimum ($T_{\text{audience}} \ge M_{\text{followers}}$): $S_{\text{audience}} = 100$.
* If below minimum:
  $$S_{\text{audience}} = \max\left(10, \left\lfloor \frac{T_{\text{audience}}}{M_{\text{followers}}} \times 80 \right\rfloor\right)$$

### D. Factor 4: Engagement Quality Compatibility ($S_{\text{engagement}}$, Weight: 20%)
Evaluates creator's verified aggregate engagement rate against campaign minimum (`campaign.minEngagementRate`):
* If creator meets or exceeds minimum: $S_{\text{engagement}} = 100$.
* If below minimum:
  $$S_{\text{engagement}} = \max\left(20, \left\lfloor \frac{E_{\text{creator}}}{E_{\text{campaign}}} \times 80 \right\rfloor\right)$$

---

## 3. Explainability Rationale Generation

In addition to the numeric score, the engine constructs a natural-language rationale:

```javascript
const reasons = [];
if (commonNiches.length > 0) reasons.push(`aligned with your ${commonNiches.join(", ")} content focus`);
if (targetPlatforms.length > 0 && platformScore >= 80) reasons.push(`matches your connected ${connectedPlatforms.join(", ")} presence`);
if (totalAudience > 0 && audienceScore >= 80) reasons.push(`verified audience reach (${totalAudience.toLocaleString()} followers)`);
if (engagementRate > 0) reasons.push(`${engagementRate}% engagement rate`);

const explanation = reasons.length > 0
  ? `Recommended because of your ${reasons.join(", and ")}.`
  : "Standard opportunity match based on platform catalog.";
```

### Verified Test Output Example:
* **High Match (100%):** *"Recommended because of your aligned with your tech, ai content focus, and matches your connected YOUTUBE presence, and verified audience reach (48,500 followers), and 7.07% engagement rate."*
* **Low Match (36%):** *"Recommended because of your 7.07% engagement rate."*

---

## 4. Test Verification Summary

The Opportunity Engine was verified with automated test suites against Neon PostgreSQL:
1. Niche weighting calculations verified.
2. Zero platform overlap penalization verified.
3. Ranking order verified (results returned in strict descending match score order).
4. Application status hydration verified (cards display "Already Applied", "Shortlisted", etc.).
