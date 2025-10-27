import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const MICROSERVICE_BASE_URL = `http://${
  process.env.MICROSERVICE_HOST || "localhost"
}:${process.env.MICROSERVICE_PORT || 3000}`;

export class ToolHandlers {
  async getUserHandler(args) {
    const { userId } = args;

    try {
      const response = await fetch(
        `${MICROSERVICE_BASE_URL}/api/users/${userId}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const user = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(user, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  async listProductsHandler(args) {
    const { category, minPrice, maxPrice, inStock } = args;

    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (minPrice !== undefined)
        params.append("minPrice", minPrice.toString());
      if (maxPrice !== undefined)
        params.append("maxPrice", maxPrice.toString());
      if (inStock !== undefined) params.append("inStock", inStock.toString());

      const url = `${MICROSERVICE_BASE_URL}/api/products${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list products: ${error.message}`);
    }
  }

  async createOrderHandler(args) {
    const { userId, productId, quantity } = args;

    try {
      const response = await fetch(`${MICROSERVICE_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, productId, quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const order = await response.json();

      return {
        content: [
          {
            type: "text",
            text: `✅ Order created successfully!\n\n${JSON.stringify(
              order,
              null,
              2
            )}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  async checkHealthHandler() {
    try {
      const response = await fetch(`${MICROSERVICE_BASE_URL}/api/health`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const health = await response.json();

      return {
        content: [
          {
            type: "text",
            text: `✅ Microservice is healthy\n\n${JSON.stringify(
              health,
              null,
              2
            )}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  async handleToolCall(name, args) {
    switch (name) {
      case "get_user":
        return await this.getUserHandler(args);

      case "list_products":
        return await this.listProductsHandler(args);

      case "create_order":
        return await this.createOrderHandler(args);

      case "check_health":
        return await this.checkHealthHandler(args);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}
