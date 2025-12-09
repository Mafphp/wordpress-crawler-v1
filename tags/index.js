import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ debug: false });

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
  const totalStart = performance.now(); // Track total fetch time

  try {
    do {
      const url = `${config.baseUrl}${endpoint}?per_page=${perPage}&page=${currentPage}&_fields=${fieldString}&orderby=${orderBy}&order=${orderDirection}`;

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

      console.log(
        `Page ${currentPage}/${totalPages} - Found ${
          items.length
        } items - Took ${(end - start).toFixed(2)} ms`
      );

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
    return [];
  }
}

async function fetchAllData() {
  const fields = ["id", "name", "slug", "description", "count"];

  return await fetchAllPaginated("/products/tags", fields, "name", "asc");
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
  const overallStart = performance.now();

  const data = await fetchAllData();
  saveJSON("tags.json", data);

  const overallEnd = performance.now();
  console.log(
    `\n⏱️ Full runtime (fetch + save): ${(
      (overallEnd - overallStart) /
      1000
    ).toFixed(2)} seconds.`
  );
}

main().catch(console.error);
