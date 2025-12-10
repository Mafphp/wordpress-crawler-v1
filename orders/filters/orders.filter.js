import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function filterOrders() {
  try {
    // Read the orders.json file
    const ordersFilePath = path.join(
      __dirname,
      "..",
      "..",
      "data",
      "orders.json"
    );
    const ordersFileContent = await fs.readFile(ordersFilePath, "utf-8");
    const orders = JSON.parse(ordersFileContent);

    const d = orders
      .filter(
        (order) =>
          !order.line_items?.some((item) =>
            item.meta_data?.some((meta) => meta.key.includes("_woosb_ids"))
          )
      ).filter(x => x.line_items.length > 2)
      .map((x) => ({
        version: x.version,
        id: x.id,
        count: x.line_items?.length,
      }));
    console.log(d);
    return;
    const filtered = orders.filter(
      (x) =>
        // x.billing?.email === "lucyhodgson@live.co.uk" ||
        x.coupon_lines[0]?.code === "paigewaters"
    );
    // const customersFilePath = path.join(
    //   __dirname,
    //   "..",
    //   "..",
    //   "customers.json"
    // );
    // const customersFileContent = await fs.readFile(customersFilePath, "utf-8");
    // const customers = JSON.parse(customersFileContent);

    // const filtered = orders
    //   .map((x) => ({
    //     customer_id: x.customer_id,
    //     version: x.version,
    //     date_created: x.date_created,
    //     customer_exist: customers.some((c) => c.id === x.customer_id),
    //   }))
    //   .sort((a, b) => a.version - b.version);

    // const a = filtered
    //   .filter((x) => x.customer_exist)
    //   .sort((a, b) => a.customer_id - b.customer_id)
    //   .map((x) => x.customer_id).length;
    console.log(filtered.length);
    const output = `orders-filter-${Date.now()}.json`;
    await fs.writeFile(
      path.join(__dirname, "..", "..", "data", output),
      JSON.stringify(filtered, null, 2)
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the function
filterOrders();
