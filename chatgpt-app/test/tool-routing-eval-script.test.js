import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptPath = new URL("../scripts/eval-tool-routing.mjs", import.meta.url);
const workingDir = new URL("..", import.meta.url);

function runEval(env = {}) {
  return spawnSync(process.execPath, [fileURLToPath(scriptPath)], {
    cwd: fileURLToPath(workingDir),
    env: {
      ...process.env,
      OPENAI_API_KEY: "",
      ...env,
    },
    encoding: "utf8",
  });
}

test("routing eval skips when key is missing and strict mode is off", () => {
  const result = runEval({ ROUTING_EVAL_REQUIRED: "false" });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Skipping routing eval/i);
});

test("routing eval fails when key is missing and strict mode is on", () => {
  const result = runEval({ ROUTING_EVAL_REQUIRED: "true" });
  assert.notEqual(result.status, 0);
  assert.match(
    `${result.stderr}\n${result.stdout}`,
    /ROUTING_EVAL_REQUIRED|OPENAI_API_KEY/i
  );
});
