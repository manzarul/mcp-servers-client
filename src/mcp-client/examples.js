export const examples = [
  {
    name: "Get User Information",
    tool: "get_user",
    args: { userId: "1" },
    description: "Fetch details for user with ID 1",
  },
  {
    name: "List All Products",
    tool: "list_products",
    args: {},
    description: "Get all available products",
  },
  {
    name: "List Electronics",
    tool: "list_products",
    args: { category: "electronics", inStock: true },
    description: "Get only electronics that are in stock",
  },
  {
    name: "List Products in Price Range",
    tool: "list_products",
    args: { minPrice: 50, maxPrice: 500 },
    description: "Get products between $50 and $500",
  },
  {
    name: "Create Order",
    tool: "create_order",
    args: { userId: "1", productId: 2, quantity: 3 },
    description: "Order 3 wireless mice for user 1",
  },
  {
    name: "Check Health",
    tool: "check_health",
    args: {},
    description: "Verify microservice is running",
  },
  {
    name: "Get Non-existent User (Error Case)",
    tool: "get_user",
    args: { userId: "999" },
    description: "Try to get a user that doesn't exist",
  },
];
