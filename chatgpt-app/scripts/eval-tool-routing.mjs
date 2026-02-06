import { mkdir, readFile, writeFile } from "node:fs/promises";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const MIN_ACCURACY = Number(process.env.ROUTING_MIN_ACCURACY ?? "0.8");
const ROUTING_EVAL_REQUIRED = /^(1|true|yes|on)$/i.test(
  process.env.ROUTING_EVAL_REQUIRED ?? ""
);

const toolNames = [
  "extract_prompt_fields",
  "render_prompt",
  "save_template",
  "list_templates",
  "get_template",
  "search_templates",
  "update_template",
  "delete_template",
];
const allowedPredictions = new Set([...toolNames, "NONE"]);

const fixturePath = new URL("../../spec/tool-trigger-prompts.json", import.meta.url);
const reportPath = new URL("../../output/tool-routing-eval.json", import.meta.url);

const systemInstruction = [
  "You are evaluating whether a user message should route to a PromptFill tool.",
  "Return exactly one token and no explanation.",
  "Allowed values: extract_prompt_fields, render_prompt, save_template, list_templates, get_template, search_templates, update_template, delete_template, NONE.",
  "Use NONE if no PromptFill tool should be selected.",
].join(" ");

function normalizeExpected(expectedTool) {
  if (expectedTool === null || expectedTool === undefined || expectedTool === "") {
    return "NONE";
  }
  return String(expectedTool).trim();
}

function extractText(responseJson) {
  if (typeof responseJson?.output_text === "string" && responseJson.output_text.trim()) {
    return responseJson.output_text.trim();
  }

  const output = Array.isArray(responseJson?.output) ? responseJson.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const chunk of content) {
      const text = typeof chunk?.text === "string" ? chunk.text : "";
      if (text.trim()) return text.trim();
    }
  }

  return "";
}

function normalizePrediction(rawText) {
  const cleaned = String(rawText ?? "")
    .trim()
    .replace(/^`+|`+$/g, "")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();

  if (!cleaned) return "NONE";
  if (cleaned === "none") return "NONE";

  for (const toolName of toolNames) {
    if (cleaned === toolName || cleaned.includes(toolName)) {
      return toolName;
    }
  }

  return "NONE";
}

async function evaluatePrompt(promptText) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0,
      max_output_tokens: 12,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemInstruction }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: `Prompt: ${promptText}` }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${body}`);
  }

  const json = await response.json();
  const rawText = extractText(json);
  const prediction = normalizePrediction(rawText);

  if (!allowedPredictions.has(prediction)) {
    return { rawText, prediction: "NONE" };
  }
  return { rawText, prediction };
}

function calculateSummary(rows) {
  const total = rows.length;
  const passed = rows.filter((row) => row.correct).length;
  const accuracy = total === 0 ? 0 : passed / total;
  return { total, passed, accuracy };
}

async function main() {
  if (!OPENAI_API_KEY.trim()) {
    if (ROUTING_EVAL_REQUIRED) {
      console.error(
        "OPENAI_API_KEY is required because ROUTING_EVAL_REQUIRED=true. Configure the key in CI secrets."
      );
      process.exit(1);
    }
    console.log("Skipping routing eval: OPENAI_API_KEY is not set.");
    process.exit(0);
  }

  if (!Number.isFinite(MIN_ACCURACY) || MIN_ACCURACY <= 0 || MIN_ACCURACY > 1) {
    throw new Error("ROUTING_MIN_ACCURACY must be a number between 0 and 1.");
  }

  const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
  const buckets = ["direct", "indirect", "negative"];
  const bucketResults = {};
  const allRows = [];

  for (const bucketName of buckets) {
    const prompts = Array.isArray(fixture?.[bucketName]) ? fixture[bucketName] : [];
    const rows = [];

    for (const promptCase of prompts) {
      const expected = normalizeExpected(promptCase.expected_tool);
      const { rawText, prediction } = await evaluatePrompt(promptCase.prompt);
      const row = {
        bucket: bucketName,
        prompt: promptCase.prompt,
        expected,
        prediction,
        raw_model_output: rawText,
        correct: expected === prediction,
      };
      rows.push(row);
      allRows.push(row);
    }

    bucketResults[bucketName] = {
      ...calculateSummary(rows),
      rows,
    };
  }

  const overall = calculateSummary(allRows);
  const report = {
    evaluated_at: new Date().toISOString(),
    model: OPENAI_MODEL,
    min_accuracy: MIN_ACCURACY,
    overall,
    buckets: bucketResults,
  };

  await mkdir(new URL("../../output/", import.meta.url), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    [
      "Tool routing evaluation complete.",
      `Model: ${OPENAI_MODEL}`,
      `Overall accuracy: ${(overall.accuracy * 100).toFixed(1)}% (${overall.passed}/${overall.total})`,
      `Threshold: ${(MIN_ACCURACY * 100).toFixed(1)}%`,
      `Report: ${reportPath.pathname}`,
    ].join("\n")
  );

  if (overall.accuracy < MIN_ACCURACY) {
    process.exitCode = 1;
    console.error(
      `Routing accuracy ${(overall.accuracy * 100).toFixed(1)}% is below threshold ${(MIN_ACCURACY * 100).toFixed(1)}%.`
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
