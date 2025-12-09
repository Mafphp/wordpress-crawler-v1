import fetch from "node-fetch";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const baseUrl = process.env.WC_BASE_URL;
const username = process.env.WC_USERNAME;
const password = process.env.WC_PASSWORD;

async function fetchAllCoupons() {
  const perPage = 100;
  let allCoupons = [];
  let currentPage = 1;
  let totalPages = 1;
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
  ].join(",");
  const orderBy = "date";
  const orderDirection = "asc";

  try {
    do {
      const url = `${baseUrl}/coupons?per_page=${perPage}&page=${currentPage}&_fields=${fields}&orderby=${orderBy}&order=${orderDirection}`;
      console.log(`Fetching page ${currentPage}...`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from(`${username}:${password}`).toString("base64")
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const coupons = await response.json();
      totalPages = parseInt(response.headers.get("X-WP-TotalPages")) || 1;

      console.log(`Page ${currentPage}/${totalPages} - Found ${coupons.length} coupons`);

      allCoupons = allCoupons.concat(coupons);
      currentPage++;
    } while (currentPage <= totalPages);

    console.log(`\nCompleted! Total coupons fetched: ${allCoupons.length}`);

    return allCoupons.map((x) => ({
      ...x,
      email: extractEmail(x.description),
    }));
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
}

function extractEmail(text) {
  if (typeof text !== "string") return null;
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

// Usage
fetchAllCoupons().then((coupons) => {
  fs.writeFileSync("coupons.json", JSON.stringify(coupons, null, 2));
});
