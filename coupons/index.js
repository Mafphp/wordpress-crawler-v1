async function fetchAllCoupons() {
  const baseUrl = "http://localhost:80/wp-json/wc/v3/coupons";
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
      // Construct the URL with pagination parameters
      const url = `${baseUrl}?per_page=${perPage}&page=${currentPage}&_fields=${fields}&orderby=${orderBy}&order=${orderDirection}`;

      console.log(`Fetching page ${currentPage}...`);

      // Make the API request
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add your authentication headers here if needed
          // 'Authorization': 'Basic ' + btoa('username:password')
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the response data
      const coupons = await response.json();

      // Get pagination info from headers
      const totalCoupons = response.headers.get("X-WP-Total");
      totalPages = parseInt(response.headers.get("X-WP-TotalPages")) || 1;

      console.log(
        `Page ${currentPage}/${totalPages} - Found ${coupons.length} coupons`
      );
      console.log(`Total coupons: ${totalCoupons}`);

      // Add coupons to our array
      allCoupons = allCoupons.concat(coupons);

      // Move to next page
      currentPage++;
    } while (currentPage <= totalPages);

    console.log(`\nCompleted! Total coupons fetched: ${allCoupons.length}`);

    // Return the complete array of coupons
    return allCoupons;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
}

// Usage example
fetchAllCoupons().then((coupons) => {
  // console.log("All coupons:", JSON.stringify(coupons, null, 2));

  // You can also save to a file if running in Node.js
  const fs = require("fs");
  fs.writeFileSync("coupons.json", JSON.stringify(coupons, null, 2));
});
