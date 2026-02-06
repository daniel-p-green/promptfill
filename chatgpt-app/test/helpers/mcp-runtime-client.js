import { once } from "node:events";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { createPromptFillHttpServer } from "../../src/server.js";

async function createConnectedClient(baseUrl, { authToken = "" } = {}) {
  const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`), {
    requestInit: {
      headers: authToken ? { authorization: `Bearer ${authToken}` } : {},
    },
  });

  const client = new Client({
    name: "promptfill-runtime-test",
    version: "0.1.0",
  });

  await client.connect(transport);
  return { client, transport };
}

export async function withMcpServer(testFn, options = {}) {
  const server = createPromptFillHttpServer(options);
  const connectedClients = [];

  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await testFn({
      baseUrl,
      async createClient(clientOptions = {}) {
        const connected = await createConnectedClient(baseUrl, clientOptions);
        connectedClients.push(connected);
        return connected;
      },
    });
  } finally {
    for (const connected of connectedClients) {
      await connected.client.close();
    }
    server.close();
    await once(server, "close");
  }
}
