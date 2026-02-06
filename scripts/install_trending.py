#!/usr/bin/env python3
"""Install skills.sh trending skills via `npx skills add`.

Default behavior is DRY RUN (prints what would be installed).

Examples:
  # Dry run
  python3 scripts/install_trending.py

  # Apply (global install for Claude Code)
  python3 scripts/install_trending.py --agent claude-code --global --apply

  # Filter to one repo
  python3 scripts/install_trending.py --source anthropics/skills --agent claude-code --global --apply
"""

from __future__ import annotations

import argparse
import json
import re
import shlex
import subprocess
import sys
import urllib.request
from typing import Any

TRENDING_URL = "https://skills.sh/trending"


def fetch_html(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "skills-sh-trending-installer/0.2 (+https://skills.sh)",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def extract_initial_skills(html: str) -> list[dict[str, Any]]:
    """Extract the `initialSkills` array from skills.sh trending HTML.

    The page embeds data in JS content. We try both unescaped and escaped forms.
    """

    # 1) Unescaped JSON (defensive in case the page shape changes)
    m = re.search(
        r'"initialSkills"\s*:\s*(\[\{.*?\}\])\s*,\s*"totalSkills"',
        html,
        re.DOTALL,
    )
    if m:
        try:
            parsed = json.loads(m.group(1))
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            pass

    # 2) Escaped JSON (current typical case)
    m2 = re.search(
        r'\\"initialSkills\\"\s*:\s*(\[\{.*?\}\])\s*,\s*\\"totalSkills\\"',
        html,
        re.DOTALL,
    )
    if not m2:
        raise RuntimeError("Could not find initialSkills in trending HTML")

    raw_escaped = m2.group(1)
    raw = raw_escaped.encode("utf-8").decode("unicode_escape")

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            f"Failed to parse initialSkills JSON after unescape: {exc}"
        ) from exc

    if not isinstance(parsed, list):
        raise RuntimeError("Parsed initialSkills is not a list")
    return parsed


def run(cmd: list[str], dry_run: bool) -> int:
    if dry_run:
        print("$ " + shlex.join(cmd))
        return 0

    proc = subprocess.run(cmd, check=False)
    return proc.returncode


def parse_args() -> argparse.Namespace:
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default=TRENDING_URL)
    ap.add_argument(
        "--agent",
        action="append",
        default=[],
        help="Agent(s) to target for skills CLI (e.g. claude-code). Repeatable.",
    )
    ap.add_argument(
        "--global",
        dest="global_install",
        action="store_true",
        help="Install globally (user-level) instead of project-level.",
    )
    ap.add_argument(
        "--source",
        action="append",
        default=[],
        help="Only install skills from these source repos (e.g. anthropics/skills). Repeatable.",
    )
    ap.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Optional cap on number of trending entries to install (0 = no cap).",
    )
    ap.add_argument(
        "--apply",
        action="store_true",
        help="Actually run installs. If omitted, prints commands only.",
    )
    ap.add_argument(
        "--yes",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Pass -y/--yes to skills CLI (default: true).",
    )
    return ap.parse_args()


def main() -> int:
    args = parse_args()

    html = fetch_html(args.url)
    items = extract_initial_skills(html)

    if args.source:
        allowed = set(args.source)
        items = [it for it in items if it.get("source") in allowed]

    if args.limit > 0:
        items = items[: args.limit]

    if not items:
        print("No trending skills matched the filters.")
        return 0

    dry_run = not args.apply

    base = ["npx", "--yes", "skills", "add"]
    if args.global_install:
        base.append("-g")

    if args.agent:
        base += ["--agent", *args.agent]

    if args.yes:
        base.append("-y")

    failures = 0
    candidates = 0

    for it in items:
        source = it.get("source")
        skill_id = it.get("skillId")
        name = it.get("name")
        installs = it.get("installs")

        if not source or not skill_id:
            continue

        candidates += 1
        print(f"\n# {name} ({source}/{skill_id}) installs={installs}")
        cmd = base + [source, "--skill", skill_id]
        code = run(cmd, dry_run=dry_run)
        if code != 0:
            failures += 1

    if dry_run:
        print(
            f"\nDry run complete. Matched entries: {len(items)}. Installable entries: {candidates}. "
            "Re-run with --apply to install."
        )
        return 0

    if failures:
        print(
            f"\nCompleted with failures: {failures}/{candidates}",
            file=sys.stderr,
        )
        return 1

    print(f"\nInstalled trending entries: {candidates}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
