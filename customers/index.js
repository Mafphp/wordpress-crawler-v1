import fetch from "node-fetch";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config({ debug: false });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  baseUrl: process.env.WC_BASE_URL,
  username: process.env.WC_USERNAME,
  password: process.env.WC_PASSWORD,
};

function getAuthHeaders() {
  const { username, password } = config;
  return {
    "Content-Type": "application/json",
    "Authorization": "Basic " + Buffer.from(`${username}:${password}`).toString("base64")
  };
}

async function fetchAllPaginated(endpoint, fields, options = {}) {
  const {
    orderBy = "date",
    orderDirection = "asc",
    perPage = 100,
    additionalParams = {}
  } = options;

  let allItems = [];
  let currentPage = 1;
  let totalPages = 1;
  
  const fieldString = Array.isArray(fields) ? fields.join(",") : fields;
  const totalStart = performance.now(); // Track total fetch time

  try {
    do {
      // Build query parameters
      const params = new URLSearchParams({
        per_page: perPage,
        page: currentPage,
        _fields: fieldString,
        orderby: orderBy,
        order: orderDirection,
        ...additionalParams // Merge additional params
      });

      const url = `${config.baseUrl}${endpoint}?${params.toString()}`;
      
      console.log(`Fetching ${endpoint} page ${currentPage}...`);
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
      totalPages = parseInt(response.headers.get("X-WP-TotalPages")) || 1;

      console.log(`Page ${currentPage}/${totalPages} - Found ${items.length} items - Took ${(end - start).toFixed(2)} ms`);

      allItems = allItems.concat(items);
      currentPage++;
    } while (currentPage <= totalPages);

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
    throw error; // Don't swallow errors silently
  }
}

// Customer field definitions
const CUSTOMER_FIELDS = [
  "id", "date_created", "date_created_gmt", "date_modified", "date_modified_gmt",
  "email", "first_name", "last_name", "role", "username",
  "billing", "shipping", "is_paying_customer", "avatar_url"
];

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


// Fetch customers with optional role filter
async function fetchCustomers(role = null) {
  const options = {
    orderBy: "registered_date",
    orderDirection: "desc",
    additionalParams: role ? { role } : {}
  };

  return await fetchAllPaginated("/customers", CUSTOMER_FIELDS, options);
}

// Convenience functions
async function fetchAllCustomers() {
  return await fetchCustomers();
}

async function fetchAllSubscribers() {
  return await fetchCustomers("subscriber");
}

// Main execution
async function main() {
  try {
    const overallStart = performance.now();
    // Fetch in parallel if they're independent
    const [customers, subscribers] = await Promise.all([
      fetchAllCustomers(),
      fetchAllSubscribers()
    ]);

    // Save separately with timestamps
    const timestamp = Date.now();
    
    saveJSON(
      `customers-all-${timestamp}.json`,
      customers
    );
    
    saveJSON(
      `customers-subscribers-${timestamp}.json`,
      subscribers
    );

    console.log(`\nSaved ${customers.length} total customers`);
    console.log(`Saved ${subscribers.length} subscribers`);

    const overallEnd = performance.now();
    console.log(
      `\n⏱️ Full runtime (fetch + save): ${(
        (overallEnd - overallStart) /
        1000
      ).toFixed(2)} seconds.`
    );

  } catch (error) {
    console.error("Failed to fetch customers:", error);
    process.exit(1);
  }
}


main();
