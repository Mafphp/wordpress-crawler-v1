import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function filterCoupons() {
  try {
    // Read the coupons.json file
    const filePath = path.join(__dirname, "..", "..", "data", "coupons.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const coupons = JSON.parse(fileContent);
    console.log(coupons.length);

    const filtered = coupons.filter(
      (x) =>
        !x.description.includes("practitioner") &&
        !x.description.includes("Practitioner")
    );

    console.log(filtered.length);
    const output = `coupons-filter-${Date.now()}.json`;
    await fs.writeFile(
      path.join(__dirname, "..", "..", "data", output),
      JSON.stringify(filtered, null, 2)
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the function
filterCoupons();
