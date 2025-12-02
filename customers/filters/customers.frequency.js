const fs = require("fs").promises;
const path = require("path");

// Count frequency of values in a field
function countValues(customers, field) {
  const counts = {};
  for (const c of customers) {
    let value = c[field];

    if (value === undefined || value === null || value === "") {
      value = "EMPTY";
    }

    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

async function analyzeCustomers() {
  try {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "customers-filter-1764508980267.json"
    );
    const raw = await fs.readFile(filePath, "utf-8");
    const customers = JSON.parse(raw);

    const fieldsToAnalyze = [
      "email",
      "first_name",
      "last_name",
      "username",
      "role",
      "is_paying_customer",
      "date_created",
      "billing.country",
      "billing.state",
      "shipping.country",
      "shipping.state",
    ];

    const result = {};

    for (const field of fieldsToAnalyze) {
      if (field.includes(".")) {
        const [p1, p2] = field.split(".");
        const freq = {};

        for (const c of customers) {
          let value = c[p1] && c[p1][p2] ? c[p1][p2] : "EMPTY";
          freq[value] = (freq[value] || 0) + 1;
        }

        result[field] = freq;
      } else {
        result[field] = countValues(customers, field);
      }
    }

    const output = `customers-email-${Date.now()}.json`;
    await fs.writeFile(
      path.join(__dirname, "..", "..", output),
      JSON.stringify(result, null, 2)
    );

    console.log("DONE. Output file:", output);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

analyzeCustomers();
