const fs = require("fs").promises;
const path = require("path");

async function filterData() {
  try {
    // Read the coupons.json file
    const filePath = path.join(__dirname, "..", "..", "coupons.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const coupons = JSON.parse(fileContent);
    console.log(coupons.length);

    const filePath1 = path.join(__dirname, "..", "..", "practitioners.json");
    const fileContent1 = await fs.readFile(filePath1, "utf-8");
    const practitioners = JSON.parse(fileContent1);
    console.log(practitioners.length);

    /* ---------------------------------- Code ---------------------------------- */
    const normalize = (v) => (v ? v.trim().toLowerCase() : "");

    // Map to store unique coupons
    const combinedMap = new Map();

    // Helper to track added objects (avoid duplicates)
    const addedObjects = new Set();

    // 1️⃣ Add coupons to map under both code and email
    coupons.forEach((coupon) => {
      const keyCode = normalize(coupon.code);
      const keyEmail = normalize(coupon.email);

      const couponObj = {
        ...coupon,
        practitioners: [],
        is_new: false,
      };

      if (keyCode && !addedObjects.has(keyCode)) {
        combinedMap.set(keyCode, couponObj);
        addedObjects.add(keyCode);
      }
      if (keyEmail && !addedObjects.has(keyEmail)) {
        combinedMap.set(keyEmail, couponObj);
        addedObjects.add(keyEmail);
      }
    });

    // 2️⃣ Attach practitioners to coupons
    practitioners.forEach((p) => {
      const keyCode = normalize(p.code);
      const keyEmail = normalize(p.email);

      // Try match by code first
      let target = keyCode && combinedMap.get(keyCode);

      // If not found, try by email
      if (!target) target = keyEmail && combinedMap.get(keyEmail);

      if (target) {
        // attach practitioner if not already attached
        if (!target.practitioners.includes(p)) {
          target.practitioners.push(p);
        }
        target.is_new = false; // ensure is_new is false
      } else {
        // not found in any coupon → create new
        const newKey = keyCode || keyEmail;
        if (!newKey) return;

        const newObj = {
          code: p.code || null,
          email: p.email || null,
          practitioners: [p],
          is_new: true,
        };
        combinedMap.set(newKey, newObj);
      }
    });

    // 3️⃣ Convert map to array and remove duplicates
    const seen = new Set();
    const result = [];
    for (const obj of combinedMap.values()) {
      if (!seen.has(obj)) {
        result.push(obj);
        seen.add(obj);
      }
    }


    const outputPath = path.join(
      __dirname,
      "coupons-practitioners-filtered-data.json"
    );
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2), "utf-8");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the function
filterData();
