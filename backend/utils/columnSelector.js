function selectColumns(data, columns) {
  if (columns[0]?.expr?.column === "*") {
    return data.map(row => Object.assign({}, ...Object.values(row)));
  }

  return data.map(row => {
    const selected = {};

    columns.forEach(col => {
      const colName = col.expr.column;
      const tableAlias = col.expr.table || null;
      const alias = col.as || colName;

      if (tableAlias && row[tableAlias] && colName in row[tableAlias]) {
        selected[alias] = row[tableAlias][colName];
      } else if (colName in row) {
        selected[alias] = row[colName];
      } else {
        // Fallback: search in any nested object
        for (const obj of Object.values(row)) {
          if (obj && typeof obj === "object" && colName in obj) {
            selected[alias] = obj[colName];
            return;
          }
        }
        selected[alias] = null;
      }
    });

    return selected;
  });
}

module.exports = { selectColumns };
