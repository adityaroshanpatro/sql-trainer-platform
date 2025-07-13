const { handleQueryFromAST } = require("./subqueryEvaluator");

function selectColumns(data, columns, tableDataAll) {
  // Handle SELECT * case
  if (columns[0]?.expr?.column === "*") {
    return data.map(row => Object.assign({}, ...Object.values(row)));
  }

  return data.map(row => {
    const selected = {};

    for (const col of columns) {
      const expr = col.expr;
      const alias = col.as || (expr.table ? `${expr.table}.${expr.column}` : expr.column);

      if (expr.type === "column_ref") {
        const table = expr.table;
        const column = expr.column;

        if (row[table]) {
          selected[alias] = row[table][column];
        } else if (row[column] !== undefined) {
          selected[alias] = row[column];
        } else {
          selected[alias] = null;
        }

      } else if (expr.type === "select") {
        // Scalar subquery
        const subResult = handleQueryFromAST(expr, tableDataAll);
        selected[alias] = Array.isArray(subResult) && subResult.length > 0
          ? Object.values(subResult[0])[0]
          : null;
      } else {
        selected[alias] = null;
      }
    }

    return selected;
  });
}

module.exports = { selectColumns };
