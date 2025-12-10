import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function saveJSON(fileName, data) {
  try {
    // Always inside /data folder relative to this script
    const folderPath = path.join(__dirname, "..", "..", "data");
    const filePath = path.join(folderPath, fileName);

    // Create folder if missing
    await fs.mkdir(folderPath, { recursive: true });

    // Write file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`✅ Saved ${fileName} in data folder.`);
  } catch (err) {
    console.error(`❌ Failed to save ${fileName}:`, err.message);
  }
}

async function filterCoupons() {
  try {
    // Read the coupons.json file
    const filePath = path.join(__dirname, "..", "..", "data", "coupons.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const coupons = JSON.parse(fileContent);

    const filePath1 = path.join(
      __dirname,
      "..",
      "..",
      "data",
      "practitioners.json"
    );
    const fileContent1 = await fs.readFile(filePath1, "utf-8");
    const practitioners = JSON.parse(fileContent1);
    console.log(practitioners.length);

    const data = [];
    practitioners.forEach((practitioner) => {
      const coupon = coupons.find((coupon) =>
        coupon?.description
          ?.trim()
          .toLowerCase()
          .includes(practitioner.email.trim().toLowerCase())
      );
      if (coupon) {
        practitioner.code = coupon.code;
      }
      data.push(practitioner);
    });
    practitioners.sort((a, b) => b.code - a.code);

    console.log(practitioners.filter((x) => x.code).length);
    // console.log(filtered.length);
    saveJSON(`practitioners-with-coupons-${Date.now()}.json`, data);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the function
filterCoupons();
