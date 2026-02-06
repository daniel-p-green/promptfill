import { expect, test, type Page } from "@playwright/test";

async function dismissWelcomeIfVisible(page: Page) {
  const notNow = page.getByRole("button", { name: "Not now" });
  if (await notNow.isVisible().catch(() => false)) {
    await notNow.click();
  }
}

test.describe("PromptFill UI/UX smoke", () => {
  test("home view renders core library and copy surfaces", async ({ page }) => {
    await page.goto("/");
    await dismissWelcomeIfVisible(page);

    await expect(page.getByText("Write a client email").first()).toBeVisible();
    await expect(page.locator('[data-pf-video="library-pane"]')).toBeVisible();
    await expect(page.locator('[data-pf-video="copy-actions"]')).toBeVisible();
    await expect(page.locator("pre").first()).toContainText("Write an email to Alex Chen");
  });

  test("fill controls update rendered prompt without breaking flow", async ({ page }) => {
    await page.goto("/");
    await dismissWelcomeIfVisible(page);

    await page.getByRole("button", { name: /Edit fields|Hide fields/ }).click();
    const fillFields = page.locator('[data-pf-fill-fields]');
    await expect(fillFields).toBeVisible();

    const contextInput = fillFields.locator("textarea").first();
    await contextInput.fill("Urgent partner update due Friday. Highlight migration timeline.");

    await expect(page.locator("pre").first()).toContainText("Urgent partner update due Friday.");
    await expect(page.locator("pre").first()).toContainText("migration timeline");
  });

  test("share modal opens with import-safe link payload", async ({ page }) => {
    await page.goto("/");
    await dismissWelcomeIfVisible(page);

    await page.getByRole("button", { name: "Share" }).first().click();
    await expect(page.locator('[data-pf-video="share-link-row"]')).toBeVisible();
    await expect(page.getByText("Share payload").first()).toBeVisible();
    await page.getByRole("button", { name: "Close" }).first().click();
  });

  test("advanced quick fill drawer opens and closes cleanly", async ({ page }) => {
    await page.goto("/");
    await dismissWelcomeIfVisible(page);

    const quickFillButton = page.getByRole("button", { name: "Quick fill panel" });
    if (!(await quickFillButton.isVisible().catch(() => false))) {
      await page.getByLabel("Toggle advanced controls").click();
    }

    await page.getByRole("button", { name: "Quick fill panel" }).click();
    await expect(page.locator('[data-pf-video="drawer-fields"]')).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator('[data-pf-video="drawer-fields"]')).not.toBeVisible();
  });

  test("inline card stays compact and actionable", async ({ page }) => {
    await page.goto("/inline");

    await expect(page.getByText("Rendered prompt")).toBeVisible();
    await expect(page.getByRole("button", { name: "Open" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy" })).toBeVisible();
  });
});

