import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import axe from "axe-core";
import InlineCard from "../../app/inline/page";
import Home from "../../app/page";

function mockStorage() {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
      clear: () => undefined,
    },
  });
}

async function expectNoSeriousAxeViolations(container: Element) {
  const results = await axe.run(container, {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa"],
    },
  });
  const seriousOrWorse = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical"
  );
  expect(seriousOrWorse).toEqual([]);
}

describe("runtime accessibility smoke checks", () => {
  test("inline experience has no serious/critical axe violations", async () => {
    mockStorage();
    const { container } = render(<InlineCard />);
    await expectNoSeriousAxeViolations(container);
  });

  test("main studio has no serious/critical axe violations", async () => {
    mockStorage();
    const { container } = render(<Home />);
    await expectNoSeriousAxeViolations(container);
  });
});
