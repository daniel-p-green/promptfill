import { describe, expect, test } from "vitest";
import { createCapturedPromptDraft } from "../capturePrompt";

describe("createCapturedPromptDraft", () => {
  test("returns null for empty capture input", async () => {
    const result = await createCapturedPromptDraft("   ");
    expect(result).toBeNull();
  });

  test("derives a friendly name from the first sentence", async () => {
    const result = await createCapturedPromptDraft(
      "Write an email to Alex about Q2 pricing updates.\n\nKeep it concise."
    );

    expect(result?.name).toBe("Write an email to Alex about Q2 pricing updates");
    expect(result?.description).toBe("Saved from quick capture");
  });

  test("normalizes explicit placeholders and infers field types", async () => {
    const result = await createCapturedPromptDraft(
      "Write an email to [recipient_name] about {topic}. Tone: <tone>. Context: {context}."
    );

    expect(result?.template).toContain("{{recipient_name}}");
    expect(result?.template).toContain("{{topic}}");
    expect(result?.template).toContain("{{tone}}");
    expect(result?.template).toContain("{{context}}");
    expect(result?.variables.find((item) => item.name === "tone")?.type).toBe("enum");
    expect(result?.variables.find((item) => item.name === "context")?.type).toBe("text");
  });

  test("infers recipient and topic from natural language phrasing", async () => {
    const result = await createCapturedPromptDraft(
      "Write an email to Alex Chen about Q2 pricing update."
    );

    expect(result?.template).toContain("{{recipient_name}}");
    expect(result?.template).toContain("{{topic}}");
  });
});
