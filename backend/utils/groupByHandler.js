function groupByAndAggregate(data, groupColumns, selectedColumns) {
  const grouped = {};

  // Group the rows
  for (const row of data) {
    const key = groupColumns.map(col => row[col]).join("|");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  }

  const result = [];

  for (const key in grouped) {
    const groupRows = grouped[key];
    const aggRow = {};

    for (const col of selectedColumns) {
      const expr = col.expr;
      const alias = col.as || (expr.column || expr.name);

      // Handle column references (like dept_id)
      if (expr.type === "column_ref") {
        aggRow[alias] = groupRows[0][expr.column];

      // Handle aggregate functions
      } else if (expr.type === "aggr_func") {
        const func = expr.name.toUpperCase();

        if (expr.args?.expr?.type === "star") {
          // COUNT(*)
          if (func === "COUNT") {
            aggRow[alias] = groupRows.length;
          }
        } else {
          const colName = expr.args.expr.column;
          const values = groupRows.map(r => r[colName]).filter(v => typeof v === "number");

          switch (func) {
            case "SUM":
              aggRow[alias] = values.reduce((a, b) => a + b, 0);
              break;
            case "AVG":
              aggRow[alias] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
              break;
            case "MIN":
              aggRow[alias] = values.length ? Math.min(...values) : null;
              break;
            case "MAX":
              aggRow[alias] = values.length ? Math.max(...values) : null;
              break;
            case "COUNT":
              aggRow[alias] = values.length;
              break;
            default:
              aggRow[alias] = null;
          }
        }
      }
    }

    result.push(aggRow);
  }

  return result;
}

module.exports = { groupByAndAggregate };
