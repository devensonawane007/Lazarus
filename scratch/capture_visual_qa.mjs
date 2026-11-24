import { chromium } from "../frontend/node_modules/playwright/index.mjs";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.resolve("docs/screenshots");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function getAuth(email, password, role = "creator", name = "Test User") {
  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) return data;
  } catch (err) {
    console.log("Login failed, will try register:", err.message);
  }

  // Register fallback
  const regRes = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name, role, companyName: role === "brand" ? "NexTech AI" : undefined })
  });
  return await regRes.json();
}

async function setupCreatorData(token) {
  try {
    // Connect mock YouTube if not connected
    await fetch("http://localhost:5000/api/integrations/mock/YOUTUBE", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    // Sign MOU
    await fetch("http://localhost:5000/api/creator/mou", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ signatureData: "data:image/png;base64,mockSig" })
    });
  } catch (err) {
    console.log("Mock data prep notice:", err.message);
  }
}

async function setupBrandData(token) {
  try {
    // Create a sample campaign if none exist
    const campsRes = await fetch("http://localhost:5000/api/brand/campaigns", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const camps = await campsRes.json();
    if (!camps || camps.length === 0) {
      await fetch("http://localhost:5000/api/brand/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: "Q4 AI Productivity Suite Launch Sponsorship",
          description: "Seeking tech and productivity creators for dedicated YouTube walkthrough reviews and Instagram reels.",
          budget: 85000,
          deliverables: "1 Dedicated YouTube Video (8-12 min) + 1 Instagram Reel",
          minFollowers: 10000,
          minEngagementRate: 3.5,
          niches: ["tech", "ai", "productivity"],
          targetPlatforms: ["YOUTUBE", "INSTAGRAM"]
        })
      });
    }
  } catch (err) {
    console.log("Brand sample prep notice:", err.message);
  }
}

async function captureScreen(browser, { url, theme, width, height, isMobile = false, outputPath, auth = null }) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile,
    colorScheme: theme
  });

  const page = await context.newPage();

  // Navigate to login first to set origin-bound localStorage
  await page.goto("http://localhost:5173/login");
  await page.evaluate(({ theme, auth }) => {
    localStorage.setItem("lazarus_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    if (auth) {
      localStorage.setItem("lazarus_token", auth.token);
      localStorage.setItem("user", JSON.stringify(auth.user));
    }
  }, { theme, auth });

  // Navigate to target URL
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  // Re-apply theme state
  await page.evaluate((t) => {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("lazarus_theme", t);
  }, theme);

  await page.waitForTimeout(500);

  await page.screenshot({ path: outputPath, fullPage: false });
  console.log(`Saved: ${path.basename(outputPath)} (${theme}, ${width}x${height})`);

  await context.close();
}

async function main() {
  console.log("Starting Lazarus V3 Dual-Theme Visual QA capture...");
  const browser = await chromium.launch({ headless: true });

  // Get authentic test accounts
  const creatorAuth = await getAuth("alex@lazarus.io", "Password123!", "creator", "Alex Rivera");
  if (creatorAuth?.token) {
    await setupCreatorData(creatorAuth.token);
  }

  const brandAuth = await getAuth("sponsor@nextech.io", "Password123!", "brand", "NexTech AI");
  if (brandAuth?.token) {
    await setupBrandData(brandAuth.token);
  }

  // 1. Landing Page (Desktop: 1440x900)
  await captureScreen(browser, {
    url: "http://localhost:5173/",
    theme: "dark",
    width: 1440,
    height: 900,
    outputPath: path.join(OUTPUT_DIR, "landing-dark-desktop.png")
  });

  await captureScreen(browser, {
    url: "http://localhost:5173/",
    theme: "light",
    width: 1440,
    height: 900,
    outputPath: path.join(OUTPUT_DIR, "landing-light-desktop.png")
  });

  // 2. Login Page (Desktop: 1440x900)
  await captureScreen(browser, {
    url: "http://localhost:5173/login",
    theme: "dark",
    width: 1440,
    height: 900,
    outputPath: path.join(OUTPUT_DIR, "login-dark-desktop.png")
  });

  await captureScreen(browser, {
    url: "http://localhost:5173/login",
    theme: "light",
    width: 1440,
    height: 900,
    outputPath: path.join(OUTPUT_DIR, "login-light-desktop.png")
  });

  // 3. Creator Studio (Desktop: 1440x900)
  await captureScreen(browser, {
    url: "http://localhost:5173/creator",
    theme: "dark",
    width: 1440,
    height: 900,
    auth: creatorAuth,
    outputPath: path.join(OUTPUT_DIR, "creator-studio-dark-desktop.png")
  });

  await captureScreen(browser, {
    url: "http://localhost:5173/creator",
    theme: "light",
    width: 1440,
    height: 900,
    auth: creatorAuth,
    outputPath: path.join(OUTPUT_DIR, "creator-studio-light-desktop.png")
  });

  // 4. Brand Studio (Desktop: 1440x900)
  await captureScreen(browser, {
    url: "http://localhost:5173/brand",
    theme: "dark",
    width: 1440,
    height: 900,
    auth: brandAuth,
    outputPath: path.join(OUTPUT_DIR, "brand-studio-dark-desktop.png")
  });

  await captureScreen(browser, {
    url: "http://localhost:5173/brand",
    theme: "light",
    width: 1440,
    height: 900,
    auth: brandAuth,
    outputPath: path.join(OUTPUT_DIR, "brand-studio-light-desktop.png")
  });

  // 5. Mobile (390x844) Landing Page
  await captureScreen(browser, {
    url: "http://localhost:5173/",
    theme: "dark",
    width: 390,
    height: 844,
    isMobile: true,
    outputPath: path.join(OUTPUT_DIR, "landing-dark-mobile.png")
  });

  await captureScreen(browser, {
    url: "http://localhost:5173/",
    theme: "light",
    width: 390,
    height: 844,
    isMobile: true,
    outputPath: path.join(OUTPUT_DIR, "landing-light-mobile.png")
  });

  // 6. Mobile (390x844) Creator Studio
  await captureScreen(browser, {
    url: "http://localhost:5173/creator",
    theme: "dark",
    width: 390,
    height: 844,
    isMobile: true,
    auth: creatorAuth,
    outputPath: path.join(OUTPUT_DIR, "creator-studio-dark-mobile.png")
  });

  await captureScreen(browser, {
    url: "http://localhost:5173/creator",
    theme: "light",
    width: 390,
    height: 844,
    isMobile: true,
    auth: creatorAuth,
    outputPath: path.join(OUTPUT_DIR, "creator-studio-light-mobile.png")
  });

  await browser.close();
  console.log("All 12 visual QA screenshots generated successfully!");
}

main().catch((err) => {
  console.error("Main execution failed:", err);
  process.exit(1);
});
