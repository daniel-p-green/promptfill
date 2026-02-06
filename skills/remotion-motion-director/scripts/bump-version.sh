#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./scripts/bump-version.sh <patch|minor|major|X.Y.Z> [note]

Examples:
  ./scripts/bump-version.sh patch "Clarify style defaults"
  ./scripts/bump-version.sh minor "Add new storyboard profile"
  ./scripts/bump-version.sh 1.2.0 "Manual release set"
EOF
}

if [[ "${1:-}" == "" ]]; then
  usage
  exit 1
fi

bump="${1}"
note="${2:-Routine version update.}"
skill_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
skill_file="${skill_dir}/SKILL.md"
version_file="${skill_dir}/references/versioning-policy.md"

if [[ ! -f "${skill_file}" ]]; then
  echo "Could not find ${skill_file}" >&2
  exit 1
fi

current_version="$(grep -E '^[[:space:]]*version:[[:space:]]*[0-9]+\.[0-9]+\.[0-9]+' "${skill_file}" | head -n 1 | sed -E 's/^[[:space:]]*version:[[:space:]]*([0-9]+\.[0-9]+\.[0-9]+).*/\1/')"

if [[ "${current_version}" == "" ]]; then
  echo "No version found in ${skill_file}" >&2
  exit 1
fi

next_version=""

if [[ "${bump}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  next_version="${bump}"
else
  IFS='.' read -r major minor patch <<< "${current_version}"
  case "${bump}" in
    major)
      major=$((major + 1))
      minor=0
      patch=0
      ;;
    minor)
      minor=$((minor + 1))
      patch=0
      ;;
    patch)
      patch=$((patch + 1))
      ;;
    *)
      echo "Invalid bump type: ${bump}" >&2
      usage
      exit 1
      ;;
  esac
  next_version="${major}.${minor}.${patch}"
fi

if [[ "${current_version}" == "${next_version}" ]]; then
  echo "Version unchanged (${current_version})."
  exit 0
fi

tmp_file="$(mktemp)"
if ! awk -v new_version="${next_version}" '
  BEGIN { updated = 0 }
  {
    if (!updated && $0 ~ /^[[:space:]]*version:[[:space:]]*[0-9]+\.[0-9]+\.[0-9]+/) {
      sub(/[0-9]+\.[0-9]+\.[0-9]+/, new_version)
      updated = 1
    }
    print
  }
  END {
    if (!updated) {
      exit 1
    }
  }
' "${skill_file}" > "${tmp_file}"; then
  rm -f "${tmp_file}"
  echo "Failed to update version line in ${skill_file}" >&2
  exit 1
fi
mv "${tmp_file}" "${skill_file}"

today="$(date +%Y-%m-%d)"
printf '| %s | %s | %s |\n' "${next_version}" "${today}" "${note}" >> "${version_file}"

echo "Updated ${skill_file}: ${current_version} -> ${next_version}"
echo "Appended changelog entry in ${version_file}"
