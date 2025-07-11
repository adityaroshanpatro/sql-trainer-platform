function applyOrderBy(data, orderby) {
  if (!orderby || !Array.isArray(orderby)) return data;

  return data.sort((a, b) => {
    for (const clause of orderby) {
      const col = clause.expr.column;
      const direction = (clause.type || "ASC").toUpperCase();

      const valA = a[col];
      const valB = b[col];

      if (valA === valB) continue;

      if (direction === "ASC") {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    }
    return 0;
  });
}

module.exports = { applyOrderBy };
