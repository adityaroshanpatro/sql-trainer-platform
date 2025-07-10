function applyWhereFilter(data, where) {
  const { left, operator, right } = where;
  const field = left.column;
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

module.exports = { applyWhereFilter };
