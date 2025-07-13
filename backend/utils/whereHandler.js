function applyWhereFilter(data, whereClause) {
  return data.filter(row => evaluateCondition(whereClause, row));
}

function evaluateCondition(expr, row) {
  if (!expr) return true;

  switch (expr.type) {
    case "binary_expr":
      return evalBinary(expr, row);
    case "in_expr":
      return evalIn(expr, row);
    case "between_expr":
      return evalBetween(expr, row);
    case "like_expr":
      return evalLike(expr, row);
    case "logical_expr":
      return evalLogical(expr, row);
    default:
      return true;
  }
}

function evalBinary(expr, row) {
  const field = expr.left.column;
  const value = expr.right.value;

  switch (expr.operator) {
    case "=":
      return row[field] == value;
    case "!=":
    case "<>":
      return row[field] != value;
    case ">":
      return row[field] > value;
    case "<":
      return row[field] < value;
    case ">=":
      return row[field] >= value;
    case "<=":
      return row[field] <= value;
    default:
      return false;
  }
}

function evalIn(expr, row) {
  const field = expr.left.column;
  const values = expr.right.value.map(v => {
    if (v.type === "number" || v.type === "string") {
      return v.value;
    }
    return null;
  });

  return values.includes(row[field]);
}

function evalBetween(expr, row) {
  const field = expr.expr.column;
  const [low, high] = [expr.left.value, expr.right.value];
  const val = row[field];
  return val >= low && val <= high;
}

function evalLike(expr, row) {
  const field = expr.left.column;
  const pattern = expr.right.value.replace(/%/g, ".*"); // convert SQL % to regex .*
  const regex = new RegExp(`^${pattern}$`, "i"); // case-insensitive
  return regex.test(row[field]);
}

function evalLogical(expr, row) {
  const left = evaluateCondition(expr.left, row);
  const right = evaluateCondition(expr.right, row);

  switch (expr.operator.toUpperCase()) {
    case "AND":
      return left && right;
    case "OR":
      return left || right;
    default:
      return false;
  }
}

module.exports = {
  applyWhereFilter,
  evaluateCondition
};
