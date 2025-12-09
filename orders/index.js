import fetch from "node-fetch";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pLimit from "p-limit"; // npm install p-limit

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  baseUrl: process.env.WC_BASE_URL?.replace(/\/$/, ""),
  username: process.env.WC_USERNAME,
  password: process.env.WC_PASSWORD,
};

function getAuthHeaders() {
  const { username, password } = config;
  return {
    "Content-Type": "application/json",
    Authorization:
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
  };
}

// Fetch single page with retry logic
async function fetchPage(
  endpoint,
  fields,
  page,
  orderBy,
  orderDirection,
  retries = 3
) {
  const perPage = 100;
  const fieldString = Array.isArray(fields) ? fields.join(",") : fields;
  const url = `${config.baseUrl}${endpoint}?per_page=${perPage}&page=${page}&_fields=${fieldString}&orderby=${orderBy}&order=${orderDirection}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const start = performance.now();
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const end = performance.now();

      if (!response.ok) {
        if (response.status === 429 && attempt < retries) {
          // Rate limited - wait and retry
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(
            `⚠️  Rate limited on page ${page}. Retrying in ${waitTime}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const items = await response.json();
      const totalPages = parseInt(response.headers.get("X-WP-TotalPages")) || 1;

      console.log(
        `✓ Page ${page}/${totalPages} - ${items.length} items - ${(
          end - start
        ).toFixed(0)}ms`
      );

      return { items, totalPages };
    } catch (error) {
      if (attempt === retries) {
        console.error(`❌ Failed page ${page} after ${retries} attempts:`, error.message);
        throw error;
      }
      console.log(`⚠️  Attempt ${attempt} failed for page ${page}, retrying...`);
    }
  }
}

// Parallel fetch with concurrency control
async function fetchAllPaginated(
  endpoint,
  fields,
  orderBy = "date",
  orderDirection = "asc",
  maxConcurrency = 8
) {
  const totalStart = performance.now();

  try {
    // Fetch first page to get total
    console.log(`📡 Fetching first page to determine total pages...\n`);
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

    console.log(
      `\n📊 Total pages: ${totalPages} | Concurrency: ${maxConcurrency}\n`
    );

    // Create page numbers (2 to totalPages)
    const pageNumbers = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2
    );

    // Limit concurrency
    const limit = pLimit(maxConcurrency);

    // Fetch all pages in parallel
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
    const totalTime = ((totalEnd - totalStart) / 1000).toFixed(2);
    const itemsPerSecond = (allItems.length / (totalTime)).toFixed(0);

    console.log(`\n${"=".repeat(60)}`);
    console.log(`✅ FETCH COMPLETE`);
    console.log(`   Total items: ${allItems.length}`);
    console.log(`   Total time: ${totalTime}s`);
    console.log(`   Speed: ${itemsPerSecond} items/sec`);
    console.log(`${"=".repeat(60)}\n`);

    return allItems;
  } catch (error) {
    console.error(`\n❌ Fatal error fetching ${endpoint}:`, error.message);
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

  // Adjust concurrency based on your API limits
  // WooCommerce default: 25 requests/10sec = ~2.5 req/sec
  // Safe: 5-8 concurrent | Aggressive: 10-15
  return await fetchAllPaginated("/orders", fields, "date", "asc", 8);
}

function saveJSON(fileName, data) {
  try {
    const folderPath = path.join(__dirname, "..", "data");
    const filePath = path.join(folderPath, fileName);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const start = performance.now();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    const end = performance.now();

    const sizeInMB = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2);
    console.log(
      `💾 Saved ${fileName} (${sizeInMB} MB) in ${(end - start).toFixed(0)}ms`
    );
  } catch (err) {
    console.error(`❌ Failed to save ${fileName}:`, err.message);
  }
}

async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 WooCommerce Orders Sync Started`);
  console.log(`${"=".repeat(60)}\n`);

  const overallStart = performance.now();

  const data = await fetchAllData();
  
  if (data.length > 0) {
    saveJSON("orders.json", data);
  } else {
    console.log(`⚠️  No data to save.`);
  }

  const overallEnd = performance.now();
  const totalRuntime = ((overallEnd - overallStart) / 1000).toFixed(2);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`⏱️  TOTAL RUNTIME: ${totalRuntime} seconds`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch((error) => {
  console.error("\n💥 FATAL ERROR:", error);
  process.exit(1);
});
