import assert from "node:assert/strict";
import test from "node:test";

import { withMcpServer } from "./helpers/mcp-runtime-client.js";

test("runtime MCP flow invokes tools and keeps template state session-scoped", async () => {
  await withMcpServer(async ({ createClient }) => {
    const first = await createClient();
    const second = await createClient();
    const firstClient = first.client;
    const secondClient = second.client;

    assert.ok(first.transport.sessionId, "first client should receive a session id");
    assert.ok(second.transport.sessionId, "second client should receive a session id");
    assert.notEqual(
      first.transport.sessionId,
      second.transport.sessionId,
      "session ids should not collide between clients"
    );

    const suggestions = await firstClient.callTool({
      name: "suggest_templates",
      arguments: {
        use_case: "email",
      },
    });
    assert.equal(suggestions?.structuredContent?.kind, "suggest");
    assert.ok((suggestions?.structuredContent?.templates?.length ?? 0) >= 1);

    const extraction = await firstClient.callTool({
      name: "extract_prompt_fields",
      arguments: {
        prompt_text: "Write an email to {{recipient_name}} about {{topic}}.",
      },
    });
    assert.equal(extraction?.structuredContent?.kind, "extraction");
    assert.equal(extraction?.structuredContent?.variables?.length, 2);

    const rendered = await firstClient.callTool({
      name: "render_prompt",
      arguments: {
        template: extraction.structuredContent.template,
        variables: extraction.structuredContent.variables,
        values: {
          recipient_name: "Alex",
          topic: "Q2 roadmap",
        },
      },
    });
    assert.equal(rendered?.structuredContent?.kind, "render");
    assert.equal(rendered?.structuredContent?.missing_required?.length ?? 0, 0);
    assert.ok(rendered?.structuredContent?.rendered_prompt?.includes("Alex"));

    const saved = await firstClient.callTool({
      name: "save_template",
      arguments: {
        name: "Email template",
        template: extraction.structuredContent.template,
        variables: extraction.structuredContent.variables,
      },
    });
    assert.equal(saved?.structuredContent?.kind, "save");
    const savedTemplateId = saved?.structuredContent?.template?.id;
    assert.ok(savedTemplateId, "save_template should return template id");

    const fetched = await firstClient.callTool({
      name: "get_template",
      arguments: { id: savedTemplateId },
    });
    assert.equal(fetched?.structuredContent?.kind, "get");
    assert.equal(fetched?.structuredContent?.template?.id, savedTemplateId);

    const searched = await firstClient.callTool({
      name: "search_templates",
      arguments: { query: "email" },
    });
    assert.equal(searched?.structuredContent?.kind, "search");
    assert.equal(searched?.structuredContent?.templates?.length, 1);
    assert.equal(searched?.structuredContent?.templates?.[0]?.id, savedTemplateId);

    const updated = await firstClient.callTool({
      name: "update_template",
      arguments: {
        id: savedTemplateId,
        name: "Updated email template",
      },
    });
    assert.equal(updated?.structuredContent?.kind, "update");
    assert.equal(updated?.structuredContent?.template?.name, "Updated email template");

    const firstList = await firstClient.callTool({ name: "list_templates", arguments: {} });
    const secondList = await secondClient.callTool({ name: "list_templates", arguments: {} });

    assert.equal(firstList?.structuredContent?.kind, "list");
    assert.equal(secondList?.structuredContent?.kind, "list");
    assert.equal(firstList?.structuredContent?.templates?.length, 1);
    assert.equal(secondList?.structuredContent?.templates?.length, 0);

    const deleted = await firstClient.callTool({
      name: "delete_template",
      arguments: { id: savedTemplateId },
    });
    assert.equal(deleted?.structuredContent?.kind, "delete");
    assert.equal(deleted?.structuredContent?.deleted, true);

    const afterDelete = await firstClient.callTool({
      name: "list_templates",
      arguments: {},
    });
    assert.equal(afterDelete?.structuredContent?.templates?.length, 0);
  });
});

