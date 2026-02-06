#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const HEX_COLOR_RE = /#[0-9a-fA-F]{3,8}\b/g;
const RGB_COLOR_RE = /rgba?\([^)]+\)/g;
const HSL_COLOR_RE = /hsla?\([^)]+\)/g;
const CSS_VAR_RE = /(--[a-zA-Z0-9\-_]+)\s*:\s*([^;}{]+)/g;
const FONT_RE = /font-family\s*:\s*([^;}{]+)/gi;
const DURATION_RE = /(\d+(?:\.\d+)?m?s)/g;
const STYLE_LINK_RE = /<link[^>]*rel=["'][^"']*stylesheet[^"']*["'][^>]*>/gi;
const HREF_RE = /href=["']([^"']+)["']/i;
const TITLE_RE = /<title[^>]*>(.*?)<\/title>/is;
const META_DESC_RE =
  /<meta[^>]+name=["']description["'][^>]+content=["'](.*?)["'][^>]*>/is;
const IMG_RE = /<img[^>]*>/gi;
const ATTR_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*["'](.*?)["']/g;
const TAG_RE = /<[^>]+>/g;

const KEYWORDS = [
  "premium",
  "modern",
  "trusted",
  "simple",
  "fast",
  "secure",
  "creative",
  "playful",
  "minimal",
  "powerful",
  "elegant",
  "bold",
  "professional",
  "friendly",
  "innovative",
];

const usage = () => {
  console.log(`Usage:
  node tools/brand-scan.mjs --url <url> [--url <url>] [--brand-slug <slug>] [--out <path>] [--allow-cross-origin-css]

Examples:
  node tools/brand-scan.mjs --url https://stripe.com --brand-slug stripe
  node tools/brand-scan.mjs --url https://example.com --out video/brand/example/brand-signals.json`);
};

const normalizeHex = (color) => {
  const c = color.trim().toUpperCase();
  if (c.length === 4 || c.length === 5) {
    return `#${c
      .slice(1)
      .split("")
      .map((ch) => ch + ch)
      .join("")}`;
  }
  return c;
};

const getDomain = (url) => {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return "";
  }
};

const cleanWhitespace = (text) => text.replace(/\s+/g, " ").trim();

const countMatches = (items) => {
  const counter = new Map();
  for (const item of items) {
    const value = item.trim();
    if (!value) continue;
    counter.set(value, (counter.get(value) ?? 0) + 1);
  }
  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, count }));
};

const extractTagAttrs = (tag) => {
  const attrs = {};
  for (const match of tag.matchAll(ATTR_RE)) {
    attrs[match[1].toLowerCase()] = match[2];
  }
  return attrs;
};

const extractStylesheetUrls = (baseUrl, html) => {
  const urls = new Set();
  for (const tag of html.match(STYLE_LINK_RE) ?? []) {
    const href = tag.match(HREF_RE)?.[1];
    if (!href) continue;
    try {
      urls.add(new URL(href, baseUrl).toString());
    } catch {
      // Skip malformed stylesheet URLs.
    }
  }
  return [...urls];
};

const extractVisibleText = (html) => {
  const withoutTags = html.replace(TAG_RE, " ");
  return cleanWhitespace(withoutTags);
};

const extractLogoCandidates = (html, baseUrl) => {
  const results = [];
  for (const imgTag of html.match(IMG_RE) ?? []) {
    const attrs = extractTagAttrs(imgTag);
    const src = attrs.src;
    if (!src) continue;
    const alt = attrs.alt ?? "";
    const combined = `${src} ${alt}`.toLowerCase();
    if (!combined.includes("logo") && !combined.includes("brand")) continue;
    try {
      results.push({
        src: new URL(src, baseUrl).toString(),
        alt,
      });
    } catch {
      // Skip malformed image URLs.
    }
  }

  const unique = new Map(results.map((r) => [r.src, r]));
  return [...unique.values()].slice(0, 8);
};

const extractKeywords = (text) => {
  const lower = text.toLowerCase();
  const hits = {};
  for (const keyword of KEYWORDS) {
    const count = lower.split(keyword).length - 1;
    if (count > 0) hits[keyword] = count;
  }
  return hits;
};

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return await response.text();
};

