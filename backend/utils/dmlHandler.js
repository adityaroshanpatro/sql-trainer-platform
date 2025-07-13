const fs = require("fs");
const path = require("path");

function getTablePath(tableName) {
  return path.join(__dirname, "..", "data", `${tableName}.json`);
}

function handleInsert(ast) {
  const table = ast.table[0].table;
  const columns = ast.columns;
  const values = ast.values[0].value.map(v => v.value);

  const newRow = {};
  columns.forEach((col, i) => {
    newRow[col] = values[i];
  });

  const filePath = getTablePath(table);
  const data = JSON.parse(fs.readFileSync(filePath));
  data.push(newRow);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  return { message: "Row inserted successfully", inserted: newRow };
}

function handleUpdate(ast) {
  const table = ast.table[0].table;
  const updates = ast.set;
  const where = ast.where;

  const filePath = getTablePath(table);
  let data = JSON.parse(fs.readFileSync(filePath));

  let updatedCount = 0;

  data = data.map(row => {
    if (!evaluateWhere(row, where)) return row;

    updatedCount++;
    updates.forEach(u => {
      row[u.column] = u.value.value;
    });
    return row;
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return { message: `Updated ${updatedCount} row(s)` };
}

function handleDelete(ast) {
  const table = ast.from[0].table;
  const where = ast.where;

  const filePath = getTablePath(table);
  const data = JSON.parse(fs.readFileSync(filePath));

  const remaining = data.filter(row => !evaluateWhere(row, where));
  const deletedCount = data.length - remaining.length;

  fs.writeFileSync(filePath, JSON.stringify(remaining, null, 2));
  return { message: `Deleted ${deletedCount} row(s)` };
}

function evaluateWhere(row, clause) {
  if (!clause) return true;

  const field = clause.left?.column;
  const value = clause.right?.value;
  switch (clause.operator) {
    case "=":
      return row[field] == value;
    case "!=":
    case "<>":
      return row[field] != value;
    case ">":
      return row[field] > value;
    case "<":
      return row[field] < value;
    default:
      return false;
  }
}

module.exports = {
  handleInsert,
  handleUpdate,
  handleDelete,
};
