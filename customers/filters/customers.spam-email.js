const fs = require("fs").promises;
const path = require("path");

// Regex for spam email pattern
const spamPattern = /^[0-9a-fA-F]{10,32}iggymaria03\+[0-9a-fA-F]+@gmail\.com$/;

async function filterSpamEmails() {
  try {
    const filePath = path.join(__dirname, "..", "..", "customers.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const customers = JSON.parse(raw);

    // Filter objects that match the spam email pattern
    const filtered = customers.filter(
      (c) => typeof c.email === "string" && spamPattern.test(c.email)
    );

    const output = `spam-iggymaria03-${Date.now()}.json`;

    await fs.writeFile(
      path.join(__dirname, "..", "..", output),
      JSON.stringify(filtered, null, 2)
    );

    console.log(`✅ Found ${filtered.length} spam customers`);
    console.log(`📁 Saved to: ${output}`);
  } catch (err) {
    console.error("❌ ERROR:", err.message);
  }
}

filterSpamEmails();
