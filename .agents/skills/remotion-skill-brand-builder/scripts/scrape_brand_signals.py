#!/usr/bin/env python3
"""Extract lightweight brand style signals from one or more URLs.

This script intentionally uses only Python standard library modules so it can run
in constrained environments without extra dependencies.
"""

from __future__ import annotations

import argparse
import collections
import datetime as dt
import json
import re
import sys
import urllib.parse
import urllib.request
from html import unescape
from typing import Any

HEX_COLOR_RE = re.compile(r"#[0-9a-fA-F]{3,8}\b")
RGB_COLOR_RE = re.compile(r"rgba?\([^\)]+\)")
HSL_COLOR_RE = re.compile(r"hsla?\([^\)]+\)")
CSS_VAR_RE = re.compile(r"(--[a-zA-Z0-9\-_]+)\s*:\s*([^;}{]+)")
FONT_RE = re.compile(r"font-family\s*:\s*([^;}{]+)", re.IGNORECASE)
DURATION_RE = re.compile(r"(\d+(?:\.\d+)?m?s)")
STYLE_LINK_RE = re.compile(
    r"<link[^>]*rel=[\"'][^\"']*stylesheet[^\"']*[\"'][^>]*>", re.IGNORECASE
)
HREF_RE = re.compile(r"href=[\"']([^\"']+)[\"']", re.IGNORECASE)
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)
META_DESC_RE = re.compile(
    r"<meta[^>]+name=[\"']description[\"'][^>]+content=[\"'](.*?)[\"'][^>]*>",
    re.IGNORECASE | re.DOTALL,
)
IMG_RE = re.compile(r"<img[^>]*>", re.IGNORECASE)
ATTR_RE = re.compile(r"([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*[\"'](.*?)[\"']")
TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")

KEYWORDS = [
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
]


def fetch_text(url: str, timeout: float = 12.0) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            )
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        raw = response.read()
    return raw.decode(charset, errors="replace")


def normalize_hex(color: str) -> str:
    c = color.strip().upper()
    if len(c) == 4:
        return "#" + "".join(ch * 2 for ch in c[1:])
    if len(c) == 5:
        return "#" + "".join(ch * 2 for ch in c[1:])
    return c


def to_absolute(base_url: str, maybe_relative: str) -> str:
    return urllib.parse.urljoin(base_url, maybe_relative)


def get_domain(url: str) -> str:
    return urllib.parse.urlparse(url).netloc.lower()


def find_stylesheet_urls(base_url: str, html: str) -> list[str]:
    urls: list[str] = []
    for tag in STYLE_LINK_RE.findall(html):
        href_match = HREF_RE.search(tag)
        if not href_match:
            continue
        href = href_match.group(1).strip()
        if not href:
            continue
        urls.append(to_absolute(base_url, href))
    # Keep order, dedupe.
    return list(dict.fromkeys(urls))


def extract_title(html: str) -> str | None:
    m = TITLE_RE.search(html)
    if not m:
        return None
    return WS_RE.sub(" ", unescape(m.group(1))).strip() or None


def extract_meta_description(html: str) -> str | None:
    m = META_DESC_RE.search(html)
    if not m:
        return None
    return WS_RE.sub(" ", unescape(m.group(1))).strip() or None


def extract_visible_text(html: str, max_chars: int = 15000) -> str:
    text = TAG_RE.sub(" ", html)
    text = WS_RE.sub(" ", unescape(text)).strip()
    return text[:max_chars]


def extract_keywords(text: str) -> dict[str, int]:
    lower = text.lower()
    found: dict[str, int] = {}
    for word in KEYWORDS:
        count = lower.count(word)
        if count > 0:
            found[word] = count
    return found


def extract_logo_candidates(html: str, base_url: str) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    for tag in IMG_RE.findall(html):
        attrs = {k.lower(): v for k, v in ATTR_RE.findall(tag)}
        src = attrs.get("src")
        if not src:
            continue
        alt = attrs.get("alt", "")
        combined = (src + " " + alt).lower()
        if "logo" not in combined and "brand" not in combined:
            continue
        results.append(
            {
                "src": to_absolute(base_url, src),
                "alt": alt,
            }
        )
    # Dedupe by src.
    deduped: dict[str, dict[str, str]] = {}
    for item in results:
        deduped[item["src"]] = item
    return list(deduped.values())[:8]


def extract_colors(text: str) -> collections.Counter[str]:
    colors: collections.Counter[str] = collections.Counter()

    for c in HEX_COLOR_RE.findall(text):
        colors[normalize_hex(c)] += 1
    for c in RGB_COLOR_RE.findall(text):
        colors[c.strip()] += 1
    for c in HSL_COLOR_RE.findall(text):
        colors[c.strip()] += 1

    return colors


