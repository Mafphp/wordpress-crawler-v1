const fs = require("fs").promises;
const path = require("path");

async function filterData() {
  try {
    // Read the data.json file
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "coupons-practitioners-filtered-data.json"
    );
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    console.log(data.length);
    const mapData = data.map((x) => ({
      email: x.email,
      code: x.code,
      practitioners: x.practitioners,
    }));

    console.log(mapData);
    // // Define the IDs you want to include
    // const idsToInclude = [
    //   13776, 13763, 14062, 15125, 15132, 15204, 16248, 17496, 17450, 17872,
    //   18309, 18456, 18821, 19076, 19451, 19861,
    // ];

    // // Filter data by IDs
    // const filteredData = data.filter((order) =>
    //   idsToInclude.includes(order.id)
    // );

    // // Write to new file
    // const outputPath = path.join(__dirname, "coupons-practitioners-filtered-data.json");
    // await fs.writeFile(
    //   outputPath,
    //   JSON.stringify(mapData, null, 2),
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
    //   `✅ Success! Filtered ${filteredData.length} data from ${data.length} total data.`
    // );
    // console.log(`📁 Output saved to: ${outputPath}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the function
filterData();
