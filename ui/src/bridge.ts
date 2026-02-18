import { App } from "@modelcontextprotocol/ext-apps";

export type ToolResultCallback = (structuredContent: Record<string, unknown>) => void;

let appInstance: App | null = null;

/**
 * Initialize the MCP Apps SDK bridge.
 * Connects to the ChatGPT host via PostMessageTransport.
 */
export async function initBridge(onToolResult: ToolResultCallback) {
  const app = new App(
    { name: "ViRecharge", version: "1.0.0" },
    {} // capabilities
  );

  // Called when the host pushes tool execution results
  app.ontoolresult = (params) => {
    if (params.structuredContent) {
      onToolResult(params.structuredContent as Record<string, unknown>);
    }
  };

  // Called when the host sends the initial tool input args
  app.ontoolinput = (params) => {
    if (params.arguments) {
      onToolResult(params.arguments as Record<string, unknown>);
    }
  };

  try {
    await app.connect(); // uses PostMessageTransport by default
    appInstance = app;
  } catch (err) {
    console.error("Failed to connect to host:", err);
  }
}

/**
 * Call a tool on the MCP server through the ChatGPT host proxy.
 */
export async function callTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  if (!appInstance) {
    console.error("Bridge not connected");
    return null;
  }

  const result = await appInstance.callServerTool({
    name,
    arguments: args,
  });

  return result;
}

export function destroyBridge() {
  appInstance = null;
}
