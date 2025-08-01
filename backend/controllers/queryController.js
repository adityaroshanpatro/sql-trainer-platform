const { Parser } = require("node-sql-parser");
const { loadTables } = require("../utils/tableLoader");
const { handleJoinQuery } = require("../utils/joinHandler");
const { applyWhereFilter } = require("../utils/whereHandler");
const { selectColumns } = require("../utils/columnSelector");
const { groupByAndAggregate } = require("../utils/groupByHandler");
const { applyOrderBy } = require("../utils/orderByHandler");
const { applyLimit } = require("../utils/limitHandler");
const { applyHaving } = require("../utils/havingHandler");
const { removeDuplicates } = require("../utils/deduplicate");
const {
  handleInsert,
  handleUpdate,
  handleDelete,
} = require("../utils/dmlHandler");
const path = require("path");
const fs = require("fs");

function handleQuery(req, res) {
  const parser = new Parser();
  const { sql } = req.body;

  if (!sql) return res.status(400).json({ error: "Missing SQL query" });

  try {
    const ast = parser.astify(sql)[0];
    console.log("AST: ",JSON.stringify(ast, null, 2))
    if (ast.type === "insert") {
      const result = handleInsert(ast);
      return res.json(result);
    }
    
    if (ast.type === "update") {
      const result = handleUpdate(ast);
      return res.json(result);
    }
    
    if (ast.type === "delete") {
      const result = handleDelete(ast);
      return res.json(result);
    }
    const tables = ast.from.map(entry => ({
      name: entry.table,
      alias: entry.as || entry.table
    }));
    const tableData = loadTables(tables);

    let resultData;

    if (ast.from.length === 2 && ast.from[1].join) {
      resultData = handleJoinQuery(ast, tableData);
    } else {
      const mainAlias = tables[0].alias;
      resultData = tableData[mainAlias];
      if (ast.where) {
        console.log("*********************************************")
        resultData = applyWhereFilter(resultData, ast.where, tableData);
      }
    }

    if (ast.groupby) {
      const groupCols = ast.groupby.columns.map(g => g.column);
      let finalResult = groupByAndAggregate(resultData, groupCols, ast.columns);
      finalResult = applyHaving(finalResult, ast.having);
      finalResult = applyOrderBy(finalResult, ast.orderby);
      finalResult = applyLimit(finalResult, ast.limit);
      

      return res.json({ rows: finalResult });
   }

    // SELECT
   
    let finalResult = selectColumns(resultData, ast.columns);
    if (ast.distinct) {
        finalResult = removeDuplicates(finalResult);
    }
 
    // ORDER BY
    
    finalResult = applyOrderBy(finalResult, ast.orderby);

    finalResult = applyLimit(finalResult, ast.limit);

    return res.json({ rows: finalResult });

  } catch (err) {
    res.status(500).json({ error: "SQL parsing or execution failed", details: err.message });
  }
}

function handleTableQuery(req, res) {
  const dataDir = path.join(__dirname, "..", "data");

  fs.readdir(dataDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read tables", details: err.message });
    }

    const tables = [];

    for (const file of files) {
      if (file.endsWith(".json")) {
        const tableName = path.basename(file, ".json");
        try {
          const filePath = path.join(dataDir, file);
          const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          tables.push({ [tableName]: data });
        } catch (readErr) {
          return res.status(500).json({ error: `Failed to read ${file}`, details: readErr.message });
        }
      }
    }

    return res.json({ tables });
  });
}

module.exports = { handleQuery, handleTableQuery };
