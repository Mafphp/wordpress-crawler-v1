const fs = require("fs").promises;
const path = require("path");

async function filterCoupons() {
  try {
    // Read the coupons.json file
    const filePath = path.join(__dirname, "..", "..", "coupons.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const coupons = JSON.parse(fileContent);
    console.log(coupons.length);
    console.log(coupons.filter(c => c.product_categories.length > 0).length);

    // // Define the IDs you want to include
    // const idsToInclude = [
    //   13776, 13763, 14062, 15125, 15132, 15204, 16248, 17496, 17450, 17872,
    //   18309, 18456, 18821, 19076, 19451, 19861,
    // ];

    // // Filter coupons by IDs
    // const filteredCoupons = coupons.filter((order) =>
    //   idsToInclude.includes(order.id)
    // );

    // // Write to new file
    // const outputPath = path.join(__dirname, "filtered-coupons.json");
    // await fs.writeFile(
    //   outputPath,
    //   JSON.stringify(filteredCoupons, null, 2),
    //   "utf-8"
    // );
    // const keyValues = {};

    // coupons.forEach((obj) => {
    //   Object.entries(obj).forEach(([key, value]) => {
    //     if (!keyValues[key]) keyValues[key] = new Set();
    //     keyValues[key].add(value);
    //   });
    // });

    // // Convert sets to arrays
    // for (const key in keyValues) {
    //   keyValues[key] = Array.from(keyValues[key]);
    // }

    // console.log(keyValues);

    // console.log(
    //   `✅ Success! Filtered ${filteredCoupons.length} coupons from ${coupons.length} total coupons.`
    // );
    // console.log(`📁 Output saved to: ${outputPath}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the function
filterCoupons();
