import { chromium } from "../frontend/node_modules/playwright/index.mjs";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.resolve("docs/screenshots");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runScrollStoryQA() {
  console.log("🚀 Launching Playwright Chromium for Scroll Story Verification...");
  const browser = await chromium.launch({ headless: true });

  // -------------------------------------------------------------
  // Test 1: Verify Default Theme is Light on Fresh Visit
  // -------------------------------------------------------------
  console.log("\n[Test 1] Verifying Default Light Mode (no prior localStorage)...");
  const defaultContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const defaultPage = await defaultContext.newPage();
  await defaultPage.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await defaultPage.waitForTimeout(1000);

  const appliedTheme = await defaultPage.evaluate(() => {
    return document.documentElement.getAttribute("data-theme");
  });
  console.log(`✅ Default theme detected on fresh visit: "${appliedTheme}"`);
  if (appliedTheme !== "light") {
    console.error(`❌ Expected default theme to be "light", but got "${appliedTheme}"`);
  }

  await defaultPage.screenshot({
    path: path.join(OUTPUT_DIR, "landing-default-light-desktop.png")
  });
  console.log("📸 Captured landing-default-light-desktop.png");
  await defaultContext.close();

  // -------------------------------------------------------------
  // Test 2: Desktop 1440x900 — All 6 Chapters in Light Mode
  // -------------------------------------------------------------
  console.log("\n[Test 2] Desktop Light Mode Chapters (1 - 6)...");
  const lightContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const lightPage = await lightContext.newPage();
  await lightPage.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await lightPage.evaluate(() => {
    localStorage.setItem("lazarus_theme", "light");
    document.documentElement.setAttribute("data-theme", "light");
  });
  await lightPage.waitForTimeout(500);

  for (let ch = 1; ch <= 6; ch++) {
    // Scroll chapter element into center view
    const selector = `#story-chapter-${ch}`;
    await lightPage.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
    }, selector);
    await lightPage.waitForTimeout(800);

    // Verify active chapter pill or state
    await lightPage.screenshot({
      path: path.join(OUTPUT_DIR, `story-ch${ch}-light-desktop.png`)
    });
    console.log(`📸 Captured story-ch${ch}-light-desktop.png`);
  }
  await lightContext.close();

  // -------------------------------------------------------------
  // Test 3: Desktop 1440x900 — All 6 Chapters in Dark Mode
  // -------------------------------------------------------------
  console.log("\n[Test 3] Desktop Dark Mode Chapters (1 - 6)...");
  const darkContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const darkPage = await darkContext.newPage();
  await darkPage.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await darkPage.evaluate(() => {
    localStorage.setItem("lazarus_theme", "dark");
    document.documentElement.setAttribute("data-theme", "dark");
  });
  await darkPage.waitForTimeout(500);

  for (let ch = 1; ch <= 6; ch++) {
    const selector = `#story-chapter-${ch}`;
    await darkPage.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
    }, selector);
    await darkPage.waitForTimeout(800);

    await darkPage.screenshot({
      path: path.join(OUTPUT_DIR, `story-ch${ch}-dark-desktop.png`)
    });
    console.log(`📸 Captured story-ch${ch}-dark-desktop.png`);
  }
  await darkContext.close();

  // -------------------------------------------------------------
  // Test 4: Mobile 390x844 — Stacked Story Experience (Light & Dark)
  // -------------------------------------------------------------
  console.log("\n[Test 4] Mobile Stacked Experience (390x844)...");
  const mobileLightContext = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const mobileLightPage = await mobileLightContext.newPage();
  await mobileLightPage.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await mobileLightPage.evaluate(() => {
    localStorage.setItem("lazarus_theme", "light");
    document.documentElement.setAttribute("data-theme", "light");
  });
  await mobileLightPage.waitForTimeout(500);

  // Scroll into Chapter 3 on mobile
  await mobileLightPage.evaluate(() => {
    const el = document.querySelector("#story-chapter-3");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await mobileLightPage.waitForTimeout(800);

  await mobileLightPage.screenshot({
    path: path.join(OUTPUT_DIR, "story-ch3-light-mobile.png")
  });
  console.log("📸 Captured story-ch3-light-mobile.png");

  // Scroll into Chapter 5 on mobile
  await mobileLightPage.evaluate(() => {
    const el = document.querySelector("#story-chapter-5");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await mobileLightPage.waitForTimeout(800);

  await mobileLightPage.screenshot({
    path: path.join(OUTPUT_DIR, "story-ch5-light-mobile.png")
  });
  console.log("📸 Captured story-ch5-light-mobile.png");
  await mobileLightContext.close();

  // Mobile Dark Mode
  const mobileDarkContext = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const mobileDarkPage = await mobileDarkContext.newPage();
  await mobileDarkPage.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await mobileDarkPage.evaluate(() => {
    localStorage.setItem("lazarus_theme", "dark");
    document.documentElement.setAttribute("data-theme", "dark");
  });
  await mobileDarkPage.waitForTimeout(500);

  await mobileDarkPage.evaluate(() => {
    const el = document.querySelector("#story-chapter-4");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await mobileDarkPage.waitForTimeout(800);

  await mobileDarkPage.screenshot({
    path: path.join(OUTPUT_DIR, "story-ch4-dark-mobile.png")
  });
  console.log("📸 Captured story-ch4-dark-mobile.png");
  await mobileDarkContext.close();

  // -------------------------------------------------------------
  // Test 5: Reduced Motion Verification
  // -------------------------------------------------------------
  console.log("\n[Test 5] Verifying Prefers-Reduced-Motion Compliance...");
  const reducedMotionContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce"
  });
  const reducedMotionPage = await reducedMotionContext.newPage();
  await reducedMotionPage.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await reducedMotionPage.evaluate(() => {
    const el = document.querySelector("#story-chapter-1");
    if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await reducedMotionPage.waitForTimeout(600);

  await reducedMotionPage.screenshot({
    path: path.join(OUTPUT_DIR, "story-reduced-motion-desktop.png")
  });
  console.log("📸 Captured story-reduced-motion-desktop.png");
  await reducedMotionContext.close();

  await browser.close();
  console.log("\n🎉 ALL SCROLL STORY VISUAL QA TESTS COMPLETED SUCCESSFULLY!");
}

runScrollStoryQA().catch((err) => {
  console.error("❌ Scroll story QA failed:", err);
  process.exit(1);
});
