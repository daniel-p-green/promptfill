#!/usr/bin/env node
/**
 * Capture UI screenshots + highlight bounding boxes for the Remotion explainer.
 *
 * This script prefers the locally installed Google Chrome (Playwright "chrome" channel)
 * to avoid downloading browser binaries.
 *
 * Usage:
 *   node video/scripts/capture-ui.mjs
 *   PF_URL=http://localhost:3200 node video/scripts/capture-ui.mjs --no-serve
 *
 * Flags:
 *   --no-build   Skip `web` build step
 *   --no-serve   Assume `PF_URL` is already running; do not start/stop a server
 *
 * Env:
 *   PF_URL                 Base URL for the app (default: started server, http://localhost:<port>/)
 *   PF_PORT                Port to run the production server on when serving (default: 3200)
 *   PF_SHARE_ORIGIN         Share link origin to inline at build time (default: https://promptfill.app)
 */

import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "../..");
const WEB_DIR = path.join(ROOT_DIR, "web");
const VIDEO_DIR = path.join(ROOT_DIR, "video");
const UI_DIR = path.join(VIDEO_DIR, "public", "ui");
const HIGHLIGHTS_FILE = path.join(VIDEO_DIR, "src", "ui", "highlights.ts");

const DEFAULT_PORT = Number(process.env.PF_PORT || "3200");
const SHARE_ORIGIN = String(process.env.PF_SHARE_ORIGIN || "https://promptfill.app");
const ONBOARDING_KEY = "promptfill:onboarding:v1";
const UI_KEY = "promptfill:ui:v1";

const argv = process.argv.slice(2);
const hasFlag = (flag) => argv.includes(flag);
const NO_BUILD = hasFlag("--no-build");
const NO_SERVE = hasFlag("--no-serve");

const run = (cmd, args, opts) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", ...opts });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited with code ${code}`));
    });
  });

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const waitForUrl = async (url, { timeoutMs = 30_000 } = {}) => {
  const start = Date.now();
  // Use a lightweight HEAD request loop without extra deps.
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) return;
    } catch {
      // ignore
    }
    await delay(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
};

const rectWithPadding = (rect, pad) => {
  const x1 = Math.floor(rect.x - pad);
  const y1 = Math.floor(rect.y - pad);
  const x2 = Math.ceil(rect.x + rect.width + pad);
  const y2 = Math.ceil(rect.y + rect.height + pad);
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
};

const writeHighlights = async ({ uiLibrary, uiCopyActions, drawerFields, shareLinkRow }) => {
  const template = `export type HighlightRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * Highlight boxes for the explainer video.
 *
 * IMPORTANT:
 * These are measured against the screenshots in \`video/public/ui/*-1280x720.png\`
 * (captured at a 1280x720 viewport). If the UI changes, re-capture and update.
 */
export const HIGHLIGHTS_1280x720 = {
  ui: {
    // Library pane (search + prompt list) in expanded mode.
    library: { x: ${uiLibrary.x}, y: ${uiLibrary.y}, w: ${uiLibrary.w}, h: ${uiLibrary.h} } satisfies HighlightRect,
    // "Variables / Copy / Copy Markdown" action group.
    copyActions: { x: ${uiCopyActions.x}, y: ${uiCopyActions.y}, w: ${uiCopyActions.w}, h: ${uiCopyActions.h} } satisfies HighlightRect,
  },
  drawer: {
    // Variable field cards in the fill drawer.
    fields: { x: ${drawerFields.x}, y: ${drawerFields.y}, w: ${drawerFields.w}, h: ${drawerFields.h} } satisfies HighlightRect,
  },
  share: {
    // Share link input row in the share modal.
    linkRow: { x: ${shareLinkRow.x}, y: ${shareLinkRow.y}, w: ${shareLinkRow.w}, h: ${shareLinkRow.h} } satisfies HighlightRect,
  },
} as const;
`;
  await fs.writeFile(HIGHLIGHTS_FILE, template, "utf8");
};

