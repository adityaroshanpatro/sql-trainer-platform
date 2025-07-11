function applyLimit(data, limitClause) {
  if (!limitClause || !Array.isArray(limitClause.value)) return data;

  const limitValue = limitClause.value[0]?.value;

  if (typeof limitValue !== "number") return data;

  return data.slice(0, limitValue);
}

module.exports = { applyLimit };