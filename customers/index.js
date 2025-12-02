async function fetchAllCustomers() {
  const baseUrl = "http://localhost:80/wp-json/wc/v3/customers";
  const perPage = 100;
  let allCustomers = [];
  let currentPage = 1;
  let totalPages = 1;
  const fields = [
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
  ].join(",");
  const orderBy = "registered_date";
  const orderDirection = "desc";
  try {
    do {
      // Construct the URL with pagination parameters
      const url = `${baseUrl}?per_page=${perPage}&page=${currentPage}&_fields=${fields}&orderby=${orderBy}&order=${orderDirection}`;
      // const url = `${baseUrl}?per_page=${perPage}&page=${currentPage}&_fields=${fields}&orderby=${orderBy}&order=${orderDirection}&role=subscriber`;

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
      const customers = await response.json();

      // Get pagination info from headers
      const totalCustomers = response.headers.get("X-WP-Total");
      totalPages = parseInt(response.headers.get("X-WP-TotalPages")) || 1;

      console.log(
        `Page ${currentPage}/${totalPages} - Found ${customers.length} customers`
      );
      console.log(`Total customers: ${totalCustomers}`);

      // Add customers to our array
      allCustomers = allCustomers.concat(customers);

      // Move to next page
      currentPage++;
    } while (currentPage <= totalPages);

    console.log(`\nCompleted! Total customers fetched: ${allCustomers.length}`);

    // Return the complete array of customers
    return allCustomers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

async function fetchAllSubscribers() {
  const baseUrl = "http://localhost:80/wp-json/wc/v3/customers";
  const perPage = 100;
  let allCustomers = [];
  let currentPage = 1;
  let totalPages = 1;
  const fields = [
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
  ].join(",");
  const orderBy = "registered_date";
  const orderDirection = "desc";
  try {
    do {
      // Construct the URL with pagination parameters
      // const url = `${baseUrl}?per_page=${perPage}&page=${currentPage}&_fields=${fields}&orderby=${orderBy}&order=${orderDirection}`;
      const url = `${baseUrl}?per_page=${perPage}&page=${currentPage}&_fields=${fields}&orderby=${orderBy}&order=${orderDirection}&role=subscriber`;

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
      const customers = await response.json();

      // Get pagination info from headers
      const totalCustomers = response.headers.get("X-WP-Total");
      totalPages = parseInt(response.headers.get("X-WP-TotalPages")) || 1;

      console.log(
        `Page ${currentPage}/${totalPages} - Found ${customers.length} customers`
      );
      console.log(`Total customers: ${totalCustomers}`);

      // Add customers to our array
      allCustomers = allCustomers.concat(customers);

      // Move to next page
      currentPage++;
    } while (currentPage <= totalPages);

    console.log(`\nCompleted! Total customers fetched: ${allCustomers.length}`);

    // Return the complete array of customers
    return allCustomers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

// Usage example
fetchAllCustomers().then((customers) => {
  fetchAllSubscribers().then((subscribers) => {
    // console.log("All customers:", JSON.stringify(customers, null, 2));

    // You can also save to a file if running in Node.js
    const fs = require("fs");
    fs.writeFileSync(
      `customers-${Date.now()}.json`,
      JSON.stringify([...customers, ...subscribers], null, 2)
    );
  });
});
