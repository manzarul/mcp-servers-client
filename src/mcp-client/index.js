import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { examples } from "./examples.js";
import { mcpServers } from "../../mcp-servers.config.js";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MicroserviceMCPClient {
  constructor(config = {}) {
    this.config = config;
    this.client = new Client(
      {
        name: "microservice-mcp-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );
  }

  async connect() {
    let transport;
    if (this.config.type === "local") {
      transport = new StdioClientTransport({
        command: "node",
        args: [this.config.serverPath],
      });
      console.log(
        `🔗 Connecting to local MCP server: ${this.config.serverPath}`
      );
    } else {
      throw new Error("Only local transport is supported in this example.");
    }
    await this.client.connect(transport);
    console.log(`✅ Connected to MCP server: ${this.config.name}\n`);
  }

  async listTools() {
    const response = await this.client.listTools();

    console.log("📚 Available Tools:");
    console.log("=".repeat(60));
    response.tools.forEach((tool, index) => {
      console.log(`\n${index + 1}. ${tool.name}`);
      console.log(`   ${tool.description}`);
    });
    console.log("\n" + "=".repeat(60) + "\n");

    return response.tools;
  }

  async callTool(name, args, description = "") {
    console.log("🔧 Calling Tool");
    console.log("-".repeat(60));
    console.log(`Tool: ${name}`);
    if (description) console.log(`Description: ${description}`);
    console.log(`Arguments: ${JSON.stringify(args, null, 2)}`);
    console.log("-".repeat(60));

    try {
      const response = await this.client.callTool({
        name,
        arguments: args,
      });

      console.log("✅ Response:");
      response.content.forEach((item) => {
        if (item.type === "text") {
          console.log(item.text);
        }
      });

      return response;
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      return null;
    } finally {
      console.log("\n" + "=".repeat(60) + "\n");
    }
  }

  async runExamples() {
    console.log("🧪 Running Example Calls");
    console.log("=".repeat(60) + "\n");

    for (const example of examples) {
      await this.callTool(example.tool, example.args, example.description);

      // Small delay between calls
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  async close() {
    await this.client.close();
    console.log("👋 Disconnected from MCP server");
  }
}

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 MCP Client Interactive Demo");
  console.log("=".repeat(60) + "\n");

  let exitRequested = false;
  while (!exitRequested) {
    // 1. List available servers
    console.log("Available MCP Servers:");
    mcpServers.forEach((srv, idx) => {
      console.log(`  [${idx + 1}] ${srv.name} - ${srv.description}`);
    });
    let serverIdx = await prompt("Select a server [1]: ");
    if (!serverIdx) serverIdx = 1;
    serverIdx = parseInt(serverIdx, 10) - 1;
    const selectedServer = mcpServers[serverIdx];
    if (!selectedServer) {
      console.error("Invalid server selection.");
      continue;
    }

    // 2. Connect to selected server
    const client = new MicroserviceMCPClient(selectedServer);
    try {
      await client.connect();
      let tryAnotherTool = true;
      while (tryAnotherTool) {
        // 3. List tools
        const tools = await client.listTools();
        // 4. Prompt user to select a tool
        tools.forEach((tool, idx) => {
          console.log(`  [${idx + 1}] ${tool.name} - ${tool.description}`);
        });
        let toolIdx = await prompt("Select a tool to call [1]: ");
        if (!toolIdx) toolIdx = 1;
        toolIdx = parseInt(toolIdx, 10) - 1;
        const selectedTool = tools[toolIdx];
        if (!selectedTool) {
          console.error("Invalid tool selection.");
          continue;
        }
        // 5. Prompt for arguments
        let args = {};
        if (selectedTool.inputSchema && selectedTool.inputSchema.properties) {
          for (const [key, prop] of Object.entries(
            selectedTool.inputSchema.properties
          )) {
            let val = await prompt(`Enter value for '${key}' (${prop.type}): `);
            if (val !== undefined && val !== "") {
              if (prop.type === "number") val = Number(val);
              if (prop.type === "boolean") val = val === "true";
              args[key] = val;
            }
          }
        }
        // 6. Call tool
        await client.callTool(
          selectedTool.name,
          args,
          selectedTool.description
        );
        // 7. Ask user for next action
        let nextAction = await prompt(
          "Try another tool [t], switch server [s], or exit [e]? [t]: "
        );
        if (!nextAction || nextAction.toLowerCase() === "t") {
          tryAnotherTool = true;
        } else if (nextAction.toLowerCase() === "s") {
          tryAnotherTool = false;
        } else if (nextAction.toLowerCase() === "e") {
          tryAnotherTool = false;
          exitRequested = true;
        } else {
          tryAnotherTool = true;
        }
      }
      await client.close();
      console.log("\n✨ Interactive session completed!\n");
    } catch (error) {
      console.error("\n❌ Error:", error.message);
      console.error(error.stack);
      let nextAction = await prompt(
        "Try another server [s] or exit [e]? [s]: "
      );
      if (nextAction && nextAction.toLowerCase() === "e") {
        exitRequested = true;
      }
    }
  }
  console.log("👋 Exiting MCP Client. Goodbye!");
}

main();
