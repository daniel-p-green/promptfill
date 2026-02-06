import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const pageSource = readFileSync(resolve(process.cwd(), "src/app/page.tsx"), "utf8");
const inlineSource = readFileSync(resolve(process.cwd(), "src/app/inline/page.tsx"), "utf8");
const layoutSource = readFileSync(resolve(process.cwd(), "src/app/layout.tsx"), "utf8");
const globalsSource = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

describe("web interface guideline contracts", () => {
  test("destructive variable deletion requires confirmation path", () => {
    expect(pageSource.includes("onClick={() => handleDeleteVariable(variable.name)}")).toBe(false);
    expect(pageSource.includes("setPendingVariableDeleteName")).toBe(true);
  });

  test("inline page uses semantic navigation instead of window.location assignment", () => {
    expect(inlineSource.includes("window.location.href = \"/\"")).toBe(false);
    expect(inlineSource.includes("next/link")).toBe(true);
  });

  test("layout includes theme-color metadata", () => {
    expect(layoutSource.includes("themeColor")).toBe(true);
  });

  test("global styles include reduced-motion fallback", () => {
    expect(globalsSource.includes("@media (prefers-reduced-motion: reduce)")).toBe(true);
  });

  test("drawer scroll region contains overscroll behavior guardrail", () => {
    expect(pageSource.includes("overscroll-contain")).toBe(true);
  });
});
