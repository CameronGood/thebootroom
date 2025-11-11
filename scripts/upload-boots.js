// Script to upload boots from CSV file
// Usage: node scripts/upload-boots.js <path-to-csv-file>

const fs = require("fs");
const path = require("path");

// Read CSV file
const csvPath = process.argv[2];

if (!csvPath) {
  console.error(
    "❌ Please provide CSV file path: node scripts/upload-boots.js <path-to-csv>"
  );
  process.exit(1);
}

if (!fs.existsSync(csvPath)) {
  console.error(`❌ File not found: ${csvPath}`);
  process.exit(1);
}

const csvContent = fs.readFileSync(csvPath, "utf-8");

// You'll need to set your API endpoint URL
// For local development: http://localhost:3000/api/admin/import-boots
// For production: https://your-domain.com/api/admin/import-boots
const API_URL =
  process.env.API_URL || "http://localhost:3000/api/admin/import-boots";

// Note: This script requires authentication
// You'll need to either:
// 1. Use this from the browser console (copy the fetch code)
// 2. Add authentication headers if running from Node.js
// 3. Use the admin UI instead

console.log("📤 Uploading boots from CSV...");
console.log(`📁 File: ${csvPath}`);
console.log(`📊 Rows: ${csvContent.split("\n").length - 1}`);

// For browser console usage:
console.log(
  "\n=== Copy this to browser console (while logged in as admin) ===\n"
);
console.log(`
const csvContent = \`${csvContent.replace(/`/g, "\\`")}\`;

const formData = new FormData();
formData.append('csvText', csvContent);

fetch('${API_URL}', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => {
  console.log('✅ Imported:', data.imported, 'boots');
  if (data.errors && data.errors.length > 0) {
    console.error('❌ Errors:', data.errors);
  }
});
`);

console.log("\n=== Or use the admin UI at /admin ===");
