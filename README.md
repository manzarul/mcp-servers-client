# MCP Microservice Example

A developer-friendly demo showing how to wrap a Node.js microservice with an MCP server and interact with it using an MCP client.

---

## Project Structure

- **Microservice** (`src/microservice/`): REST API for users, products, and orders.
- **MCP Server** (`src/mcp-server/`): Wraps selected microservice endpoints as MCP tools.
- **MCP Client** (`src/mcp-client/`): Interactive CLI to call MCP tools and see results.

---

## How It Works

1. The microservice exposes HTTP endpoints.
2. The MCP server wraps these endpoints as tools (APIs) for AI/agent clients.
3. The MCP client connects to the MCP server, lists tools, and lets you call them interactively.

---

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env if needed
   ```
3. **Start the microservice:**
   ```bash
   npm run microservice
   ```
4. **Start the MCP client (spawns MCP server):**
   ```bash
   npm run client
   ```
   - Select a server, tool, and provide arguments as prompted.
   - Try multiple tools or servers, or exit when done.

---

## Developer Tips

- Add new APIs by updating:
  - `src/microservice/routes.js` (REST endpoint)
  - `src/mcp-server/tools.js` (tool definition)
  - `src/mcp-server/handlers.js` (tool handler)
- Add more MCP servers in `mcp-servers.config.js`.
- The client supports repeated tool calls and server switching.
- All errors are returned in a consistent format.

---

For more, see code comments in each folder. Happy hacking!
