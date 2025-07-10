function groupByAndAggregate(data, groupByColumns, selectColumns) {
  const groups = {};

  // Grouping
  data.forEach(row => {
    const key = groupByColumns.map(col => row[col]).join("|");
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  });

  // Aggregation
  const results = [];

  for (const [key, rows] of Object.entries(groups)) {
    const groupResult = {};

    groupByColumns.forEach(col => {
      groupResult[col] = rows[0][col]; // same value across group
    });

    selectColumns.forEach(col => {
      const expr = col.expr;
      const alias = col.as || (expr.type === "aggr_func"
        ? `${expr.name.toLowerCase()}(${expr.args.expr.column})`
        : expr.column);

      if (expr.type === "aggr_func") {
        const values = rows.map(r => r[expr.args.expr.column]);

        switch (expr.name.toUpperCase()) {
          case "COUNT":
            groupResult[alias] = values.length;
            break;
          case "SUM":
            groupResult[alias] = values.reduce((a, b) => a + b, 0);
            break;
          case "AVG":
            groupResult[alias] = values.reduce((a, b) => a + b, 0) / values.length;
            break;
          default:
            groupResult[alias] = null;
        }
      }
    });

    results.push(groupResult);
  }

  return results;
}

module.exports = { groupByAndAggregate };