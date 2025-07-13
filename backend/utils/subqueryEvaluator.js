function handleQueryFromAST(ast, tableDataAll) {
  if (!ast.from || !Array.isArray(ast.from)) return [];

  const tables = ast.from.map(entry => ({
    name: entry.table,
    alias: entry.as || entry.table,
  }));

  // Ensure all required table data is available
  for (const t of tables) {
    if (!tableDataAll[t.alias]) return [];
  }

  const mainAlias = tables[0].alias;
  let resultData = tableDataAll[mainAlias];

  // Basic WHERE clause evaluation (supports only one condition)
  if (ast.where) {
    const { left, operator, right } = ast.where;
    const field = left.column;
    const value = right.value;

    resultData = resultData.filter(row => {
      switch (operator) {
        case "=": return row[field] == value;
        case "!=":
        case "<>": return row[field] != value;
        case ">": return row[field] > value;
        case "<": return row[field] < value;
        case ">=": return row[field] >= value;
        case "<=": return row[field] <= value;
        default: return false;
      }
    });
  }

  // Handle simple scalar aggregation (AVG, MIN, MAX, COUNT)
  const columnExpr = ast.columns[0]?.expr;
  if (columnExpr?.type === "aggr_func") {
    const func = columnExpr.name.toUpperCase();
    const col = columnExpr.args.expr.column;

    const values = resultData.map(row => row[col]).filter(v => v !== null && v !== undefined);

    switch (func) {
      case "AVG":
        return [{ [func]: values.reduce((a, b) => a + b, 0) / values.length }];
      case "SUM":
        return [{ [func]: values.reduce((a, b) => a + b, 0) }];
      case "MAX":
        return [{ [func]: Math.max(...values) }];
      case "MIN":
        return [{ [func]: Math.min(...values) }];
      case "COUNT":
        return [{ [func]: values.length }];
      default:
        return [];
    }
  }

  // Fallback: return values of first column
  const field = columnExpr?.column;
  return resultData.map(row => ({ [field]: row[field] }));
}

module.exports = { handleQueryFromAST };
