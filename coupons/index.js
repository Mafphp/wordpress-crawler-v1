import fetch from "node-fetch";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pLimit from "p-limit"; // Install: npm install p-limit

dotenv.config({ debug: false });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  baseUrl: process.env.WC_BASE_URL?.replace(/\/$/, ""),
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

// Fetch a single page
async function fetchPage(endpoint, fields, page, orderBy, orderDirection) {
  const perPage = 100;
  const fieldString = Array.isArray(fields) ? fields.join(",") : fields;
  const url = `${config.baseUrl}${endpoint}?per_page=${perPage}&page=${page}&_fields=${fieldString}&orderby=${orderBy}&order=${orderDirection}`;

  const start = performance.now();
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const end = performance.now();

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const items = await response.json();
  const totalPages = parseInt(response.headers.get("X-WP-TotalPages")) || 1;

  console.log(
    `Page ${page}/${totalPages} - Found ${items.length} items - Took ${(
      end - start
    ).toFixed(2)} ms`
  );

  return { items, totalPages };
}

// Parallel fetch with concurrency limit
async function fetchAllPaginated(
  endpoint,
  fields,
  orderBy = "date",
  orderDirection = "asc",
  maxConcurrency = 5 // Adjust based on API rate limits
) {
  const totalStart = performance.now();

  try {
    // First, fetch page 1 to get total pages
    console.log(`Fetching first page to determine total pages...`);
    const { items: firstPageItems, totalPages } = await fetchPage(
      endpoint,
      fields,
      1,
      orderBy,
      orderDirection
    );

    if (totalPages === 1) {
      console.log(`\n✅ Only 1 page found.`);
      return firstPageItems;
    }

    console.log(`\nTotal pages: ${totalPages}. Fetching remaining pages in parallel...\n`);

    // Create page numbers array (2 to totalPages)
    const pageNumbers = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2
    );

    // Set concurrency limit
    const limit = pLimit(maxConcurrency);

    // Fetch all remaining pages in parallel with concurrency control
    const pagePromises = pageNumbers.map((page) =>
      limit(() => fetchPage(endpoint, fields, page, orderBy, orderDirection))
    );

    const results = await Promise.all(pagePromises);

    // Combine all items
    const allItems = [
      ...firstPageItems,
      ...results.flatMap((result) => result.items),
    ];

    const totalEnd = performance.now();
    console.log(
      `\n✅ Completed! Total items fetched: ${allItems.length} — Total time: ${(
        (totalEnd - totalStart) /
        1000
      ).toFixed(2)} seconds`
    );

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

  return await fetchAllPaginated("/coupons", fields, "date", "asc", 10); // 10 concurrent requests
}

function saveJSON(fileName, data) {
  try {
    const folderPath = path.join(__dirname, "..", "data");
    const filePath = path.join(folderPath, fileName);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`✅ Saved ${fileName} in data folder.`);
  } catch (err) {
    console.error(`❌ Failed to save ${fileName}:`, err.message);
  }
}

async function main() {
  const overallStart = performance.now();

  const coupons = await fetchAllData();
  saveJSON("coupons.json", coupons);

  const overallEnd = performance.now();
  console.log(
    `\n⏱️ Full runtime (fetch + save): ${(
      (overallEnd - overallStart) /
      1000
    ).toFixed(2)} seconds.`
  );
}

main().catch(console.error);
