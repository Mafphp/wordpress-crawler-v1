import fetch from "node-fetch";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pLimit from "p-limit"; // npm install p-limit

dotenv.config();
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
    Authorization:
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
  };
}

async function fetchAllPaginated(endpoint, fields, options = {}) {
  const {
    orderBy = "date",
    orderDirection = "asc",
    perPage = 100,
    additionalParams = {},
    maxConcurrency = 8,
  } = options;

  const fieldString = Array.isArray(fields) ? fields.join(",") : fields;
  const totalStart = performance.now();

  try {
    // Fetch page 1 to get total pages
    const params = new URLSearchParams({
      per_page: perPage,
      page: 1,
      _fields: fieldString,
      orderby: orderBy,
      order: orderDirection,
      ...additionalParams,
    });

    const url = `${config.baseUrl}${endpoint}?${params.toString()}`;
    console.log(`Fetching ${endpoint} page 1...`);
    
    const start = performance.now();
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const end = performance.now();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const firstPageItems = await response.json();
    const totalPages = parseInt(response.headers.get("X-WP-TotalPages")) || 1;

    console.log(
      `Page 1/${totalPages} - Found ${firstPageItems.length} items - Took ${(
        end - start
      ).toFixed(2)} ms`
    );

    // If only one page, return immediately
    if (totalPages === 1) {
      const totalEnd = performance.now();
      console.log(
        `\n✅ Completed! Total items fetched: ${firstPageItems.length} — Total time: ${(
          (totalEnd - totalStart) / 1000
        ).toFixed(2)} seconds`
      );
      return firstPageItems;
    }

    // Fetch remaining pages in parallel
    const limit = pLimit(maxConcurrency);
    const pageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);

    const pagePromises = pageNumbers.map((page) =>
      limit(async () => {
        const pageParams = new URLSearchParams({
          per_page: perPage,
          page: page,
          _fields: fieldString,
          orderby: orderBy,
          order: orderDirection,
          ...additionalParams,
        });

        const pageUrl = `${config.baseUrl}${endpoint}?${pageParams.toString()}`;
        const pageStart = performance.now();

        const pageResponse = await fetch(pageUrl, {
          method: "GET",
          headers: getAuthHeaders(),
        });
        const pageEnd = performance.now();

        if (!pageResponse.ok) {
          throw new Error(`HTTP error! status: ${pageResponse.status}`);
        }

        const items = await pageResponse.json();
        console.log(
          `Page ${page}/${totalPages} - Found ${items.length} items - Took ${(
            pageEnd - pageStart
          ).toFixed(2)} ms`
        );

        return items;
      })
    );

    const remainingPages = await Promise.all(pagePromises);
    const allItems = [firstPageItems, ...remainingPages].flat();

    const totalEnd = performance.now();
    console.log(
      `\n✅ Completed! Total items fetched: ${allItems.length} — Total time: ${(
        (totalEnd - totalStart) / 1000
      ).toFixed(2)} seconds`
    );

    return allItems;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

const CUSTOMER_FIELDS = [
  "id",
  "date_created",
  "date_created_gmt",
  "date_modified",
  "date_modified_gmt",
  "email",
  "first_name",
  "last_name",
  "role",
  "username",
  "billing",
  "shipping",
  "is_paying_customer",
  "avatar_url",
];

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

async function fetchCustomers(role = null) {
  const options = {
    orderBy: "registered_date",
    orderDirection: "desc",
    additionalParams: role ? { role } : {},
  };

  return await fetchAllPaginated("/customers", CUSTOMER_FIELDS, options);
}

async function fetchAllCustomers() {
  return await fetchCustomers();
}

async function fetchAllSubscribers() {
  return await fetchCustomers("subscriber");
}

async function main() {
  try {
    const overallStart = performance.now();

    const [customers, subscribers] = await Promise.all([
      fetchAllCustomers(),
      fetchAllSubscribers(),
    ]);

    const timestamp = Date.now();

    saveJSON(`customers.json`, [...customers, ...subscribers]);

    console.log(`\nSaved ${customers.length} total customers`);
    console.log(`Saved ${subscribers.length} subscribers`);

    const overallEnd = performance.now();
    console.log(
      `\n⏱️ Full runtime (fetch + save): ${(
        (overallEnd - overallStart) / 1000
      ).toFixed(2)} seconds.`
    );
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    process.exit(1);
  }
}

main();
