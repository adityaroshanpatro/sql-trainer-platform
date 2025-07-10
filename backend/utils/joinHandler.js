function handleJoinQuery(ast, tableData) {
  const left = ast.from[0];
  const right = ast.from[1];

  let leftAlias = left.as || left.table;
  let rightAlias = right.as || right.table;

  let leftData = tableData[leftAlias];
  let rightData = tableData[rightAlias];
  let joinType = right.join.toUpperCase();

  const resultData = [];

  if (joinType === "CROSS JOIN") {
    for (const l of leftData) {
      for (const r of rightData) {
        resultData.push({ [leftAlias]: l, [rightAlias]: r });
      }
    }
    return resultData;
  }

  let leftField = right.on.left.column;
  let rightField = right.on.right.column;

  if (joinType === "RIGHT JOIN") {
    [leftAlias, rightAlias] = [rightAlias, leftAlias];
    [leftData, rightData] = [rightData, leftData];
    [leftField, rightField] = [rightField, leftField];
    joinType = "LEFT JOIN";
  }

  const matches = new Set();
  for (const l of leftData) {
    let matched = false;
    for (const r of rightData) {
      if (l[leftField] === r[rightField]) {
        matched = true;
        matches.add(JSON.stringify(r));
        resultData.push({ [leftAlias]: l, [rightAlias]: r });
      }
    }
    if (!matched && joinType === "LEFT JOIN") {
      resultData.push({ [leftAlias]: l, [rightAlias]: null });
    }
  }

  if (right.join.toUpperCase() === "FULL OUTER JOIN") {
    for (const r of rightData) {
      if (!matches.has(JSON.stringify(r))) {
        resultData.push({ [leftAlias]: null, [rightAlias]: r });
      }
    }
  }

  return resultData;
}

module.exports = { handleJoinQuery };
