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
  baseUrl: process.env.WC_BASE_URL?.replace(/\/$/, ''),
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
    "code",
    "amount",
    "status",
    "date_created",
    "date_created_gmt",
    "date_modified",
    "date_modified_gmt",
    "discount_type",
    "description",
    "date_expires",
    "date_expires_gmt",
    "usage_count",
    "individual_use",
    "product_ids",
    "excluded_product_ids",
    "usage_limit",
    "usage_limit_per_user",
    "limit_usage_to_x_items",
    "free_shipping",
    "product_categories",
    "excluded_product_categories",
    "exclude_sale_items",
    "minimum_amount",
    "maximum_amount",
    "email_restrictions",
    "used_by",
  ];

  return await fetchAllPaginated("/coupons", fields, "date", "asc");
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
  const coupons = await fetchAllData();
  saveJSON("coupons.json", coupons);

}

main().catch(console.error);
