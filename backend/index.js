const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { Parser } = require("node-sql-parser");

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

app.post("/query", (req, res) => {
  const { sql } = req.body;

  if (!sql) return res.status(400).json({ error: "Missing SQL query" });

  const parser = new Parser();

  try {
    const ast = parser.astify(sql); // parse SQL
    const tableName = ast.from[0].table;
    const tablePath = path.join(__dirname, "data", `${tableName}.json`);
    
    if (!fs.existsSync(tablePath)) {
      return res.status(404).json({ error: `Table ${tableName} not found` });
    }

    const data = JSON.parse(fs.readFileSync(tablePath, "utf-8"));
    
    let result = [];

    if (ast.columns[0]["expr"].column === "*") {
      result = data;
    } else {
      const selectedCols = ast.columns.map(col => col.expr.column);

      result = data.map(row => {
        let selected = {};
        selectedCols.forEach(col => {
          if (row.hasOwnProperty(col)) {
            selected[col] = row[col];
          }
        });
        return selected;
      });
    }

    res.json({ rows: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "SQL parsing or execution failed" });
  }
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
