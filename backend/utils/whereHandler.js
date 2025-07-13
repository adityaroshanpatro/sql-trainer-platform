const { handleQueryFromAST } = require("./subqueryEvaluator");

function evaluateCondition(expr, row, tableData) {
  switch (expr.type) {
    case "binary_expr":
      return evalBinary(expr, row, tableData);
    case "in_expr":
      return evalIn(expr, row);
    case "between_expr":
      return evalBetween(expr, row);
    case "like_expr":
      return evalLike(expr, row);
    case "logical_expr":
      return evalLogical(expr, row, tableData);
    default:
      return true;
  }
}

function evalBinary(expr, row, tableData) {
  let { operator, left, right } = expr;
  const field = left.column;
  const leftValue = row[field] ?? Object.values(row)[0]?.[field];
  let rightValue;

  if (right.ast) {
    // ✅ Scalar subquery
    const subResult = handleQueryFromAST(right.ast, tableData);
    if (Array.isArray(subResult) && subResult.length > 0) {
      const val = Object.values(subResult[0])[0];
      console.log("Subquery result:", val);
      rightValue = val;
    } else {
      rightValue = null;
    }
  } else {
    // Normal constant
    rightValue = right.value;
  }

  // Apply the operator
  switch (operator) {
    case "=": return leftValue == rightValue;
    case "!=":
    case "<>": return leftValue != rightValue;
    case ">": return leftValue > rightValue;
    case "<": return leftValue < rightValue;
    case ">=": return leftValue >= rightValue;
    case "<=": return leftValue <= rightValue;
    default: return false;
  }
}

function applyWhereFilter(data, whereClause, tableData) {
  return data.filter(row => evaluateCondition(whereClause, row, tableData));
}

module.exports = { applyWhereFilter };
