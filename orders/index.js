import fetch from "node-fetch";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  baseUrl: process.env.WC_BASE_URL,
  username: process.env.WC_USERNAME,
  password: process.env.WC_PASSWORD,
};

// Reusable authentication header generator
function getAuthHeaders() {
  const { username, password } = config;
  return {
    "Content-Type": "application/json",
    Authorization:
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
  };
}

// Generic paginated fetch function
async function fetchAllPaginated(
  endpoint,
  fields,
  orderBy = "date",
  orderDirection = "asc"
) {
  const perPage = 100;
  let allItems = [];
  let currentPage = 1;
  let totalPages = 1;

  const fieldString = Array.isArray(fields) ? fields.join(",") : fields;

  try {
    do {
      const url = `${config.baseUrl}${endpoint}?per_page=${perPage}&page=${currentPage}&_fields=${fieldString}&orderby=${orderBy}&order=${orderDirection}`;

      console.log(`Fetching ${endpoint} page ${currentPage}...`);

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const items = await response.json();
      totalPages = parseInt(response.headers.get("X-WP-TotalPages")) || 1;

      console.log(
        `Page ${currentPage}/${totalPages} - Found ${items.length} items`
      );

      allItems = allItems.concat(items);
      currentPage++;
    } while (currentPage <= totalPages);

    console.log(`\nCompleted! Total items fetched: ${allItems.length}`);
    return allItems;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}

async function fetchAllData() {
  const fields = [
    "id",
    "parent_id",
    "status",
    "currency",
    "version",
    "prices_include_tax",
    "date_created",
    "date_created_gmt",
    "date_modified",
    "date_modified_gmt",
    "discount_total",
    "discount_tax",
    "shipping_total",
    "shipping_tax",
    "cart_tax",
    "total",
    "total_tax",
    "customer_id",
    "order_key",
    "billing",
    "shipping",
    "payment_method",
    "payment_method_title",
    "transaction_id",
    "customer_ip_address",
    "customer_user_agent",
    "created_via",
    "customer_note",
    "date_completed",
    "date_paid",
    "cart_hash",
    "number",
    "meta_data",
    "line_items",
    "tax_lines",
    "shipping_lines",
    "fee_lines",
    "coupon_lines",
    "refunds",
    "payment_url",
    "is_editable",
    "needs_payment",
    "needs_processing",
    "date_completed_gmt",
    "date_paid_gmt",
    "currency_symbol",
    "wpo_wcpdf_invoice_number",
  ];

  return await fetchAllPaginated("/orders", fields, "date", "asc");
}

function saveJSON(fileName, data) {
  try {
    // Always inside /data folder relative to this script
    const folderPath = path.join(__dirname, "..", "data");
    const filePath = path.join(folderPath, fileName);

    // Create folder if missing
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`✅ Saved ${fileName} in data folder.`);
  } catch (err) {
    console.error(`❌ Failed to save ${fileName}:`, err.message);
  }
}


// Usage
async function main() {
  const data = await fetchAllData();
  saveJSON("orders.json", data);
}

main().catch(console.error);
