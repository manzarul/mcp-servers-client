// Tool definitions for MCP server
export const toolDefinitions = [
  {
    name: "get_user",
    description: "Retrieve user information by user ID",
    inputSchema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "The unique identifier of the user",
        },
      },
      required: ["userId"],
    },
  },
  {
    name: "list_products",
    description:
      "List products with optional filtering by category, price range, and stock availability",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description:
            "Filter by product category (e.g., electronics, furniture, accessories)",
        },
        minPrice: {
          type: "number",
          description: "Minimum price filter",
        },
        maxPrice: {
          type: "number",
          description: "Maximum price filter",
        },
        inStock: {
          type: "boolean",
          description: "Filter to show only products in stock",
        },
      },
    },
  },
  {
    name: "create_order",
    description: "Create a new order for a user",
    inputSchema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "The ID of the user placing the order",
        },
        productId: {
          type: "number",
          description: "The ID of the product to order",
        },
        quantity: {
          type: "number",
          description: "The quantity to order",
        },
      },
      required: ["userId", "productId", "quantity"],
    },
  },
  {
    name: "check_health",
    description: "Check the health status of the microservice",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];
