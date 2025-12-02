// First install: npm install xlsx
const XLSX = require("xlsx");
const fs = require("fs").promises; // Use promises version of fs

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
    const transformedData = rawData.map(item => {
      const code = item.Code ? item.Code.toLowerCase() : '';
      const email = item.Email ? item.Email.trim() : '';
      
      return {
        code: code,
        email: email,
        description: `practitioner - ${email}`
      };
    });

    console.log(`Successfully read ${transformedData.length} rows from Excel file`);
    return transformedData;
  } catch (error) {
    console.error("Error reading Excel file:", error);
    return [];
  }
}

async function saveToJsonFile(data, filename) {
  try {
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${filename}`);
  } catch (error) {
    console.error("Error saving file:", error);
  }
}

async function processPractitioners(practitioners) {
  return new Promise((resolve) => {
    practitioners.forEach((practitioner, index) => {
      console.log(`\nPractitioner ${index + 1}:`);
      Object.keys(practitioner).forEach((key) => {
        console.log(`  ${key}: ${practitioner[key]}`);
      });
    });
    resolve();
  });
}

// Main async function using IIFE (Immediately Invoked Function Expression)
(async () => {
  try {
    console.log("Starting to process practitioners.xlsx...");

    // Read Excel file and transform data
    const practitioners = await readExcelFileNode("./practitioners.xlsx");

    if (practitioners.length === 0) {
      console.log("No data found or error occurred");
      return;
    }

    console.log("Practitioners data:");
    console.log(JSON.stringify(practitioners, null, 2));

    // Save to JSON file
    await saveToJsonFile(practitioners, "practitioners.json");

    // Process each practitioner
    await processPractitioners(practitioners);

    console.log("\n✅ Processing completed successfully!");
  } catch (error) {
    console.error("❌ Error in main process:", error);
  }
})();
