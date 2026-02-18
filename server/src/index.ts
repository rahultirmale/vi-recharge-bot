import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import * as tools from "./tools.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESOURCE_URI = "ui://vi-recharge/widget.html";

// ── Load the pre-built UI HTML ──
function loadWidgetHtml(): string {
  // In dev, look for the built UI dist; in prod, same path
  const distPath = resolve(__dirname, "../../ui/dist/widget.html");
  try {
    return readFileSync(distPath, "utf-8");
  } catch {
    return `<html><body><p>Widget not built yet. Run <code>npm run build</code> in the ui/ folder first.</p></body></html>`;
  }
}

// ── Create MCP Server ──
const server = new McpServer({
  name: "ViRecharge",
  version: "1.0.0",
});

// ── Register UI Resource ──
registerAppResource(
  server,
  "Vi Recharge Widget",
  RESOURCE_URI,
  { description: "Vi (Vodafone Idea) mobile recharge UI widget" },
  async () => ({
    contents: [
      {
        uri: RESOURCE_URI,
        mimeType: RESOURCE_MIME_TYPE,
        text: loadWidgetHtml(),
      },
    ],
  })
);

// ── Register Tools ──

registerAppTool(
  server,
  "validate_msisdn",
  {
    title: "Validate Mobile Number",
    description:
      "Validate a mobile number and identify operator/circle, then show recharge plans",
    inputSchema: {
      msisdn: z.string().describe("10-digit mobile number"),
    },
    _meta: { ui: { resourceUri: RESOURCE_URI } },
  },
  async ({ msisdn }) => {
    const result = tools.validateMsisdn(msisdn);
    return {
      structuredContent: { component: result._meta.ui.component, ...result._meta.ui.props },
      content: [{ type: "text" as const, text: JSON.stringify(result.data) }],
    };
  }
);

registerAppTool(
  server,
  "get_plans",
  {
    title: "Get Recharge Plans",
    description: "Get available recharge plans for a mobile number",
    inputSchema: {
      msisdn: z.string().describe("10-digit mobile number"),
    },
    _meta: { ui: { resourceUri: RESOURCE_URI } },
  },
  async ({ msisdn }) => {
    const result = tools.getPlans(msisdn);
    return {
      structuredContent: { component: result._meta.ui.component, ...result._meta.ui.props },
      content: [{ type: "text" as const, text: JSON.stringify(result.data) }],
    };
  }
);

registerAppTool(
  server,
  "create_order",
  {
    title: "Create Recharge Order",
    description: "Create a recharge order for a specific plan",
    inputSchema: {
      plan_id: z.string().describe("Plan ID to recharge"),
      msisdn: z.string().describe("10-digit mobile number"),
      idempotency_key: z
        .string()
        .optional()
        .describe("Optional idempotency key to prevent double orders"),
    },
    _meta: { ui: { resourceUri: RESOURCE_URI, visibility: ["model", "app"] as any } },
  },
  async ({ plan_id, msisdn, idempotency_key }) => {
    const result = tools.createOrder(plan_id, msisdn, idempotency_key);
    return {
      structuredContent: { component: result._meta.ui.component, ...result._meta.ui.props },
      content: [{ type: "text" as const, text: JSON.stringify(result.data) }],
    };
  }
);

registerAppTool(
  server,
  "initiate_payment",
  {
    title: "Initiate Payment",
    description: "Initiate payment for a recharge order",
    inputSchema: {
      order_id: z.string().describe("Order ID to pay for"),
    },
    _meta: { ui: { resourceUri: RESOURCE_URI, visibility: ["model", "app"] as any } },
  },
  async ({ order_id }) => {
    const result = tools.initiatePayment(order_id);
    return {
      structuredContent: { component: result._meta.ui.component, ...result._meta.ui.props },
      content: [{ type: "text" as const, text: JSON.stringify(result.data) }],
    };
  }
);

registerAppTool(
  server,
  "get_order_status",
  {
    title: "Get Order Status",
    description: "Get the current status of a recharge order",
    inputSchema: {
      order_id: z.string().describe("Order ID to check"),
    },
    _meta: { ui: { resourceUri: RESOURCE_URI, visibility: ["model", "app"] as any } },
  },
  async ({ order_id }) => {
    const result = tools.getOrderStatus(order_id);
    return {
      structuredContent: { component: result._meta.ui.component, ...result._meta.ui.props },
      content: [{ type: "text" as const, text: JSON.stringify(result.data) }],
    };
  }
);

// ── Express + Streamable HTTP Transport ──

const app = express();
app.use(cors());
app.use(express.json());

// Map of session transports for stateful connections
const transports = new Map<string, StreamableHTTPServerTransport>();

app.all("/mcp", async (req, res) => {
  // Handle DELETE for session cleanup
  if (req.method === "DELETE") {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (sessionId && transports.has(sessionId)) {
      const transport = transports.get(sessionId)!;
      await transport.close();
      transports.delete(sessionId);
      res.status(200).end();
    } else {
      res.status(404).end();
    }
    return;
  }

  // For GET (SSE) and POST, check for existing session
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (sessionId && transports.has(sessionId)) {
    const transport = transports.get(sessionId)!;
    await transport.handleRequest(req, res, req.body);
    return;
  }

  // New session: create transport and connect server
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  transport.onclose = () => {
    const sid = (transport as any).sessionId;
    if (sid) transports.delete(sid);
  };

  await server.connect(transport);

  // Handle the initial request
  await transport.handleRequest(req, res, req.body);

  // Store session for future requests
  const sid = (transport as any).sessionId;
  if (sid) transports.set(sid, transport);
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", name: "Vi Recharge MCP Server" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Vi Recharge MCP Server running on http://localhost:${PORT}`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});
