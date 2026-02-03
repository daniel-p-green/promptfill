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
    const killServer = () => {
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

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });
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

  // UI state (Fill view).
  await page.getByRole("tab", { name: "Fill" }).click().catch(() => {});
  await page.waitForSelector('[data-pf-video="library-pane"]');
  await page.waitForSelector('[data-pf-video="copy-actions"]');
  await screenshot("promptfill-ui-1280x720.png");
  await fs.copyFile(
    path.join(UI_DIR, "promptfill-ui-1280x720.png"),
    path.join(UI_DIR, "promptfill-ui.png")
  );

  const uiLibrary = rectWithPadding(await rect('[data-pf-video="library-pane"]'), 8);
  const uiCopyActions = rectWithPadding(await rect('[data-pf-video="copy-actions"]'), 12);

  // Drawer state.
  await page.getByRole("button", { name: /Variables \(\d+\)/ }).click();
  await page.waitForSelector('[data-pf-video="drawer-fields"]');
  await page.waitForTimeout(150);
  await screenshot("promptfill-drawer-1280x720.png");
  await fs.copyFile(
    path.join(UI_DIR, "promptfill-drawer-1280x720.png"),
    path.join(UI_DIR, "promptfill-drawer.png")
  );
  const drawerFields = rectWithPadding(await rect('[data-pf-video="drawer-fields"]'), 14);
  await page.getByRole("button", { name: "Close", exact: true }).click();

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

  await browser.close();
  if (server) server.kill("SIGTERM");
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
