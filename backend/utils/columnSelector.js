function selectColumns(data, columns) {
  if (columns[0]?.expr?.column === "*") {
    return data.map(row => Object.assign({}, ...Object.values(row)));
  }

  return data.map(row => {
    const selected = {};
    columns.forEach(col => {
      const table = col.expr.table;
      const column = col.expr.column;
      const alias = col.as || `${table}.${column}`;
      if (row[table]) selected[alias] = row[table][column];
      else selected[alias] = null;
    });
    return selected;
  });
}

module.exports = { selectColumns };
