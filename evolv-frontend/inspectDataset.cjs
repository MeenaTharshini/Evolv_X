
const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "public",
  "datasets",
  "language-learning-sample-database.json"
);

if (!fs.existsSync(filePath)) {
  console.error("Dataset not found:", filePath);
  console.log("Check the filename and the public/datasets folder.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

console.log("\nDATASET INSPECTION");
console.log("Top-level type:", Array.isArray(data) ? "Array" : typeof data);

if (Array.isArray(data)) {
  console.log("Total records:", data.length);
  console.log("First record:", JSON.stringify(data[0], null, 2));
} else {
  console.log("Top-level keys:", Object.keys(data));

  for (const [name, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      console.log(`\nTable/section: ${name}`);
      console.log("Rows:", value.length);

      if (value.length > 0) {
        console.log("Columns:", Object.keys(value[0]));
        console.log(
          "Sample:",
          JSON.stringify(value[0], null, 2).slice(0, 700)
        );
      }
    } else if (value && typeof value === "object") {
      console.log(`\nSection: ${name}`);
      console.log("Keys:", Object.keys(value).slice(0, 20));
    }
  }
}
