const fs = require("fs");
const path = require("path");

function loadTables(tables) {
  const tableData = {};
  for (const t of tables) {
    const tablePath = path.join(__dirname, "..", "data", `${t.name}.json`);
    if (!fs.existsSync(tablePath)) {
      throw new Error(`Table ${t.name} not found`);
    }
    tableData[t.alias] = JSON.parse(fs.readFileSync(tablePath, "utf-8"));
  }
  return tableData;
}

module.exports = { loadTables };