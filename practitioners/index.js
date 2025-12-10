import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function readExcelFileNode(filePath) {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);

    // Get the first worksheet name
    const firstSheetName = workbook.SheetNames[0];

    // Get the worksheet
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert worksheet to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    // Transform the data to the required format
    const transformedData = rawData.map((item) => {
      console.log(item);
      const code = item.Code ? item.Code?.toLowerCase() : "";
      const phoneNumber = item?.PhoneNumber
        ? String(item?.PhoneNumber).toLowerCase()
        : "";
      const email = item.EmailAddress ? item?.EmailAddress?.trim() : "";
      const fullName = item.FullName ? item.FullName?.trim() : "";

      return {
        code: code,
        email: email,
        phoneNumber: phoneNumber,
        fullName: fullName,
        description: `practitioner - ${email}`,
      };
    });

    console.log(
      `Successfully read ${transformedData.length} rows from Excel file`
    );
    return transformedData;
  } catch (error) {
    console.error("Error reading Excel file:", error);
    return [];
  }
}

function saveJSON(fileName, data) {
  try {
    // Always inside /data folder relative to this script
    const folderPath = path.join(__dirname, "..", "data");
    const filePath = path.join(folderPath, fileName);

    // Create folder if missing
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`✅ Saved ${fileName} in data folder.`);
  } catch (err) {
    console.error(`❌ Failed to save ${fileName}:`, err.message);
  }
}

// async function processPractitioners(practitioners) {
//   return new Promise((resolve) => {
//     practitioners.forEach((practitioner, index) => {
//       console.log(`\nPractitioner ${index + 1}:`);
//       Object.keys(practitioner).forEach((key) => {
//         console.log(`  ${key}: ${practitioner[key]}`);
//       });
//     });
//     resolve();
//   });
// }

// Main async function using IIFE (Immediately Invoked Function Expression)
(async () => {
  try {
    console.log("Starting to process practitioners.xlsx...");

    // Read Excel file and transform data
    const practitioners = await readExcelFileNode(
      path.join(__dirname, "practitioners.xlsx")
    );

    if (practitioners.length === 0) {
      console.log("No data found or error occurred");
      return;
    }

    console.log("Practitioners data:");
    // console.log(JSON.stringify(practitioners, null, 2));

    // Save to JSON file
    saveJSON("practitioners.json", practitioners);

    // Process each practitioner
    // await processPractitioners(practitioners);

    console.log("\n✅ Processing completed successfully!");
  } catch (error) {
    console.error("❌ Error in main process:", error);
  }
})();
