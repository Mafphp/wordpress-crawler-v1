async function fetchAllTags() {
  const baseUrl = "http://localhost:80/wp-json/wc/v3/products/tags";
  const perPage = 100;
  let allTags = [];
  let currentPage = 1;
  let totalPages = 1;
  const fields = ["id", "name", "slug", "description", "count"].join(",");

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
      const tags = await response.json();

      // Get pagination info from headers
      const totalTags = response.headers.get("X-WP-Total");
      totalPages = parseInt(response.headers.get("X-WP-TotalPages")) || 1;

      console.log(
        `Page ${currentPage}/${totalPages} - Found ${tags.length} tags`
      );
      console.log(`Total tags: ${totalTags}`);

      // Add tags to our array
      allTags = allTags.concat(tags);

      // Move to next page
      currentPage++;
    } while (currentPage <= totalPages);

    console.log(`\nCompleted! Total tags fetched: ${allTags.length}`);

    // Return the complete array of tags
    return allTags;
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

// Usage example
fetchAllTags().then((tags) => {
  // console.log("All tags:", JSON.stringify(tags, null, 2));

  // You can also save to a file if running in Node.js
  const fs = require("fs");
  fs.writeFileSync("tags.json", JSON.stringify(tags, null, 2));
});
