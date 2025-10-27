import { data, resetData } from "./data.js";

// Authentication middleware
export function requireAuth(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Valid API key required",
    });
  }

  next();
}

// Check if user is admin
export function requireAdmin(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Admin access required",
    });
  }

  next();
}

export function setupRoutes(app) {
  // ==================== PUBLIC ENDPOINTS ====================

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Get user by ID
  app.get("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const user = data.users.get(id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        userId: id,
      });
    }

    // Don't expose role in public API
    const { role, ...publicUser } = user;
    res.json(publicUser);
  });

  // List products with optional filtering
  app.get("/api/products", (req, res) => {
    const { category, minPrice, maxPrice, inStock } = req.query;
    let results = [...data.products];

    // Apply filters
    if (category) {
      results = results.filter((p) => p.category === category);
    }

    if (minPrice) {
      results = results.filter((p) => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      results = results.filter((p) => p.price <= parseFloat(maxPrice));
    }

    if (inStock === "true") {
      results = results.filter((p) => p.stock > 0);
    }

    res.json({
      count: results.length,
      products: results,
    });
  });

  // Create order
  app.post("/api/orders", (req, res) => {
    const { userId, productId, quantity } = req.body;

    // Validation
    if (!userId || !productId || !quantity) {
      return res.status(400).json({
        error: "Bad request",
        message: "userId, productId, and quantity are required",
      });
    }

    // Check if user exists
    if (!data.users.has(userId)) {
      return res.status(404).json({
        error: "User not found",
        userId,
      });
    }

    // Check if product exists
    const product = data.products.find((p) => p.id === parseInt(productId));
    if (!product) {
      return res.status(404).json({
        error: "Product not found",
        productId,
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        error: "Insufficient stock",
        available: product.stock,
        requested: quantity,
      });
    }

    // Create order
    const order = {
      id: data.orderCounter++,
      userId,
      productId: product.id,
      productName: product.name,
      quantity,
      pricePerUnit: product.price,
      totalPrice: product.price * quantity,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    data.orders.push(order);
    product.stock -= quantity;

    res.status(201).json(order);
  });

  // ==================== RESTRICTED ENDPOINTS ====================

  // Delete user (admin only) - NOT EXPOSED via MCP
  app.delete("/api/users/:id", requireAdmin, (req, res) => {
    const { id } = req.params;

    if (!data.users.has(id)) {
      return res.status(404).json({
        error: "User not found",
        userId: id,
      });
    }

    data.users.delete(id);
    res.json({
      message: "User deleted successfully",
      userId: id,
    });
  });

  // Get admin statistics (admin only) - NOT EXPOSED via MCP
  app.get("/api/admin/stats", requireAdmin, (req, res) => {
    res.json({
      totalUsers: data.users.size,
      totalProducts: data.products.length,
      totalOrders: data.orders.length,
      totalRevenue: data.orders.reduce((sum, o) => sum + o.totalPrice, 0),
      lowStockProducts: data.products.filter((p) => p.stock < 10).length,
    });
  });

  // Reset database (admin only) - NOT EXPOSED via MCP
  app.post("/api/admin/reset", requireAdmin, (req, res) => {
    resetData();
    res.json({
      message: "Database reset successfully",
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: "Not found",
      path: req.path,
    });
  });
}
