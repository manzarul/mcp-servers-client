export const data = {
  users: new Map([
    [
      "1",
      {
        id: "1",
        name: "Alice Johnson",
        email: "alice@example.com",
        role: "user",
      },
    ],
    [
      "2",
      { id: "2", name: "Bob Smith", email: "bob@example.com", role: "user" },
    ],
    [
      "3",
      {
        id: "3",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
      },
    ],
  ]),

  products: [
    {
      id: 1,
      name: "Laptop Pro",
      category: "electronics",
      price: 1299,
      stock: 15,
    },
    {
      id: 2,
      name: "Wireless Mouse",
      category: "electronics",
      price: 29,
      stock: 50,
    },
    {
      id: 3,
      name: "Mechanical Keyboard",
      category: "electronics",
      price: 89,
      stock: 30,
    },
    {
      id: 4,
      name: "Office Desk",
      category: "furniture",
      price: 299,
      stock: 10,
    },
    {
      id: 5,
      name: "Ergonomic Chair",
      category: "furniture",
      price: 399,
      stock: 8,
    },
    {
      id: 6,
      name: "USB-C Cable",
      category: "accessories",
      price: 15,
      stock: 100,
    },
  ],

  orders: [],
  orderCounter: 1,
};

export function resetData() {
  data.orders = [];
  data.orderCounter = 1;
  console.log("Data reset complete");
}
