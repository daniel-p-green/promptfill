# Versioning Policy

This skill follows semantic versioning.

## SemVer Rules

- `MAJOR`: Breaking workflow contract changes.
  - Example: Required output artifacts are renamed or removed.
- `MINOR`: Backward-compatible capability additions.
  - Example: New rubric dimensions, new style profiles, new references.
- `PATCH`: Clarifications and non-breaking fixes.
  - Example: Better wording, safer defaults, typo fixes.

## How To Bump

From skill root:

```bash
./scripts/bump-version.sh patch "Clarify pacing defaults"
./scripts/bump-version.sh minor "Add enterprise brand profile"
./scripts/bump-version.sh major "Revise output contract"
```

## Change Log

| Version | Date | Notes |
| --- | --- | --- |
| 0.1.0 | 2026-02-06 | Initial release: brand control schema, motion principles, rubric, and version bump script. |
| 0.2.0 | 2026-02-06 | Add implementation map and non-blocking default behavior. |
| 0.3.0 | 2026-02-06 | Add reusable storyboard, token, scene/root, and QA templates. |
| 0.3.1 | 2026-02-06 | Add runnable starter scaffold and CI validation workflow. |
