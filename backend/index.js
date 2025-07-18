const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { Parser } = require("node-sql-parser");
const e = require("express");

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

app.post("/query", (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: "Missing SQL query" });

  const parser = new Parser();

  try {
    const ast = parser.astify(sql)[0]; // handles multi-statement
    
    const tables = ast.from.map(entry => ({
      name: entry.table,
      alias: entry.as || entry.table
    }));

    // Load data from all referenced tables
    const tableData = {};
    for (const t of tables) {
      const tablePath = path.join(__dirname, "data", `${t.name}.json`);
      if (!fs.existsSync(tablePath)) {
        return res.status(404).json({ error: `Table ${t.name} not found` });
      }
      tableData[t.alias] = JSON.parse(fs.readFileSync(tablePath, "utf-8"));
    }

    let resultData = [];

    // ✅ JOIN handling (INNER, LEFT, RIGHT)
    if (ast.from.length === 2 && ast.from[1].join && ast.from[1].on) {
      const left = ast.from[0];
      const right = ast.from[1];

      let leftAlias = left.as || left.table;
      let rightAlias = right.as || right.table;

      let leftData = tableData[leftAlias];
      let rightData = tableData[rightAlias];

      let leftField = right.on.left.column;
      let rightField = right.on.right.column;

      let joinType = right.join.toUpperCase(); // INNER JOIN, LEFT JOIN, RIGHT JOIN

      resultData = [];

      // 🔁 Flip logic if RIGHT JOIN
      if (joinType === "RIGHT JOIN") {
        [leftAlias, rightAlias] = [rightAlias, leftAlias];
        [leftData, rightData] = [rightData, leftData];
        [leftField, rightField] = [rightField, leftField];
        joinType = "LEFT JOIN"; // simulate as flipped LEFT JOIN
      }

      for (const lRow of leftData) {
        let matchFound = false;

        for (const rRow of rightData) {
          if (lRow[leftField] === rRow[rightField]) {
            matchFound = true;
            resultData.push({
              [leftAlias]: lRow,
              [rightAlias]: rRow
            });
          }
        }

        if (!matchFound && joinType === "LEFT JOIN") {
          resultData.push({
            [leftAlias]: lRow,
            [rightAlias]: null
          });
        }
      }

    } else {
      // 🟢 Single-table queries
      const mainAlias = tables[0].alias;
      resultData = tableData[mainAlias];

      // 🧪 Apply WHERE (basic)
      if (ast.where) {
        const { left, operator, right } = ast.where;
        const field = left.column;
        const value = right.value;

        resultData = resultData.filter(row => {
          switch (operator) {
            case "=":
              return row[field] == value;
            case ">":
              return row[field] > value;
            case "<":
              return row[field] < value;
            case ">=":
              return row[field] >= value;
            case "<=":
              return row[field] <= value;
            case "!=":
            case "<>":
              return row[field] != value;
            default:
              return false;
          }
        });
      }
    }

    // 🎯 Handle SELECT Columns
    let finalResult = [];

    if (ast.columns[0]?.expr?.column === "*") {
        
      finalResult = resultData.map(row => {
        if (typeof row === "object" && !Array.isArray(row)) {
          // Flatten joined row
          return Object.assign({}, ...Object.values(row));
        }
        return row;
      });
    } else {
        
      finalResult = resultData.map(row => {
        const selected = {};

        ast.columns.forEach(col => {
          const tableAlias = col.expr.table;
          const colName = col.expr.column;
          const alias = col.as || `${tableAlias}.${colName}`;

          if (row[tableAlias]) {
            selected[alias] = row[tableAlias][colName];
          } else if (row[colName] !== undefined) {
            selected[alias] = row[colName];
          } else {
            selected[alias] = null;
          }
        });

        return selected;
      });
    }

    res.json({ rows: finalResult });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "SQL parsing or execution failed", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
