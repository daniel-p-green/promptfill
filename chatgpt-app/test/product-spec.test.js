import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  extractPromptFields,
  renderPromptTemplate,
  createInMemoryTemplateStore,
} from "../src/lib/promptfill-core.js";

const specPath = new URL("../../spec/product-tests.json", import.meta.url);

async function loadSpec() {
  const raw = await readFile(specPath, "utf8");
  return JSON.parse(raw);
}

function getVariablesByName(variables) {
  const safe = Array.isArray(variables) ? variables : [];
  return Object.fromEntries(safe.map((item) => [item.name, item]));
}

test("product spec: extraction cases", async () => {
  const spec = await loadSpec();
  const cases = Array.isArray(spec.extraction) ? spec.extraction : [];

  for (const testCase of cases) {
    const result = extractPromptFields(testCase.raw_prompt);
    assert.equal(result.template, testCase.expected_template, `template mismatch for ${testCase.id}`);

    const byName = getVariablesByName(result.variables);
    const expectedVars = testCase.expected_variables ?? {};

    for (const [name, expected] of Object.entries(expectedVars)) {
      assert.ok(byName[name], `missing variable "${name}" in ${testCase.id}`);

      for (const [key, expectedValue] of Object.entries(expected)) {
        assert.deepEqual(
          byName[name][key],
          expectedValue,
          `variable "${name}" field "${key}" mismatch in ${testCase.id}`
        );
      }
    }
  }
});

test("product spec: render cases", async () => {
  const spec = await loadSpec();
  const cases = Array.isArray(spec.render) ? spec.render : [];

  for (const testCase of cases) {
    const result = renderPromptTemplate({
      template: testCase.template,
      variables: testCase.variables,
      values: testCase.values,
    });

    assert.deepEqual(
      result.missingRequired,
      testCase.expected?.missingRequired ?? [],
      `missingRequired mismatch for ${testCase.id}`
    );
    assert.equal(result.rendered, testCase.expected?.rendered ?? "", `rendered mismatch for ${testCase.id}`);
  }
});

test("product spec: store cases", async () => {
  const spec = await loadSpec();
  const cases = Array.isArray(spec.store) ? spec.store : [];

  for (const testCase of cases) {
    const store = createInMemoryTemplateStore();

    for (const template of testCase.templatesToSave ?? []) {
      store.saveTemplate(template);
    }

    const templates = store.listTemplates();
    assert.equal(templates.length, testCase.expectedListCount, `list count mismatch for ${testCase.id}`);

    if (templates.length > 0) {
      assert.equal(
        templates[0].id,
        testCase.expectedFirstTemplateId,
        `first template id mismatch for ${testCase.id}`
      );
      assert.equal(
        templates[0].name,
        testCase.expectedFirstTemplateName,
        `first template name mismatch for ${testCase.id}`
      );
    }
  }
});

