const fs = require("fs").promises;
const path = require("path");

async function filterOrders() {
  try {
    // Read the orders.json file
    const ordersFilePath = path.join(__dirname, "..", "..", "orders.json");
    const ordersFileContent = await fs.readFile(ordersFilePath, "utf-8");
    const orders = JSON.parse(ordersFileContent);

    const customersFilePath = path.join(
      __dirname,
      "..",
      "..",
      "customers.json"
    );
    const customersFileContent = await fs.readFile(customersFilePath, "utf-8");
    const customers = JSON.parse(customersFileContent);

    const filtered = orders
      .map((x) => ({
        customer_id: x.customer_id,
        version: x.version,
        date_created: x.date_created,
        customer_exist: customers.some((c) => c.id === x.customer_id),
      }))
      .sort((a, b) => a.version - b.version);

    const a = filtered
      .filter((x) => x.customer_exist)
      .sort((a, b) => a.customer_id - b.customer_id)
      .map((x) => x.customer_id).length;
    const output = `orders-filter-${Date.now()}.json`;
    await fs.writeFile(
      path.join(__dirname, "..", "..", output),
      JSON.stringify(filtered, null, 2)
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the function
filterOrders();