const analyzeUrl = async (url, { allowCrossOriginCss }) => {
  const html = await fetchText(url);
  const baseDomain = getDomain(url);
  const stylesheets = extractStylesheetUrls(url, html).slice(0, 12);
  const cssPayloads = [];
  let allCss = "";

  for (const cssUrl of stylesheets) {
    if (!allowCrossOriginCss && getDomain(cssUrl) !== baseDomain) continue;
    try {
      const cssText = await fetchText(cssUrl);
      allCss += `\n${cssText}`;
      cssPayloads.push({ url: cssUrl, bytes: Buffer.byteLength(cssText, "utf8") });
    } catch {
      // Ignore stylesheet fetch failures and continue.
    }
  }

  const colors = [
    ...(html.match(HEX_COLOR_RE) ?? []).map(normalizeHex),
    ...(allCss.match(HEX_COLOR_RE) ?? []).map(normalizeHex),
    ...(allCss.match(RGB_COLOR_RE) ?? []),
    ...(allCss.match(HSL_COLOR_RE) ?? []),
  ];

  const fonts = [];
  for (const match of allCss.matchAll(FONT_RE)) {
    const raw = match[1] ?? "";
    for (const family of raw.split(",")) {
      const clean = family.trim().replace(/^['"]|['"]$/g, "");
      if (!clean) continue;
      if (["inherit", "serif", "sans-serif", "monospace"].includes(clean.toLowerCase())) continue;
      fonts.push(clean);
    }
  }

  const durations = allCss.match(DURATION_RE) ?? [];
  const cssVars = {};
  for (const match of allCss.matchAll(CSS_VAR_RE)) {
    const name = match[1];
    const value = (match[2] ?? "").trim();
    if (!name || !value || value.length > 80) continue;
    cssVars[name] = value;
    if (Object.keys(cssVars).length >= 80) break;
  }

  const title = html.match(TITLE_RE)?.[1];
  const metaDescription = html.match(META_DESC_RE)?.[1];
  const text = extractVisibleText(html);

  return {
    url,
    title: title ? cleanWhitespace(title) : null,
    meta_description: metaDescription ? cleanWhitespace(metaDescription) : null,
    stylesheets_analyzed: cssPayloads,
    top_colors: countMatches(colors).slice(0, 20),
    top_fonts: countMatches(fonts).slice(0, 12).map((entry) => ({
      family: entry.value,
      count: entry.count,
    })),
    top_durations: countMatches(durations).slice(0, 12),
    css_variables: cssVars,
    keywords: extractKeywords(text),
    logo_candidates: extractLogoCandidates(html, url),
    sample_text: text.slice(0, 900),
  };
};

const mergeSignals = (results) => {
  const colors = [];
  const fonts = [];
  const durations = [];
  const keywords = [];

  for (const result of results) {
    for (const c of result.top_colors ?? []) {
      colors.push(...Array(c.count).fill(c.value));
    }
    for (const f of result.top_fonts ?? []) {
      fonts.push(...Array(f.count).fill(f.family));
    }
    for (const d of result.top_durations ?? []) {
      durations.push(...Array(d.count).fill(d.value));
    }
    for (const [keyword, count] of Object.entries(result.keywords ?? {})) {
      keywords.push(...Array(count).fill(keyword));
    }
  }

  return {
    palette_candidates: countMatches(colors).slice(0, 24),
    font_candidates: countMatches(fonts)
      .slice(0, 16)
      .map((entry) => ({ family: entry.value, count: entry.count })),
    motion_duration_candidates: countMatches(durations).slice(0, 16),
    voice_keywords: countMatches(keywords).slice(0, 16),
  };
};

const parseArgs = (argv) => {
  const options = {
    urls: [],
    brandSlug: "default-brand",
    out: null,
    allowCrossOriginCss: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--url") {
      options.urls.push(argv[i + 1]);
      i += 1;
      continue;
    }
    if (arg === "--brand-slug") {
      options.brandSlug = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--out") {
      options.out = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--allow-cross-origin-css") {
      options.allowCrossOriginCss = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.urls.length === 0) {
    throw new Error("At least one --url is required.");
  }

  if (!options.out) {
    options.out = path.join(
      process.cwd(),
      "video",
      "brand",
      options.brandSlug,
      "brand-signals.json",
    );
  }

  return options;
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const results = [];

  for (const url of options.urls) {
    if (!url) continue;
    try {
      const analyzed = await analyzeUrl(url, {
        allowCrossOriginCss: options.allowCrossOriginCss,
      });
      results.push(analyzed);
    } catch (error) {
      results.push({
        url,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const validResults = results.filter((r) => !r.error);
  const payload = {
    generated_at: new Date().toISOString(),
    brand_slug: options.brandSlug,
    inputs: options.urls,
    results,
    merged: mergeSignals(validResults),
  };

  await fs.mkdir(path.dirname(options.out), { recursive: true });
  await fs.writeFile(options.out, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${options.out}`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  usage();
  process.exit(1);
});
