async function fetchAllProducts() {
  const baseUrl = "http://localhost:80/wp-json/wc/v3/products";
  const perPage = 100;
  let allProducts = [];
  let currentPage = 1;
  let totalPages = 1;
  const fields = [
    "id",
    "name",
    "slug",
    "permalink",
    "date_created",
    "date_created_gmt",
    "date_modified",
    "date_modified_gmt",
    "type",
    "status",
    "featured",
    "catalog_visibility",
    "description",
    "short_description",
    "sku",
    "price",
    "regular_price",
    "sale_price",
    "on_sale",
    "purchasable",
    "total_sales",
    "virtual",
    "downloadable",
    "downloads",
    "download_limit",
    "download_expiry",
    "external_url",
    "button_text",
    "tax_status",
    "tax_class",
    "manage_stock",
    "stock_quantity",
    "backorders",
    "backorders_allowed",
    "backordered",
    "low_stock_amount",
    "sold_individually",
    "weight",
    "dimensions",
    "shipping_required",
    "shipping_taxable",
    "shipping_class",
    "shipping_class_id",
    "reviews_allowed",
    "average_rating",
    "rating_count",
    "upsell_ids",
    "cross_sell_ids",
    "parent_id",
    "purchase_note",
    "categories",
    "brands",
    "tags",
    "images",
    "attributes",
    "default_attributes",
    "variations",
    "grouped_products",
    "menu_order",
    "price_html",
    "related_ids",
    "meta_data",
    "stock_status",
    "has_options",
    "post_password",
    "global_unique_id",
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
      const products = await response.json();

      // Get pagination info from headers
      const totalProducts = response.headers.get("X-WP-Total");
      totalPages = parseInt(response.headers.get("X-WP-TotalPages")) || 1;

      console.log(
        `Page ${currentPage}/${totalPages} - Found ${products.length} products`
      );
      console.log(`Total products: ${totalProducts}`);

      // Add products to our array
      allProducts = allProducts.concat(products);

      // Move to next page
      currentPage++;
    } while (currentPage <= totalPages);

    console.log(`\nCompleted! Total products fetched: ${allProducts.length}`);

    // Return the complete array of products
    return allProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Usage example
fetchAllProducts().then((products) => {
  // console.log("All products:", JSON.stringify(products, null, 2));

  // You can also save to a file if running in Node.js
  const fs = require("fs");
  fs.writeFileSync("products.json", JSON.stringify(products, null, 2));
});
