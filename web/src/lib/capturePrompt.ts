import {
  createExtractionProposal,
  type ExtractionVariable,
} from "./extractionAssist";

type PromptValue = string | number | boolean;

export type CapturedPromptDraft = {
  name: string;
  description: string;
  tags: string[];
  template: string;
  variables: ExtractionVariable[];
  values: Record<string, PromptValue>;
};

const summarizeName = (raw: string) => {
  const compact = raw.replace(/\s+/g, " ").trim();
  if (!compact) return "Saved prompt";
  const firstLine = compact.split("\n")[0]?.trim() ?? "";
  const firstSentence = firstLine.split(/[.!?]/)[0]?.trim() ?? "";
  const candidate = firstSentence || firstLine || compact;
  if (!candidate) return "Saved prompt";
  return candidate.length <= 68 ? candidate : `${candidate.slice(0, 67).trimEnd()}…`;
};

const resolveDefaultValue = (variable: ExtractionVariable): PromptValue => {
  if (variable.type === "boolean") {
    return variable.defaultValue === "true";
  }
  if (variable.type === "number") {
    if (variable.defaultValue === "") return "";
    const numeric = Number(variable.defaultValue);
    return Number.isFinite(numeric) ? numeric : "";
  }
  return variable.defaultValue || "";
};

const compactPlaceholderSyntax = (template: string) =>
  template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, "{{$1}}");

export async function createCapturedPromptDraft(
  rawText: string
): Promise<CapturedPromptDraft | null> {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  const proposal = await createExtractionProposal({
    template: trimmed,
    existingVariables: [],
  });

  const variables = proposal.referencedVariables;
  const values = variables.reduce<Record<string, PromptValue>>((acc, variable) => {
    acc[variable.name] = resolveDefaultValue(variable);
    return acc;
  }, {});

  return {
    name: summarizeName(trimmed),
    description: "Saved from quick capture",
    tags: ["captured"],
    template: compactPlaceholderSyntax(proposal.normalizedTemplate),
    variables,
    values,
  };
}
