const fs = require("fs").promises;
const path = require("path");

// Count frequency of values in a field
function countValues(orders, field) {
  const counts = {};
  for (const c of orders) {
    let value = c[field];

    if (value === undefined || value === null || value === "") {
      value = "EMPTY";
    }

    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

async function analyzeOrders() {
  try {
    const filePath = path.join(__dirname, "..", "..", "orders.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const orders = JSON.parse(raw);
    console.log(orders.length);

    const fieldsToAnalyze = [
      "transaction_id",
      "customer_id",
      "parent_id",
      "currency",
      "status",
      "version",
      "created_via",
      "payment_method",
      "customer_ip_address",
      // "billing.country",
      // "billing.state",
      // "shipping.country",
      // "shipping.state",
    ];

    const result = {};

    for (const field of fieldsToAnalyze) {
      if (field.includes(".")) {
        const [p1, p2] = field.split(".");
        const freq = {};

        for (const c of orders) {
          let value = c[p1] && c[p1][p2] ? c[p1][p2] : "EMPTY";
          freq[value] = (freq[value] || 0) + 1;
        }

        result[field] = freq;
      } else {
        result[field] = countValues(orders, field);
      }
    }

    const output = `orders-frequency-${Date.now()}.json`;
    await fs.writeFile(
      path.join(__dirname, "..", "..", output),
      JSON.stringify(result, null, 2)
    );

    console.log("DONE. Output file:", output);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

analyzeOrders();
