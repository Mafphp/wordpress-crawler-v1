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

async function fetchAllCategories() {
  const fields = [
    "id",
    "name",
    "slug",
    "parent",
    "description",
    "display",
    "image",
    "menu_order",
    "count",
  ];

  return await fetchAllPaginated("/products/categories", fields, "name", "asc");
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
  const categories = await fetchAllCategories();
  saveJSON("categories.json", categories);
}

main().catch(console.error);
