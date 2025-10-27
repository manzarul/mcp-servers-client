#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { toolDefinitions } from "./tools.js";
import { ToolHandlers } from "./handlers.js";

dotenv.config();

class MicroserviceMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: process.env.MCP_SERVER_NAME || "microservice-mcp",
        version: process.env.MCP_SERVER_VERSION || "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.handlers = new ToolHandlers();
    this.setupHandlers();
    this.setupErrorHandling();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error("[MCP Server] Tools listed");
      return {
        tools: toolDefinitions,
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      console.error(`[MCP Server] Tool called: ${name}`);
      console.error(`[MCP Server] Arguments:`, JSON.stringify(args, null, 2));

      try {
        const result = await this.handlers.handleToolCall(name, args);
        console.error(`[MCP Server] Tool ${name} completed successfully`);
        return result;
      } catch (error) {
        console.error(`[MCP Server] Tool ${name} failed:`, error.message);
        return {
          content: [
            {
              type: "text",
              text: `❌ Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error("[MCP Server Error]", error);
    };

    process.on("SIGINT", async () => {
      console.error("[MCP Server] Shutting down...");
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error("=".repeat(50));
    console.error("🔧 MCP Server Started");
    console.error("=".repeat(50));
    console.error(
      `📦 Name: ${process.env.MCP_SERVER_NAME || "microservice-mcp"}`
    );
    console.error(`📌 Version: ${process.env.MCP_SERVER_VERSION || "1.0.0"}`);
    console.error(`🔗 Transport: stdio`);
    console.error(`\n🛠️  Exposed Tools: ${toolDefinitions.length}`);
    toolDefinitions.forEach((tool) => {
      console.error(`   - ${tool.name}: ${tool.description}`);
    });
    console.error("=".repeat(50));
  }
}

const server = new MicroserviceMCPServer();
server.run().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