test("runtime metadata exposes tool invocation annotations", async () => {
  await withMcpServer(async ({ createClient }) => {
    const { client } = await createClient();

    const result = await client.listTools();
    const tools = Array.isArray(result?.tools) ? result.tools : [];
    const byName = new Map(tools.map((tool) => [tool.name, tool]));

    const extract = byName.get("extract_prompt_fields");
    assert.ok(extract, "extract_prompt_fields should be present");
    assert.equal(
      extract?._meta?.["openai/toolInvocation/invoking"],
      "Extracting fields...",
      "extract tool should expose invoking copy"
    );
    assert.equal(
      extract?._meta?.["openai/toolInvocation/invoked"],
      "Fields ready",
      "extract tool should expose invoked copy"
    );

    const resourcesResult = await client.listResources();
    const resources = Array.isArray(resourcesResult?.resources) ? resourcesResult.resources : [];
    assert.ok(
      resources.some((resource) => resource.uri === "ui://widget/promptfill-fullscreen-v1.html"),
      "runtime resource metadata should include fullscreen editor resource"
    );

    const inlineResource = await client.readResource({
      uri: "ui://widget/promptfill-inline-v1.html",
    });
    const inlineContent = Array.isArray(inlineResource?.contents) ? inlineResource.contents[0] : undefined;
    assert.equal(
      inlineContent?.mimeType,
      "text/html;profile=mcp-app",
      "inline resource should use MCP Apps widget MIME type"
    );

    const inlineMeta = inlineContent?._meta ?? {};
    const inlineUiMeta = inlineMeta.ui ?? {};
    const inlineUiCsp = inlineUiMeta.csp ?? {};
    const inlineWidgetCsp = inlineMeta["openai/widgetCSP"] ?? {};

    assert.equal(
      inlineUiMeta.domain,
      "https://web-sandbox.oaiusercontent.com",
      "default widget domain should use the standard Apps SDK sandbox origin"
    );
    assert.deepEqual(
      inlineUiCsp.connectDomains,
      [],
      "inline resource should keep an explicit empty connect-domain allowlist"
    );
    assert.deepEqual(
      inlineUiCsp.resourceDomains,
      ["https://persistent.oaistatic.com"],
      "inline resource should allow the expected static asset domain"
    );
    assert.equal(
      inlineMeta["openai/widgetDomain"],
      inlineUiMeta.domain,
      "OpenAI compatibility alias should match ui.domain"
    );
    assert.deepEqual(
      inlineWidgetCsp.connect_domains,
      inlineUiCsp.connectDomains,
      "OpenAI compatibility CSP alias should match standard connectDomains"
    );
    assert.deepEqual(
      inlineWidgetCsp.resource_domains,
      inlineUiCsp.resourceDomains,
      "OpenAI compatibility CSP alias should match standard resourceDomains"
    );
  });
});

test("widget domain option is normalized to an origin", async () => {
  await withMcpServer(
    async ({ createClient }) => {
      const { client } = await createClient();
      const fullscreenResource = await client.readResource({
        uri: "ui://widget/promptfill-fullscreen-v1.html",
      });
      const fullscreenContent = Array.isArray(fullscreenResource?.contents)
        ? fullscreenResource.contents[0]
        : undefined;
      const fullscreenMeta = fullscreenContent?._meta ?? {};
      assert.equal(
        fullscreenMeta?.ui?.domain,
        "https://widgets.promptfill.dev",
        "configured widget domain should be normalized and applied to resource metadata"
      );
      assert.equal(
        fullscreenMeta?.["openai/widgetDomain"],
        "https://widgets.promptfill.dev",
        "OpenAI compatibility alias should match normalized widget domain"
      );
    },
    { widgetDomain: "https://widgets.promptfill.dev/runtime/frame" }
  );
});

test("auth token mode requires bearer token", async () => {
  await withMcpServer(
    async ({ createClient }) => {
      const unauthorizedClientPromise = createClient();
      await assert.rejects(
        unauthorizedClientPromise,
        /Unauthorized|401/,
        "client without bearer token should be rejected"
      );

      const { client } = await createClient({ authToken: "secret-token" });
      const tools = await client.listTools();
      assert.ok(Array.isArray(tools?.tools));
    },
    { authToken: "secret-token" }
  );
});