def extract_css_vars(css_text: str) -> dict[str, str]:
    vars_found: dict[str, str] = {}
    for name, value in CSS_VAR_RE.findall(css_text):
        val = value.strip()
        if len(val) > 80:
            continue
        vars_found[name] = val
    return vars_found


def extract_fonts(css_text: str) -> collections.Counter[str]:
    fonts: collections.Counter[str] = collections.Counter()
    for raw in FONT_RE.findall(css_text):
        for part in raw.split(","):
            clean = part.strip().strip("\"'")
            if not clean:
                continue
            if clean.lower() in {"inherit", "serif", "sans-serif", "monospace"}:
                continue
            fonts[clean] += 1
    return fonts


def extract_durations(css_text: str) -> collections.Counter[str]:
    durations: collections.Counter[str] = collections.Counter()
    for value in DURATION_RE.findall(css_text):
        durations[value] += 1
    return durations


def analyze_url(url: str, same_origin_css_only: bool) -> dict[str, Any]:
    html = fetch_text(url)
    style_urls = find_stylesheet_urls(url, html)
    domain = get_domain(url)

    css_payloads: list[dict[str, str]] = []
    all_css = ""

    for css_url in style_urls[:12]:
        try:
            if same_origin_css_only and get_domain(css_url) != domain:
                continue
            css_text = fetch_text(css_url)
            css_payloads.append({"url": css_url, "bytes": str(len(css_text.encode("utf-8")))})
            all_css += "\n" + css_text
        except Exception:
            continue

    colors = extract_colors(html + "\n" + all_css)
    fonts = extract_fonts(all_css)
    durations = extract_durations(all_css)
    css_vars = extract_css_vars(all_css)
    text = extract_visible_text(html)

    return {
        "url": url,
        "title": extract_title(html),
        "meta_description": extract_meta_description(html),
        "stylesheets_analyzed": css_payloads,
        "top_colors": [
            {"value": value, "count": count}
            for value, count in colors.most_common(20)
        ],
        "top_fonts": [
            {"family": value, "count": count}
            for value, count in fonts.most_common(12)
        ],
        "top_durations": [
            {"value": value, "count": count}
            for value, count in durations.most_common(12)
        ],
        "css_variables": dict(list(css_vars.items())[:80]),
        "keywords": extract_keywords(text),
        "logo_candidates": extract_logo_candidates(html, url),
        "sample_text": text[:900],
    }


def merge_signals(per_url: list[dict[str, Any]]) -> dict[str, Any]:
    color_counts: collections.Counter[str] = collections.Counter()
    font_counts: collections.Counter[str] = collections.Counter()
    duration_counts: collections.Counter[str] = collections.Counter()
    keyword_counts: collections.Counter[str] = collections.Counter()

    for item in per_url:
        for c in item.get("top_colors", []):
            color_counts[c["value"]] += int(c.get("count", 0))
        for f in item.get("top_fonts", []):
            font_counts[f["family"]] += int(f.get("count", 0))
        for d in item.get("top_durations", []):
            duration_counts[d["value"]] += int(d.get("count", 0))
        for k, v in item.get("keywords", {}).items():
            keyword_counts[k] += int(v)

    return {
        "palette_candidates": [
            {"value": value, "count": count}
            for value, count in color_counts.most_common(24)
        ],
        "font_candidates": [
            {"family": value, "count": count}
            for value, count in font_counts.most_common(16)
        ],
        "motion_duration_candidates": [
            {"value": value, "count": count}
            for value, count in duration_counts.most_common(16)
        ],
        "voice_keywords": [
            {"value": value, "count": count}
            for value, count in keyword_counts.most_common(16)
        ],
    }


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scrape brand style signals from URLs")
    parser.add_argument(
        "--url",
        action="append",
        dest="urls",
        help="URL to inspect (repeatable)",
        required=True,
    )
    parser.add_argument(
        "--out",
        required=True,
        help="Output JSON path",
    )
    parser.add_argument(
        "--allow-cross-origin-css",
        action="store_true",
        help="Also fetch CSS from other domains (disabled by default)",
    )
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    per_url: list[dict[str, Any]] = []

    for url in args.urls:
        try:
            per_url.append(
                analyze_url(url=url, same_origin_css_only=(not args.allow_cross_origin_css))
            )
        except Exception as exc:
            per_url.append(
                {
                    "url": url,
                    "error": str(exc),
                }
            )

    out = {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "inputs": args.urls,
        "results": per_url,
        "merged": merge_signals([item for item in per_url if "error" not in item]),
    }

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
        f.write("\n")

    print(f"Wrote {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
