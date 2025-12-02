const fs = require("fs").promises;
const path = require("path");

async function filterOrders() {
  try {
    // Read the orders.json file
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "customers-1764665303939.json"
    );
    const fileContent = await fs.readFile(filePath, "utf-8");
    const customers = JSON.parse(fileContent);

    const filePath2 = path.join(__dirname, "..", "..", "orders.json");
    const fileContent2 = await fs.readFile(filePath2, "utf-8");
    const orders = JSON.parse(fileContent2);

    console.log(`customer count ${customers.length}`);
    console.log(
      `is_paying_customer = true`,
      customers.filter((x) => x.is_paying_customer === true).length
    );
    console.log(
      `is_paying_customer = false`,
      customers.filter((x) => x.is_paying_customer === false).length
    );
    const smsPattern = /@(txt|sms|vtext|tmomail|mycingular|text)\.att\.net$/i;

    const gmailAliasPattern = /^[^@]+?\+[a-zA-Z0-9]+@gmail\.com$/;

    const hexNameHexPattern =
      /^[0-9a-fA-F]{8,32}[A-Za-z]{2,32}[0-9a-fA-F]{8,32}@gmail\.com$/;
    console.log(
      `✔ first_name | ✔ last_name`,
      customers.filter((x) => x.first_name && x.last_name).length
    );
    console.log(
      `✔ first_name | ✗ last_name`,
      customers.filter((x) => x.first_name && !x.last_name).length
    );
    console.log(
      `✗ first_name | ✔ last_name`,
      customers.filter((x) => !x.first_name && x.last_name).length
    );
    console.log(
      `✗ first_name | ✗ last_name`,
      customers.filter((x) => !x.first_name && !x.last_name).length
    );

    console.log(
      `✔ billing.first_name | ✔ billing.last_name`,
      customers.filter((x) => x.billing.first_name && x.billing.last_name)
        .length
    );
    console.log(
      `✔ billing.first_name | ✗ billing.last_name`,
      customers.filter((x) => x.billing.first_name && !x.billing.last_name)
        .length
    );
    console.log(
      `✗ billing.first_name | ✔ billing.last_name`,
      customers.filter((x) => !x.billing.first_name && x.billing.last_name)
        .length
    );
    console.log(
      `✗ billing.first_name | ✗ billing.last_name`,
      customers.filter((x) => !x.billing.first_name && !x.billing.last_name)
        .length
    );

    console.log(
      `✔ billing.first_name && ✔ billing.last_name  && ✔ first_name && ✔ last_name`,
      customers.filter(
        (x) =>
          x.billing.first_name &&
          x.billing.last_name &&
          x.first_name &&
          x.last_name
      ).length
    );

    console.log(
      `✔ billing.first_name || ✔ billing.last_name  || ✔ first_name || ✔ last_name`,
      customers.filter(
        (x) =>
          x.billing.first_name ||
          x.billing.last_name ||
          x.billing.email ||
          x.shipping.first_name ||
          x.shipping.last_name ||
          x.shipping.email ||
          x.first_name ||
          x.last_name
      ).length
    );

    const tmp = customers.map((c) => ({
      id: c.id,
      first_name: c.first_name,
      last_name: c.last_name,
    }));

    // check customers / orders
    // information of users exist in orders
    const customers_exist_in_orders = customers.filter((x) =>
      orders.find((o) => o.customer_id === x.id)
    ).length;
    console.log(`✔ customers exist in orders`, customers_exist_in_orders);

    const customers_not_exist_in_orders = customers.filter(
      (x) =>
        x.billing.first_name &&
        x.billing.last_name &&
        x.first_name &&
        x.last_name &&
        !orders.find((o) => o.customer_id === x.id)
    );
    console.log(
      `✔ customers exist in orders`,
      customers_not_exist_in_orders.length
    );

    const filtered = customers.filter((c) => {
      const email = c.email || "";

      const isSpam =
        smsPattern.test(email) ||
        gmailAliasPattern.test(email) ||
        hexNameHexPattern.test(email);

      return !isSpam;
      // return c.is_paying_customer === true && !isSpam;
    });
    console.log(`filtered`, filtered.length);
    const output = `customers-filter-${Date.now()}.json`;
    await fs.writeFile(
      path.join(__dirname, "..", "..", output),
      JSON.stringify(tmp, null, 2)
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the function
filterOrders();
