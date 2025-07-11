// utils/havingHandler.js
function applyHaving(data, havingClause) {
  if (!havingClause || havingClause.type !== "binary_expr") return data;

  const { left, operator, right } = havingClause;
  const field = left.column || left.value;
  const value = right.value;

  return data.filter(row => {
    switch (operator) {
      case "=": return row[field] == value;
      case ">": return row[field] > value;
      case "<": return row[field] < value;
      case ">=": return row[field] >= value;
      case "<=": return row[field] <= value;
      case "!=":
      case "<>": return row[field] != value;
      default: return false;
    }
  });
}

module.exports = { applyHaving };