const main = async () => {
  let server = null;
  let killServer = null;
  let serverUrl = process.env.PF_URL ? String(process.env.PF_URL) : null;
  if (serverUrl && !serverUrl.endsWith("/")) serverUrl += "/";

  if (!NO_BUILD) {
    await run("npm", ["run", "build"], {
      cwd: WEB_DIR,
      env: { ...process.env, NEXT_PUBLIC_SHARE_ORIGIN: SHARE_ORIGIN },
    });
  }

  if (!NO_SERVE) {
    const port = DEFAULT_PORT;
    serverUrl = serverUrl || `http://localhost:${port}/`;
    // Start a production server for deterministic layout.
    server = spawn("npm", ["run", "start", "--", "-p", String(port)], {
      cwd: WEB_DIR,
      env: process.env,
      stdio: "inherit",
    });
    // Best-effort teardown.
    killServer = () => {
      if (!server) return;
      try {
        server.kill("SIGTERM");
      } catch {
        // ignore
      }
      server = null;
    };
    process.on("exit", killServer);
    process.on("SIGINT", () => {
      killServer();
      process.exit(1);
    });
    process.on("SIGTERM", () => {
      killServer();
      process.exit(1);
    });

    await waitForUrl(serverUrl);
  }

  if (!serverUrl) {
    throw new Error("No PF_URL provided and --no-serve was set.");
  }

  await fs.mkdir(UI_DIR, { recursive: true });

  let browser;
  let context;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
  } catch (error) {
    // Provide an actionable error message instead of a stack trace.
    throw new Error(
      `Unable to launch Chrome via Playwright. Make sure Google Chrome is installed at /Applications/Google Chrome.app. Original error: ${String(
        error
      )}`
    );
  }

  try {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
    });

    // Ensure captures are deterministic: no welcome modal.
    await context.addInitScript(
      ({ onboardingKey }) => {
        window.localStorage.setItem(
          onboardingKey,
          JSON.stringify({
            complete: true,
            dismissed: true,
            completedSteps: ["library", "fill", "build", "share"],
          })
        );
      },
      { onboardingKey: ONBOARDING_KEY }
    );

    const page = await context.newPage();

  const rect = async (selector) => {
    const out = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }, selector);
    if (!out) throw new Error(`Selector not found: ${selector}`);
    return out;
  };

  const screenshot = async (filename) => {
    const target = path.join(UI_DIR, filename);
    await page.screenshot({ path: target, fullPage: false });
    return target;
  };

    await page.goto(serverUrl, { waitUntil: "networkidle" });

    // Ensure the expanded library is visible (capture is based on expanded layout).
    const expandButton = page.getByRole("button", { name: "Expand library" });
    if (await expandButton.isVisible().catch(() => false)) {
      await expandButton.click();
      await page.waitForTimeout(150);
    }

    // UI state (fill view).
    await page.waitForSelector('[data-pf-video="library-pane"]');
    await page.waitForSelector('[data-pf-video="copy-actions"]');
    await screenshot("promptfill-ui-1280x720.png");
    await fs.copyFile(
      path.join(UI_DIR, "promptfill-ui-1280x720.png"),
      path.join(UI_DIR, "promptfill-ui.png")
    );

    const uiLibrary = rectWithPadding(await rect('[data-pf-video="library-pane"]'), 8);
    const uiCopyActions = rectWithPadding(await rect('[data-pf-video="copy-actions"]'), 12);

    // Collapsed library variant (used as a lighter background in the end-user series).
    const collapseButton = page.getByRole("button", { name: "Collapse library" });
    if (await collapseButton.isVisible().catch(() => false)) {
      await collapseButton.click();
      await page.waitForTimeout(200);
    }
    await screenshot("promptfill-collapsed-1280x720.png");
    if (await expandButton.isVisible().catch(() => false)) {
      await expandButton.click();
      await page.waitForTimeout(200);
    }

    // Inline-card variant (used as a ChatGPT app-style surface in the end-user series).
    await page.goto(`${serverUrl}inline`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Copy" }).waitFor();
    await page.waitForTimeout(150);
    await screenshot("promptfill-inline-1280x720.png");

    // Back to main UI for drawer + share captures.
    await page.goto(serverUrl, { waitUntil: "networkidle" });

    // Drawer state (requires advanced mode for the "Quick fill panel" action).
    await page.evaluate((uiKey) => {
      window.localStorage.setItem(uiKey, JSON.stringify({ libraryCollapsed: false, advancedMode: true }));
    }, UI_KEY);
    await page.reload({ waitUntil: "networkidle" });
    if (await expandButton.isVisible().catch(() => false)) {
      await expandButton.click();
      await page.waitForTimeout(150);
    }
    await page.getByRole("button", { name: "Quick fill panel" }).click();
    await page.waitForSelector('[data-pf-video="drawer-fields"]');
    await page.waitForTimeout(150);
    await screenshot("promptfill-drawer-1280x720.png");
    await fs.copyFile(
      path.join(UI_DIR, "promptfill-drawer-1280x720.png"),
      path.join(UI_DIR, "promptfill-drawer.png")
    );
    const drawerFields = rectWithPadding(await rect('[data-pf-video="drawer-fields"]'), 14);
    await page.keyboard.press("Escape");
    await page.waitForSelector('[data-pf-video="drawer-fields"]', { state: "detached" }).catch(() => {});

    // Share state.
    await page.getByRole("button", { name: "Share" }).click();
    await page.waitForSelector('[data-pf-video="share-link-row"]');
    await page.waitForTimeout(150);
    await screenshot("promptfill-share-1280x720.png");
    await fs.copyFile(
      path.join(UI_DIR, "promptfill-share-1280x720.png"),
      path.join(UI_DIR, "promptfill-share.png")
    );
    const shareLinkRow = rectWithPadding(await rect('[data-pf-video="share-link-row"]'), 12);

    await writeHighlights({ uiLibrary, uiCopyActions, drawerFields, shareLinkRow });
  } finally {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
    killServer?.();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
