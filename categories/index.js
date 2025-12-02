async function fetchAllCategories() {
  const baseUrl = "http://localhost:80/wp-json/wc/v3/products/categories";
  const perPage = 100;
  let allCategories = [];
  let currentPage = 1;
  let totalPages = 1;
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
  ].join(",");

  const orderBy = "name";
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
      const categories = await response.json();

      // Get pagination info from headers
      const totalCategories = response.headers.get("X-WP-Total");
      totalPages = parseInt(response.headers.get("X-WP-TotalPages")) || 1;

      console.log(
        `Page ${currentPage}/${totalPages} - Found ${categories.length} categories`
      );
      console.log(`Total categories: ${totalCategories}`);

      // Add categories to our array
      allCategories = allCategories.concat(categories);

      // Move to next page
      currentPage++;
    } while (currentPage <= totalPages);

    console.log(
      `\nCompleted! Total categories fetched: ${allCategories.length}`
    );

    // Return the complete array of categories
    return allCategories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Usage example
fetchAllCategories().then((categories) => {
  // console.log("All categories:", JSON.stringify(categories, null, 2));

  // You can also save to a file if running in Node.js
  const fs = require("fs");
  fs.writeFileSync("categories.json", JSON.stringify(categories, null, 2));
});
