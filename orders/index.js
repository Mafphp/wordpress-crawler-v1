async function fetchAllOrders() {
  const baseUrl = "http://localhost:80/wp-json/wc/v3/orders";
  const perPage = 100;
  let allOrders = [];
  let currentPage = 1;
  let totalPages = 1;
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
      const orders = await response.json();

      // Get pagination info from headers
      const totalOrders = response.headers.get("X-WP-Total");
      totalPages = parseInt(response.headers.get("X-WP-TotalPages")) || 1;

      console.log(
        `Page ${currentPage}/${totalPages} - Found ${orders.length} orders`
      );
      console.log(`Total orders: ${totalOrders}`);

      // Add orders to our array
      allOrders = allOrders.concat(orders);

      // Move to next page
      currentPage++;
    } while (currentPage <= totalPages);

    console.log(`\nCompleted! Total orders fetched: ${allOrders.length}`);

    // Return the complete array of orders
    return allOrders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

// Usage example
fetchAllOrders().then((orders) => {
  // console.log("All orders:", JSON.stringify(orders, null, 2));

  // You can also save to a file if running in Node.js
  const fs = require("fs");
  fs.writeFileSync("orders.json", JSON.stringify(orders, null, 2));
});
